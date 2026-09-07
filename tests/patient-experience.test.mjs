import test from 'node:test';
import assert from 'node:assert/strict';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import {
  handoffLink,
  linkPreferences,
  upcomingCare,
  suggestedGuides,
  appointmentKey,
  validAppointment,
  spanishCare,
  spanishWarnings,
} from '../lib/patient-experience.mjs';
import {
  createPatientLink,
  readPatientLink,
  readHandouts,
  patientForm,
} from '../lib/patient-link.mjs';
import { calculate } from '../lib/pregnancy.mjs';
import { handouts } from '../lib/handouts.mjs';
import { careSchedule, warningSigns } from '../lib/care-plan.mjs';
test('handoff keeps legacy link compatibility, handouts and private fragment', () => {
  const url = new URL(
    handoffLink(
      createPatientLink('https://example.com/?visit=1', '2027-05-03', [
        handouts[0].id,
      ]),
      'es',
      true,
      '2026-09-07',
    ),
  );
  assert.equal(url.search, '');
  assert.equal(readPatientLink(url.hash), '2027-05-03');
  assert.deepEqual(readHandouts(url.hash), [handouts[0].id]);
  assert.deepEqual(linkPreferences(url.hash), {
    language: 'es',
    assigned: true,
    issued: '2026-09-07',
  });
  assert.equal(
    linkPreferences(
      new URL(handoffLink(url.href, 'en', false, '2026-09-07')).hash,
    ).assigned,
    false,
  );
  assert.equal(linkPreferences('#v=1&due=2027-05-03').assigned, false);
});
test('QR round trip preserves full patient payload even with all handouts', () => {
  const link = handoffLink(
    createPatientLink(
      'https://pregnancy-calculator-self.vercel.app/',
      '2027-05-03',
      handouts.map((h) => h.id),
    ),
    'es',
    true,
    '2026-09-07',
  );
  const qr = QRCode.create(link, { errorCorrectionLevel: 'M' });
  const scale = 5,
    size = (qr.modules.size + 8) * scale,
    data = new Uint8ClampedArray(size * size * 4).fill(255);
  for (let y = 0; y < qr.modules.size; y++)
    for (let x = 0; x < qr.modules.size; x++)
      if (qr.modules.get(y, x))
        for (let dy = 0; dy < scale; dy++)
          for (let dx = 0; dx < scale; dx++) {
            const i =
              (((y + 4) * scale + dy) * size + (x + 4) * scale + dx) * 4;
            data[i] = data[i + 1] = data[i + 2] = 0;
          }
  assert.equal(jsQR(data, size, size)?.data, link);
});
test('current care windows retire and next care is shown at boundaries', () => {
  const r = calculate(patientForm('2027-05-03', '2027-04-05'));
  assert.equal(r.weeks, 36);
  assert.equal(upcomingCare(r)[0].id, 'weekly');
  assert.equal(
    upcomingCare(calculate(patientForm('2027-05-03', '2027-05-04')))[0].id,
    'past-due',
  );
});
test('Spanish suggestions use existing Spanish documents without relabeling English PDFs', () => {
  const docs = suggestedGuides(10, 'es', [
    handouts.find((h) => h.language === 'English').id,
  ]);
  assert.ok(docs.length > 0);
  assert.ok(docs.every((h) => h.language === 'Español'));
  const selected = handouts.find((h) => h.language === 'English');
  assert.equal(suggestedGuides(30, 'en', [selected.id])[0].id, selected.id);
});
test('appointments are isolated by due date and reject malformed dates', () => {
  assert.notEqual(appointmentKey('2027-05-03'), appointmentKey('2027-05-04'));
  assert.ok(validAppointment('2027-05-03T09:30'));
  for (const value of [
    '',
    null,
    '2027-02-30T09:00',
    '2027-05-03',
    '2027-05-03T99:00',
  ])
    assert.equal(validAppointment(value), false);
});
test('Spanish clinical copy covers all stages and warning signs', () => {
  assert.equal(spanishCare.length, careSchedule.length);
  assert.equal(spanishWarnings.length, warningSigns.length);
  for (const entry of spanishCare) {
    assert.equal(typeof entry[0], 'string');
    assert.ok(entry[1].length > 0);
  }
});
