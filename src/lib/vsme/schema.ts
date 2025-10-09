import 'server-only';
import fs from 'fs/promises';
import path from 'path';

export type VsmeAnswerOption = { value: string; label: string };
export type VsmeItem = {
  code: string;
  text: string;
  type?: 'select' | 'text';
  options?: VsmeAnswerOption[];
};
export type VsmeSection = { code: string; title: string; items: VsmeItem[] };

// Tagastame alati massiivi: VsmeSection[]
export type VsmeBundle = VsmeSection[];

const BUNDLE_PATH = path.join(process.cwd(), 'src', 'data', 'vsme', 'bundle.json');

/** Loeb VSME bundle'i ja normaliseerib kuju alati massiiviks. */
export async function readVsmeBundle(): Promise<VsmeBundle> {
  const raw = await fs.readFile(BUNDLE_PATH, 'utf8');
  const data = JSON.parse(raw);
  // Toetame nii [ ... ] kui ka { sections: [ ... ] } vorme
  if (Array.isArray(data)) return data as VsmeBundle;
  if (data && Array.isArray(data.sections)) return data.sections as VsmeBundle;
  return []; // ohutu vaikimisi
}

/** B1-1 -> B1 (aitab kiirelt õige sektsiooni leida) */
export function inferSectionCode(itemCode: string): string {
  const m = String(itemCode).match(/^([A-Za-z]\d+)-/);
  return m ? m[1].toUpperCase() : '';
}

/** Leiab konkreetse küsimuse koodi järgi. */
export function findItemByCode(sections: VsmeBundle, itemCode: string): {
  section?: VsmeSection;
  item?: VsmeItem;
} {
  const target = String(itemCode).toUpperCase();
  const sectionCode = inferSectionCode(target);

  for (const s of sections ?? []) {
    if (!s) continue;
    if (sectionCode && String(s.code).toUpperCase() !== sectionCode) continue;
    const it = (s.items ?? []).find(i => String(i?.code).toUpperCase() === target);
    if (it) return { section: s, item: it };
  }
  return {};
}

/** Tagastab ühe sektsiooni kõik küsimused. */
export function listSectionItems(sections: VsmeBundle, sectionCode: string) {
  const s = sections.find(sec => String(sec?.code).toUpperCase() === String(sectionCode).toUpperCase());
  return s?.items ?? [];
}

/** Abiks, kui vajad "B1-1" -> "B1-1" (kinnitame vormingu) */
export function normalizeItemCode(code: string) {
  return String(code).trim().toUpperCase();
}
