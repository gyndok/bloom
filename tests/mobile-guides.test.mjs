import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { guides, readingUrl, hasMobileGuide } from '../lib/mobile-guides.mjs';
import { handouts } from '../lib/handouts.mjs';
test('converted guides match the exact source PDFs; other documents retain original links', () => {
  assert.equal(Object.keys(guides).length, 3);
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
