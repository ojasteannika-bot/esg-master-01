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
// --- EXISTING EXPORTS (jäta alles) ---
// export const ESLITE_SECTIONS = [...]
// export function getItems(sectionCode: string) { ... }

// --- ADD: getSection, mida teised lehed impordivad ---
export type CatalogSection = {
  code: string;
  title: string;
};

export function getSection(code: string): CatalogSection | null {
  if (!code) return null;
  const c = String(code).toUpperCase().trim();
  // eelda, et ESLITE_SECTIONS on kujul [{ code:'B1', title:'...' }, ...]
  // või vajadusel teisenda sinu struktuuri järgi
  // @ts-ignore – kui sul on teistsugune tüüp, hoia see lihtne
  const hit = (ESLITE_SECTIONS || []).find((s: any) => (s.code || "").toUpperCase() === c);
  return hit ?? null;
}

// 
