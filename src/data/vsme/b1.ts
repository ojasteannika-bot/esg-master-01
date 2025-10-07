export type Field = { key: string; label: string; type?: 'text'|'number'|'textarea' };

export const b1 = {
  code: 'b1',
  title: 'Section B1 — Suppliers & Resources',
  fields: [
    { key: 'suppliers',  label: 'Suppliers (count)',       type: 'number' },
    { key: 'water_m3',   label: 'Water (m³/year)',         type: 'number' },
    { key: 'waste_t',    label: 'Waste (t/year)',          type: 'number' },
    { key: 'target_year',label: 'ESG target year',         type: 'number' },
    { key: 'notes',      label: 'Notes',                   type: 'textarea' },
  ] as Field[],
};
