export const ESGLITE_SECTIONS = [
  { code: 'A1', title: 'Company basics (demo)' },
  { code: 'B',  title: 'Environmental (demo)' },
  { code: 'B1', title: 'Operational metrics (demo)' },
] as const;
export type SectionCode = typeof ESGLITE_SECTIONS[number]['code'];
export const ESGLITE_ITEMS: Record<SectionCode, { code:string; title:string }[]> = {
  A1: [{ code:'A1-01', title:'Company name' }],
  B:  [{ code:'B-01',  title:'Energy' }],
  B1: [{ code:'B1-01', title:'Employees' }],
};
