export type Progress = { completed: number; total: number };

export function computeProgress(): Progress { return { completed: 0, total: 0 }; }
export function chooseNextItemCode(_opts?: any): string | null { return null; }
export function findItemAndSection(_code: string): { item: any; section: any } { return { item: null, section: null }; }

// --- API-de nõutud ekspordid (stubid) ---
export function getBundle() { return { sections: [] as any[] }; }
export function safeGetItem(_code: string) { return null; }
export function safeGetSectionWithItems(_sectionCode: string) { return { section: null, items: [] as any[] }; }
