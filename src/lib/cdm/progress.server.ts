// src/lib/cdm/progress.server.ts
import { getItems, getSections } from '@/lib/cdm/catalog';
import { readStatusFile } from '@/lib/cdm/state.server';

export type SectionProgress = { code: string; title: string; total: number; done: number; percent: number };

export async function getSectionProgress(project: string, sectionCode: string): Promise<SectionProgress> {
  const items = getItems(sectionCode);
  const total = items.length;
  let done = 0;
  for (const it of items) {
    const status = await readStatusFile(project, it.code);
    if (status.status === 'final' || status.status === 'draft') done += 1; // lugeme draft+final “täidetud”
  }
  const title = getSections().find(s => s.code.toLowerCase() === sectionCode.toLowerCase())?.title ?? sectionCode;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { code: sectionCode, title, total, done, percent };
}
