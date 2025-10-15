// src/lib/vsme/schema.ts
// Minimalne, kuid kooskõlaline stub. Eesmärk: hoida Next 15 build/CI roheline.
// NB! Hiljem võib asendada päris-impliga, aga välised importijad ei tohi katki minna.

export type VsmeField = {
  code: string;
  title?: string;
  type?: string;          // "text" | "number" | "boolean" | "select" | ...
  options?: Array<{ value: string; label: string } | string>;
};

export type VsmeQuestion = VsmeField;

export type VsmeSection = {
  code: string;
  title?: string;
  // mõnel pool kasutati 'fields', mõnel 'items' — hoiame mõlemad, et importijad ei kukuks
  items?: VsmeField[];
  fields?: VsmeField[];
  // mõni komponent küsib nodes; jätame valikuliseks
  nodes?: unknown[];
};

export type VsmeNode = any;

export type VsmeBundle = {
  sections: VsmeSection[];
};

// Väga lihtne bundle — hiljem asendame tegeliku laadimisega
export async function readVsmeBundle(): Promise<VsmeBundle> {
  return { sections: [] };
}

// Tagasta kõik küsimused (olenemata kas 'items' või 'fields' on kasutusel)
export function enumerateQuestions(sectionOrCode?: string | VsmeSection): VsmeField[] {
  if (!sectionOrCode) return [];
  const s: VsmeSection =
    typeof sectionOrCode === "string"
      ? { code: sectionOrCode, items: [], fields: [] }
      : sectionOrCode;

  const a = Array.isArray(s.items) ? s.items : [];
  const b = Array.isArray(s.fields) ? s.fields : [];
  return [...a, ...b];
}

// Mõned kohad eeldasid seda nime
export function listSectionItems(section: VsmeSection): VsmeField[] {
  return enumerateQuestions(section);
}

// Mõned kohad eeldasid sellist utili — tagasta 'undefined' (mitte 'null'), et tüübid klapiks
export function inferSectionCode(_nodeId: string): string | undefined {
  return undefined;
}

// Abi: vahel küsiti root-nodes vms; hoiame need no-op’ina, et importid ei kukuks
export function getRootNodes(): VsmeNode[] {
  return [];
}
export function collectAllSections(): VsmeSection[] {
  return [];
}
export function findSection(_code: string): VsmeSection | null {
  return null;
}
