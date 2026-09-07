import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { guides, readingUrl, hasMobileGuide } from '../lib/mobile-guides.mjs';
import { handouts } from '../lib/handouts.mjs';
test('converted guides match the exact source PDFs; other documents retain original links', () => {
  assert.equal(Object.keys(guides).length, 54);
  for (const doc of handouts) {
    if (hasMobileGuide(doc.id)) {
      assert.equal(readingUrl(doc), `/guides/${doc.id}`);
      assert.equal(
        createHash('sha256')
          .update(readFileSync(new URL('../public' + doc.url, import.meta.url)))
          .digest('hex'),
        guides[doc.id].sourceSha256,
      );
    } else assert.equal(readingUrl(doc), doc.url);
  }
});
test('urgent source details and after-hours instructions survive conversion', () => {
  const text = JSON.stringify(guides['7d319ac9']);
  for (const passage of [
    'Thoughts of harming yourself or others',
    'soaking 1 pad/hour or large clots',
    'Fewer than 10 movements in 2 hours',
    'after 28 weeks',
    'Temperature ≥ 100.4°F',
    'Follow the answering service instructions',
  ])
    assert.ok(text.includes(passage), passage);
  assert.equal(guides['7d319ac9'].sections[0].tone, 'emergency');
});
test('source review dates are not fabricated and multi-page vaccine ending is included', () => {
  assert.equal(guides['28bc72c9'].reviewDate, null);
  assert.equal(guides['7d319ac9'].reviewDate, null);
  assert.equal(guides['14a92cf3'].reviewDate, 'June 2026');
  const text = JSON.stringify(guides['14a92cf3']);
  for (const passage of [
    'Vaccines do not cause autism or infertility.',
    'No question is too small.',
    'wait 4 weeks',
    'Sept–Jan',
    'After delivery',
  ])
    assert.ok(text.includes(passage), passage);
});

test('RSV mobile guidance includes prior-pregnancy eligibility and season', () => {
  for (const id of ['14a92cf3', '28bc72c9']) {
    const text = JSON.stringify(guides[id]);
    assert.ok(text.includes('CDC does not recommend another dose'));
    assert.ok(text.includes('September'));
    assert.ok(text.includes('36 weeks 6 days'));
    assert.ok(guides[id].guidanceUrl.startsWith('https://www.cdc.gov/'));
  }
  assert.ok(
    !JSON.stringify(guides['14a92cf3']).includes(
      'three vaccines, every pregnancy',
    ),
  );
});

test('all 54 handouts have readers and every reflowed source page is retained', () => {
  assert.equal(Object.keys(guides).length, handouts.length);
  for (const doc of handouts) {
    const g = guides[doc.id];
    assert.ok(g, doc.id);
    if (g.conversion === 'reflow') {
      assert.equal(g.sections.length, doc.pages);
      for (const s of g.sections) {
        assert.ok(s.blocks.length > 0);
        assert.ok(
          readFileSync(new URL('../public' + s.sourceImage, import.meta.url))
            .length > 1000,
        );
        assert.ok(s.imageWidth > 500);
      }
    }
    assert.ok(!JSON.stringify(g).includes('file:///'));
  }
});
test('weight and glucose table values retain their row relationships', () => {
  const weight = guides['fae524e6'].sections[0].blocks.find(
    (b) => b.type === 'table',
  );
  assert.deepEqual(
    weight.rows.find((r) => r[0] === '≥30'),
    ['≥30', 'Obese', '11–20 lbs'],
  );
  const glucose = guides['8afcfece'].sections[0].blocks.find(
    (b) => b.type === 'table',
  );
  assert.deepEqual(
    glucose.rows.find((r) => r[0] === 'Fasting (before breakfast)'),
    ['Fasting (before breakfast)', '≤95 mg/dL'],
  );
});
test('multi-column warning symptoms follow their warning heading', () => {
  const blocks = guides['38421fee'].sections[0].blocks;
  const heading = blocks.findIndex((b) => b.text?.includes('CALL YOUR DOCTOR'));
  const severe = blocks.findIndex((b) =>
    b.text?.includes('Unable to keep any fluids down'),
  );
  assert.ok(severe > heading);
  assert.ok(
    !blocks.slice(heading + 1, severe).some((b) => b.type === 'heading'),
  );
});
