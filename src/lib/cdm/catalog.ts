// src/lib/cdm/catalog.ts
// Lihtne “kataloog”: sektsioonid + nende items (kood ja pealkiri)

export type Section = { code: string; title: string };
export type Item = { code: string; title: string; section: string };

const SECTIONS: Section[] = [
  { code: 'B1', title: 'Basis for preparation' },
  { code: 'B2', title: 'Practices & initiatives' },
  { code: 'B3', title: 'Energy & GHG' },
  { code: 'B4', title: 'Pollution of air, water and soil' },
];

const ITEMS: Item[] = [
  { code: 'B1-1', section: 'B1', title: 'B1-1 — Intro & scope' },
  { code: 'B1-2', section: 'B1', title: 'B1-2 — Reporting boundary' },

  { code: 'B2-1', section: 'B2', title: 'B2-1 — Policies' },
  { code: 'B2-2', section: 'B2', title: 'B2-2 — Actions' },

  { code: 'B3-1', section: 'B3', title: 'B3-1 — Energy use' },
  { code: 'B3-2', section: 'B3', title: 'B3-2 — GHG overview' },

  { code: 'B4-1', section: 'B4', title: 'B4-1 — Emissions to air' },
  { code: 'B4-2', section: 'B4', title: 'B4-2 — Water & soil' },
];

// --- API ---
export function getSections(): Section[] {
  return SECTIONS;
}
export function getSection(code: string): Section | undefined {
  return SECTIONS.find(s => s.code === code);
}
export function getItems(sectionCode: string): Item[] {
  return ITEMS.filter(i => i.section === sectionCode);
}
// mõnel komponendil mugav ka kõiki saada
export function listItems(): Item[] {
  return ITEMS.slice();
}
