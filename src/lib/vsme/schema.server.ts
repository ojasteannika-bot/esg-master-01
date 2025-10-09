// src/lib/vsme/schema.server.ts
import 'server-only';
import fs from 'fs/promises';
import path from 'path';
import type { VsmeBundle, VsmeItem } from './types';

const BUNDLE_PATH = path.join(process.cwd(), 'src', 'data', 'vsme', 'bundle.json');

let __VSME_BUNDLE__: VsmeBundle | null = null;

export async function getBundle(): Promise<VsmeBundle> {
  if (__VSME_BUNDLE__) return __VSME_BUNDLE__;
  const raw = await fs.readFile(BUNDLE_PATH, 'utf8');
  __VSME_BUNDLE__ = JSON.parse(raw) as VsmeBundle;
  return __VSME_BUNDLE__;
}

export function inferSectionCode(code: string): string {
  // "B1-1" -> "B1"
  const [sec] = code.split('-');
  return (sec || '').toUpperCase();
}

export async function findItemByCode(code: string): Promise<VsmeItem | null> {
  const bundle = await getBundle();
  const sec = inferSectionCode(code);
  const section = bundle.sections.find(s => s.code === sec);
  if (!section) return null;
  return section.items.find(i => i.code === code) ?? null;
}

export async function listSectionItems(sectionCode: string): Promise<VsmeItem[]> {
  const bundle = await getBundle();
  const section = bundle.sections.find(s => s.code === sectionCode);
  return section?.items ?? [];
}

export async function safeGetSectionWithItems(sectionCode: string) {
  const bundle = await getBundle();
  const section = bundle.sections.find(s => s.code === sectionCode) ?? null;
  const items = section?.items ?? [];
  return { section, items };
}
