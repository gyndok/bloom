import catalog from './handouts.json' with {type:'json'};
export const handouts=catalog;
export const categories=[...new Set(catalog.map(x=>x.category))];
export const welcome=handouts.find(x=>x.welcome);
export function normalizeHandouts(ids){if(!Array.isArray(ids)||ids.length>60)throw Error('Choose up to 60 handouts.');return [...new Set(ids.filter(id=>typeof id==='string'&&handouts.some(h=>h.id===id)))];}
export function filterHandouts(query='',category='All',language='All'){const words=query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);return handouts.filter(h=>(category==='All'||h.category===category)&&(language==='All'||h.language===language)&&words.every(w=>`${h.title} ${h.description} ${h.category} ${h.sourceFile}`.toLocaleLowerCase().includes(w)));}
