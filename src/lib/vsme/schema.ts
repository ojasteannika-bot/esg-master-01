export type VsmeSection = {
  code: string;
  title?: string;
  items?: any[];
  children?: VsmeSection[];
};

// Ajutised stubid – tagastavad tühjad väärtused, kuni pärisloogika lisame.
export function enumerateQuestions(): any[] {
  return [];
}

export function findSection(sectionCode: string): VsmeSection | null {
  return null;
}

export function collectAllSections(): VsmeSection[] {
  return [];
}

export function getRootNodes(): VsmeSection[] {
  return [];
}
