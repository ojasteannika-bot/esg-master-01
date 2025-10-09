'use server';
import 'server-only';

import { getBundle } from './schema.server';
import type { CDMBundle, CDMSection, CDMItem } from './types';

export async function listSections(): Promise<CDMSection[]> {
  const b = await getBundle();
  return b.sections || [];
}

export async function findSection(sectionCode: string): Promise<CDMSection | null> {
  const b = await getBundle();
  return b.sections.find(s => s.code === sectionCode) || null;
}

export async function findItemByCode(code: string): Promise<{ section: CDMSection; item: CDMItem } | null> {
  const b: CDMBundle = await getBundle();
  for (const section of b.sections) {
    const item = section.items.find(it => it.code === code);
    if (item) return { section, item };
  }
  return null;
}
