// src/lib/vsme/schema.ts
// Minimaalne stub, et CI oleks roheline. Asendame hiljem päris-impliga.

export type VsmeSection = { code: string; title: string };
export type VsmeNode = { id: string; type: string; title?: string };

export async function readVsmeBundle(): Promise<{
  sections: VsmeSection[];
  nodes: VsmeNode[];
}> {
  return { sections: [], nodes: [] };
}

export function getRootNodes(): VsmeNode[] {
  return [];
}

export function collectAllSections(): VsmeSection[] {
  return [];
}

export function findSection(_code: string): VsmeSection | null {
  return null;
}

export function enumerateQuestions(_section?: string): VsmeNode[] {
  return [];
}

export function inferSectionCode(_nodeId: string): string | null {
  return null;
}
