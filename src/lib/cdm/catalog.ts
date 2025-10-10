// src/lib/cdm/catalog.ts

export type ItemEntry = { code: string; title: string };
export type SectionEntry = {
  code: string;
  title: string;
  items: ItemEntry[];
};

// NB! Demo-andmed. Lisa / muuda hiljem vabalt.
const SECTIONS: SectionEntry[] = [
  {
    code: 'B1',
    title: 'Basis for preparation',
    items: [
      { code: 'B1-1', title: 'Describe preparation basis' },
      { code: 'B1-2', title: 'Provide governance context' },
    ],
  },
  { code: 'B2', title: 'Practices & initiatives', items: [] },
  { code: 'B3', title: 'Energy & GHG', items: [] },
  { code: 'B4', title: 'Pollution of air, water and soil', items: [] },
];

// --- Ekspordid, mida UI ja API eeldavad ---
export function listSections(): { code: string; title: string }[] {
  return SECTIONS.map(({ code, title }) => ({ code, title }));
}

export function getSection(sectionCode: string): SectionEntry | undefined {
  return SECTIONS.find((s) => s.code === sectionCode);
}

export function listItems(sectionCode: string): ItemEntry[] {
  return getSection(sectionCode)?.items ?? [];
}

// kasutatakse progressi arvutuses (nt /api/cdm/section-status)
export function listItemCodes(sectionCode: string): string[] {
  return listItems(sectionCode).map((i) => i.code);
}
