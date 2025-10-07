import type { QuestionDef } from '@/components/Question';

export const VSME_A_QUESTIONS: QuestionDef[] = [
  { id: 'companyName', label: 'Company name', type: 'text' },
  { id: 'employees',   label: 'Employees',     type: 'number' },
  { id: 'energy_kwh',  label: 'Energy (kWh)',  type: 'number' },
  { id: 'scope1',      label: 'Scope 1 (tCO₂e)', type: 'number' },
  { id: 'ren_pct',     label: 'Renewables %',  type: 'number' },
  {
    id: 'policy',
    label: 'ESG policy in place?',
    type: 'select',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no',  label: 'No' },
    ],
  },
];
