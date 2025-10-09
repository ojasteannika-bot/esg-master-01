export type VsmeSection = {
  code: string;
  title?: string;
  items?: any[];
  children?: VsmeSection[];
};

// olemasolevad stubid (ajutised)
export function enumerateQuestions(): any[] { return []; }
export function findSection(_sectionCode: string): VsmeSection | null { return null; }
export function collectAllSections(): VsmeSection[] { return []; }
export function getRootNodes(): VsmeSection[] { return []; }

// API-dele vajalikud ekspordid (ajutised)
export function readVsmeBundle() {
  // TODO: asenda päris andmetega (nt src/data/vsme/bundle.json)
  return { sections: [] as VsmeSection[] };
}
export function inferSectionCode(itemCode: string): string | null {
  if (!itemCode) return null;
  const m = String(itemCode).match(/^([A-Za-z]+\d+)/); // "B1.1" -> "B1"
  return m ? m[1] : null;
}
