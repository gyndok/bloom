import guides from './mobile-guides.json' with { type: 'json' };
export { guides };
export function readingUrl(doc) {
  return guides[doc.id] ? `/guides/${doc.id}` : doc.url;
}
export function hasMobileGuide(id) {
  return Object.hasOwn(guides, id);
}
