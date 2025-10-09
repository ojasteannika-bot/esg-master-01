// src/data/vsme-sections.ts
export type VsmeItem = { code: string; title: string };

export const VSME_BASIC: VsmeItem[] = [
  { code: "b1",  title: "Basis for preparation" },
  { code: "b2",  title: "Practices, policies and future initiatives for transitioning towards a more sustainable economy" },
  { code: "b3",  title: "Energy and greenhouse gas emissions" },
  { code: "b4",  title: "Pollution of air, water and soil" },
  { code: "b5",  title: "Biodiversity" },
  { code: "b6",  title: "Water" },
  { code: "b7",  title: "Resource use, circular economy and waste management" },
  { code: "b8",  title: "Workforce – General characteristics" },
  { code: "b9",  title: "Workforce – Health and safety" },
  { code: "b10", title: "Workforce – Remuneration, collective bargaining and training" },
  { code: "b11", title: "Convictions and fines for corruption and bribery" },
];

export const VSME_COMP: VsmeItem[] = [
  { code: "c1", title: "Strategy: Business Model and Sustainability – Related Initiatives" },
  { code: "c2", title: "Description of practices, policies and future initiatives for transitioning" },
  { code: "c3", title: "GHG reduction targets and climate transition" },
  { code: "c4", title: "Climate risks" },
  { code: "c5", title: "Additional (general) workforce characteristics" },
  { code: "c6", title: "Additional own workforce information - Human rights policies and processes" },
  { code: "c7", title: "Severe negative human rights incidents" },
  { code: "c8", title: "Revenues from certain sectors and exclusion from EU reference benchmarks" },
  { code: "c9", title: "Gender diversity ratio in the governance body" },
];

export const VSME_ALL: VsmeItem[] = [...VSME_BASIC, ...VSME_COMP];
