// src/lib/cdm/catalog.ts
export type Section = { code: string; title: string };
export type Item = { code: string; title: string; section: string };

// NB: need nimed peavad eksisteerima – CI importis just nende nimedega
export const ESGLITE_SECTIONS: Section[] = [
  { code: 'B1', title: 'Basis for preparation' },
  { code: 'B2', title: 'Practices & initiatives' },
  { code: 'B3', title: 'Energy & GHG' },
  { code: 'B4', title: 'Pollution of air, water and soil' },
];

const ESGLITE_ITEMS: Item[] = [
  { code: 'B1-1', title: 'B1-1 demo', section: 'B1' },
  { code: 'B1-2', title: 'B1-2 demo', section: 'B1' },
  // lisa siia edaspidi
];

export function getSections(): Section[] {
  return ESGLITE_SECTIONS;
}

export function getItems(sectionCode: string): Item[] {
  return ESGLITE_ITEMS.filter(i => i.section === sectionCode);
}

export function listItems(): Item[] {
  return ESGLITE_ITEMS.slice();
}
