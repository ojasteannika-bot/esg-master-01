export type Field =
  | { key: string; label: string; type: 'text'; required?: boolean }
  | { key: string; label: string; type: 'number'; required?: boolean }
  | { key: string; label: string; type: 'select'; options: string[]; required?: boolean }
  | { key: string; label: string; type: 'file'; accept?: string; multiple?: boolean; required?: boolean };

export type ItemSchema = { code: string; title: string; fields: Field[] };

/** A1-1 */
const A1_1: ItemSchema = {
  code: 'A1-1',
  title: 'About the company — basics',
  fields: [
    { key: 'q1', label: 'Company name', type: 'text', required: true },
    { key: 'q2', label: 'Registration number', type: 'text' },
    { key: 'sector', label: 'Sector (EMTAK/industry)', type: 'select', options: ['Manufacturing','Logistics','Construction','Services','Other'] },
    { key: 'reg_doc', label: 'Registration extract (PDF/jpg)', type: 'file', accept: '.pdf,.jpg,.jpeg,.png' }
  ]
};

/** A1-2 */
const A1_2: ItemSchema = {
  code: 'A1-2',
  title: 'Headcount and locations',
  fields: [
    { key: 'fte', label: 'Employees (FTE)', type: 'number', required: true },
    { key: 'hq_city', label: 'HQ city', type: 'text' },
    { key: 'sites', label: 'Number of sites', type: 'number' }
  ]
};

/** A1-3 */
const A1_3: ItemSchema = {
  code: 'A1-3',
  title: 'Financial overview (last FY)',
  fields: [
    { key: 'revenue', label: 'Revenue (€)', type: 'number', required: true },
    { key: 'ebitda', label: 'EBITDA (€)', type: 'number' },
    { key: 'fiscal_year', label: 'Fiscal year (YYYY)', type: 'number' }
  ]
};

const ORDER = ['A1-1','A1-2','A1-3'];

export function getItemSchema(code: string): ItemSchema | null {
  switch (code) {
    case 'A1-1': return A1_1;
    case 'A1-2': return A1_2;
    case 'A1-3': return A1_3;
    default: return null;
  }
}
export function getNextCode(code: string): string | null {
  const i = ORDER.indexOf(code);
  return i >= 0 && i < ORDER.length - 1 ? ORDER[i+1] : null;
}
export function getPrevCode(code: string): string | null {
  const i = ORDER.indexOf(code);
  return i > 0 ? ORDER[i-1] : null;
}
/** Section helpers (A1 demo) */
export const SECTION_INDEX: Record<string, string[]> = {
  A1: ['A1-1', 'A1-2', 'A1-3'], // need kolm kuuluvad Section A1 alla
};

export function getCodesBySection(section: string): string[] {
  return SECTION_INDEX[section] ?? [];
}
