// src/lib/cdm/catalog.ts
export type Item = { code: string; title: string; section: string };
export type Section = { code: string; title: string; items: Item[] };

// Minimaalne demo-kataloog (laienda hiljem kui vaja)
export const ESGLITE_SECTIONS: Section[] = [
  {
    code: 'B1',
    title: 'Basis for preparation',
    items: [
      { code: 'B1-1', title: 'B1-1 item', section: 'B1' },
      { code: 'B1-2', title: 'B1-2 item', section: 'B1' },
    ],
  },
  { code: 'B2', title: 'Practices & initiatives', items: [] },
  { code: 'B3', title: 'Energy & GHG', items: [] },
  { code: 'B4', title: 'Pollution of air, water and soil', items: [] },
];

// Mugavad API-d (mida meie serveri route’id kasutavad)
export function getSections(): Section[] {
  return ESGLITE_SECTIONS;
}

export function getSection(code: string): Section | undefined {
  return ESGLITE_SECTIONS.find(s => s.code === code);
}

export function getItems(sectionCode: string): Item[] {
  return getSection(sectionCode)?.items ?? [];
}

export function listItems(sectionCode: string): Item[] {
  // alias – mõned route’id võivad seda nime otsida
  return getItems(sectionCode);
}

export function findItem(code: string): { section: Section; item: Item } | undefined {
  for (const section of ESGLITE_SECTIONS) {
    const item = section.items.find(i => i.code === code);
    if (item) return { section, item };
  }
  return undefined;
}
