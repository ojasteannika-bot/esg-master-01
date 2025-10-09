// src/data/vsme.ts

export type SectionCode = 'a' | 'b' | 'b1';

export type Section = {
  code: SectionCode;
  title: string;
  subtitle?: string;
  /** Valikuline otsetee lehele (kasulik navigeerimiseks) */
  href?: string;
};

/** VSME jaotised, mida menüüs/loendis näitame */
const SECTIONS: Record<SectionCode, Section> = {
  a: {
    code: 'a',
    title: 'Section A',
    subtitle: 'Static form',
    href: '/questionnaires/vsme/a',
  },
  b: {
    code: 'b',
    title: 'Section B',
    subtitle: 'Static form',
    href: '/questionnaires/vsme/b',
  },
  b1: {
    code: 'b1',
    title: 'Section B1 (dynamic)',
    subtitle: 'Loads by code=b1',
    href: '/questionnaires/vsme/b1',
  },
};

/** Tagasta kõik jaotised (loendis kuvamiseks) */
export function listSections(): Section[] {
  return Object.values(SECTIONS);
}

/** Leia üks jaotis koodi järgi */
export function getSection(code: string): Section | undefined {
  return SECTIONS[code as SectionCode];
}
