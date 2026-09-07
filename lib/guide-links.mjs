import ids from './mobile-guide-index.json' with { type: 'json' };
const available = new Set(ids);
export function readingUrl(doc) {
  return available.has(doc.id) ? `/guides/${doc.id}` : doc.url;
}
export function hasMobileGuide(id) {
  return available.has(id);
}
