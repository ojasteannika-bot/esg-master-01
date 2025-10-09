export type Progress = { completed: number; total: number };

// Ajutised stubid buildi roheline hoidmiseks.
export function computeProgress(): Progress {
  return { completed: 0, total: 0 };
}

export function chooseNextItemCode(
  _opts?: any
): string | null {
  return null;
}

export function findItemAndSection(
  _code: string
): { item: any; section: any } {
  return { item: null, section: null };
}
