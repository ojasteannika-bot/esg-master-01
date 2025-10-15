export type Section = { code: string; title: string };

export const ESGLITE_SECTIONS: Section[] = [
  { code: 'A1', title: 'Company basics (demo)' },
  { code: 'B',  title: 'Environmental (demo)' },
  { code: 'B1', title: 'Operational metrics (demo)' },
];

// ajutine alias, et vana kood ei kukuks (ESLITE vs ESGLITE)
export const ESLITE_SECTIONS = ESGLITE_SECTIONS;
