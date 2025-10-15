// src/lib/cdm/catalog.ts
export type Item = { code: string; title: string; section: 'A'|'B'|'B1' };
export type SectionCode = 'A'|'B'|'B1';
export type SectionMeta = { code: SectionCode; title: string; note?: string; items: string[] };

const ITEMS: Item[] = [
  // A (minimaalne)
  { code: 'A1-1', title: 'About the company — basics', section: 'A' },

  // B (näidis)
  { code: 'B1-1', title: 'Environmental basics — E1', section: 'B' },

  // B1 (näidis)
  { code: 'B1-2', title: 'Operational metric — OM1', section: 'B1' },
];

const SECTIONS: SectionMeta[] = [
  { code: 'A',  title: 'Company basics',     note: 'DEMO', items: ITEMS.filter(i=>i.section==='A').map(i=>i.code) },
  { code: 'B',  title: 'Environmental',      note: 'DEMO', items: ITEMS.filter(i=>i.section==='B').map(i=>i.code) },
  { code: 'B1', title: 'Operational metrics',               items: ITEMS.filter(i=>i.section==='B1').map(i=>i.code) },
];

export function getSections(): SectionMeta[] {
  return SECTIONS;
}

export function getSectionMeta(code: string): SectionMeta|undefined {
  return SECTIONS.find(s => s.code.toLowerCase() === code.toLowerCase());
}

export function getItems(sectionCode: string): Item[] {
  const sec = getSectionMeta(sectionCode);
  if (!sec) return [];
  return ITEMS.filter(i => i.section.toLowerCase() === sec.code.toLowerCase());
}
