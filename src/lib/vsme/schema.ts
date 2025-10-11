// src/lib/vsme/schema.ts
export type VsmeSection = { code: string; title: string };
export type VsmeNode = { id: string; kind: string; children?: VsmeNode[] };

export function getRootNodes(): VsmeNode[] {
  return []; // stub
}

export function collectAllSections(): VsmeSection[] {
  return []; // stub
}

export function findSection(_code: string): VsmeSection | undefined {
  return undefined; // stub
}

export function enumerateQuestions(): { id: string; text: string }[] {
  return []; // stub
}
