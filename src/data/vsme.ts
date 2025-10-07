// src/data/vsme.ts
export type Section = {
  code: 'a' | 'b' | 'b1';
  title: string;
  subtitle?: string;
};

const SECTIONS: Record<Section['code'], Section> = {
  a:  { code: 'a',  title: 'Section A',  subtitle: 'Static form' },
  b:  { code: 'b',  title: 'Section B',  subtitle: 'Static form' },
  b1: { code: 'b1', title: 'Section B1 (dynamic)', subtitle: 'Loads by code=b1' },
};

export function listSections(): Section[] {
  return Object.values(SECTIONS);
}

export function getSection(code: string): Section | undefined {
  return SECTIONS[code as Section['code']];
}
