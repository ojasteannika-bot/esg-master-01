import { b1 } from './b1';

export type Field = { key: string; label: string; type?: 'text'|'number'|'textarea' };
export type Section = { code: string; title: string; fields: Field[] };

export function getSection(code: string): Section | null {
  if (code === 'b1') return b1;

  if (code === 'a') {
    return {
      code: 'a',
      title: 'Section A',
      fields: [
        { key: 'company',   label: 'Company name',     type: 'text' },
        { key: 'employees', label: 'Employees',        type: 'number' },
        { key: 'energy_kwh',label: 'Energy (kWh)',     type: 'number' },
        { key: 'scope1',    label: 'Scope 1 (tCO₂e)',  type: 'number' },
        { key: 'ren_pct',   label: 'Renewables %',     type: 'number' },
        { key: 'policy',    label: 'ESG policy in place?', type: 'text' },
      ],
    };
  }

  if (code === 'b') {
    return {
      code: 'b',
      title: 'Section B',
      fields: [
        { key: 'suppliers',  label: 'Suppliers (count)', type: 'number' },
        { key: 'water_m3',   label: 'Water (m³/year)',   type: 'number' },
        { key: 'waste_t',    label: 'Waste (t/year)',    type: 'number' },
        { key: 'target_year',label: 'ESG target year',   type: 'number' },
        { key: 'notes',      label: 'Notes',             type: 'textarea' },
      ],
    };
  }

  return null;
}
