export type QuestionDef = {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'radio';
  help?: string;
  options?: { value: string; label: string }[];
};

/** Renderimise järjekord (võid hiljem muuta) */
export const SECTION_ORDER = [
  'A',
  'B1','B2','B3','B4','B5','B6','B7','B8',
  'C1','C2','C3','C4','C5','C6','C7','C8','C9','C10','C11',
] as const;

export type SectionCode = typeof SECTION_ORDER[number];

/** NB: siia panin A jaoks meie olemasolevad väljad; B1…C11 on praegu placeholderid (2–3 küsimust/sektsioon).
 *  Hiljem asendame need “päris” VSME küsimustega, ainult seda faili muutes — UI kohaneb automaatselt. */
export const VSME_QUESTIONS: Record<SectionCode, QuestionDef[]> = {
  A: [
    { id: 'company',    label: 'Company name',   type: 'text' },
    { id: 'employees',  label: 'Employees',      type: 'number' },
    { id: 'energy_kwh', label: 'Energy (kWh)',   type: 'number' },
    { id: 'scope1',     label: 'Scope 1 (tCO₂e)',type: 'number' },
    { id: 'ren_pct',    label: 'Renewables %',   type: 'number' },
    {
      id: 'policy',     label: 'ESG policy in place?', type: 'select',
      options: [{value:'yes',label:'Yes'}, {value:'no',label:'No'}]
    },
  ],
  // ---- B1..B8 (placeholderid) ----
  B1: [
    { id: 'b1_q1', label: 'B1 — primary topic (short text)', type: 'text' },
    { id: 'b1_q2', label: 'B1 — numeric input', type: 'number' },
  ],
  B2: [
    { id: 'b2_q1', label: 'B2 — describe your practice', type: 'text' },
    { id: 'b2_q2', label: 'B2 — have policy?', type: 'radio',
      options: [{value:'yes',label:'Yes'},{value:'no',label:'No'}] },
  ],
  B3: [
    { id: 'b3_q1', label: 'B3 — value', type: 'number' },
    { id: 'b3_q2', label: 'B3 — comment', type: 'text' },
  ],
  B4: [
    { id: 'b4_q1', label: 'B4 — select option', type: 'select',
      options: [{value:'opt1',label:'Option 1'},{value:'opt2',label:'Option 2'}] },
    { id: 'b4_q2', label: 'B4 — note', type: 'text' },
  ],
  B5: [
    { id: 'b5_q1', label: 'B5 — metric', type: 'number' },
    { id: 'b5_q2', label: 'B5 — detail', type: 'text' },
  ],
  B6: [
    { id: 'b6_q1', label: 'B6 — status', type: 'radio',
      options: [{value:'ok',label:'OK'},{value:'n/a',label:'N/A'}] },
    { id: 'b6_q2', label: 'B6 — comment', type: 'text' },
  ],
  B7: [
    { id: 'b7_q1', label: 'B7 — amount', type: 'number' },
    { id: 'b7_q2', label: 'B7 — note', type: 'text' },
  ],
  B8: [
    { id: 'b8_q1', label: 'B8 — choose', type: 'select',
      options: [{value:'a',label:'A'},{value:'b',label:'B'}] },
    { id: 'b8_q2', label: 'B8 — remarks', type: 'text' },
  ],
  // ---- C1..C11 (placeholderid) ----
  C1:  [{ id:'c1_q1',  label:'C1 — text', type:'text' },  { id:'c1_q2',  label:'C1 — number', type:'number' }],
  C2:  [{ id:'c2_q1',  label:'C2 — text', type:'text' },  { id:'c2_q2',  label:'C2 — number', type:'number' }],
  C3:  [{ id:'c3_q1',  label:'C3 — text', type:'text' },  { id:'c3_q2',  label:'C3 — number', type:'number' }],
  C4:  [{ id:'c4_q1',  label:'C4 — text', type:'text' },  { id:'c4_q2',  label:'C4 — number', type:'number' }],
  C5:  [{ id:'c5_q1',  label:'C5 — text', type:'text' },  { id:'c5_q2',  label:'C5 — number', type:'number' }],
  C6:  [{ id:'c6_q1',  label:'C6 — text', type:'text' },  { id:'c6_q2',  label:'C6 — number', type:'number' }],
  C7:  [{ id:'c7_q1',  label:'C7 — text', type:'text' },  { id:'c7_q2',  label:'C7 — number', type:'number' }],
  C8:  [{ id:'c8_q1',  label:'C8 — text', type:'text' },  { id:'c8_q2',  label:'C8 — number', type:'number' }],
  C9:  [{ id:'c9_q1',  label:'C9 — text', type:'text' },  { id:'c9_q2',  label:'C9 — number', type:'number' }],
  C10: [{ id:'c10_q1', label:'C10 — text', type:'text' }, { id:'c10_q2', label:'C10 — number', type:'number' }],
  C11: [{ id:'c11_q1', label:'C11 — text', type:'text' }, { id:'c11_q2', label:'C11 — number', type:'number' }],
};
