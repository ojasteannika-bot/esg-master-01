// src/lib/cdm/schema.server.ts
import 'server-only';
import fs from 'fs/promises';
import path from 'path';

type AnyRec = Record<string, any>;

type Item = { code: string; title?: string };
type Section = { code: string; title?: string; description?: string; items: Item[] };

let _cache: { mtimeMs: number; data: AnyRec } | null = null;

function bundlePath() {
  return path.join(process.cwd(), 'src', 'data', 'esglite', 'bundle.json');
}

async function readJSON(p: string) {
  const buf = await fs.readFile(p, 'utf8');
  return JSON.parse(buf);
}

/** Load bundle with a tiny FS-mtime cache (good enough for dev). */
export async function getBundle(): Promise<AnyRec> {
  const p = bundlePath();
  const stat = await fs.stat(p);
  if (_cache && _cache.mtimeMs === stat.mtimeMs) return _cache.data;

  const data = await readJSON(p);
  _cache = { mtimeMs: stat.mtimeMs, data };
  return data;
}

// ───────────────────────────────────────────────────────────────────────────────
// helpers

function toArray<T = any>(v: any): T[] {
  if (Array.isArray(v)) return v as T[];
  if (v && typeof v === 'object') return Object.values(v) as T[];
  return [];
}

function normCode(s: string) {
  return String(s || '').trim().toUpperCase();
}

/** Normalize bundle into flat sections[] and itemsDict for quick lookups. */
function normalizeBundle(bundle: AnyRec): { sections: Section[]; itemsDict: Record<string, Item & { section?: string }> } {
  // Sections may be an array or an object keyed by code
  const rawSections: AnyRec[] = toArray(bundle.sections);

  // Items dictionary may be provided, otherwise derive from sections[].items
  const itemsDict: Record<string, Item & { section?: string }> = {};
  if (bundle.items && typeof bundle.items === 'object') {
    for (const [k, v] of Object.entries<any>(bundle.items)) {
      itemsDict[normCode(k)] = { code: normCode(k), title: v?.title, section: v?.section ? normCode(v.section) : undefined };
    }
  }

  const sections: Section[] = rawSections.map((s: AnyRec) => {
    const code = normCode(s.code ?? s.id ?? s.key);
    const title = s.title ?? s.name ?? code;
    const description = s.description ?? '';
    const items = toArray<any>(s.items).map((it) => {
      const icode = normCode(it.code ?? it.id ?? it.key);
      const item: Item = { code: icode, title: it.title ?? it.name ?? icode };
      // backfill itemsDict if missing
      if (!itemsDict[icode]) itemsDict[icode] = { ...item, section: code };
      else if (!itemsDict[icode].section) itemsDict[icode].section = code;
      return item;
    });
    return { code, title, description, items };
  });

  // If sections array was empty but itemsDict has section info, synthesize sections
  if (!sections.length && Object.keys(itemsDict).length) {
    const bySection: Record<string, Item[]> = {};
    for (const it of Object.values(itemsDict)) {
      const sec = normCode(it.section || 'UNSPEC');
      if (!bySection[sec]) bySection[sec] = [];
      bySection[sec].push({ code: it.code, title: it.title });
    }
    for (const [sec, items] of Object.entries(bySection)) {
      sections.push({ code: sec, title: sec, description: '', items });
    }
  }

  return { sections, itemsDict };
}

// ───────────────────────────────────────────────────────────────────────────────
// public, safe accessors

export async function safeGetAllSections(): Promise<Section[]> {
  const bundle = await getBundle();
  const { sections } = normalizeBundle(bundle);
  return sections;
}

export async function safeGetSectionWithItems(sectionCode: string): Promise<{ section: Section | null; items: Item[] }> {
  const code = normCode(sectionCode);
  const sections = await safeGetAllSections();
  const section = sections.find((s) => normCode(s.code) === code) ?? null;
  return { section, items: section?.items ?? [] };
}

export async function safeGetItem(itemCode: string): Promise<Item | null> {
  const { itemsDict } = normalizeBundle(await getBundle());
  const item = itemsDict[normCode(itemCode)];
  if (item) return { code: item.code, title: item.title };
  // fallback: scan
  const sections = await safeGetAllSections();
  for (const s of sections) {
    const it = s.items.find((i) => normCode(i.code) === normCode(itemCode));
    if (it) return it;
  }
  return null;
}

// ───────────────────────────────────────────────────────────────────────────────
// exports expected by routes

export async function findItemAndSection(_code: string) {
  const code = normCode(_code);
  const { sections, itemsDict } = normalizeBundle(await getBundle());

  // Fast path via dict
  const dictHit = itemsDict[code];
  if (dictHit?.section) {
    const section = sections.find((s) => normCode(s.code) === normCode(dictHit.section)) || null;
    const item: Item = { code: dictHit.code, title: dictHit.title ?? dictHit.code };
    return { item, section };
  }

  // Fallback: scan sections
  for (const s of sections) {
    const it = s.items.find((i) => normCode(i.code) === code);
    if (it) return { item: it, section: s };
  }
  return { item: null, section: null };
}

/** Very simple "next item" walker (linear order by section, then item). */
export async function chooseNextItemCode(opts?: { current?: string; section?: string }): Promise<string | null> {
  const { sections } = normalizeBundle(await getBundle());

  // Build a flattened list of codes in display order
  const flat: string[] = [];
  for (const s of sections) for (const it of s.items) flat.push(normCode(it.code));

  // If section provided without current, return first item of that section
  if (opts?.section && !opts?.current) {
    const sec = normCode(opts.section);
    const found = sections.find((s) => normCode(s.code) === sec);
    return found?.items?.[0]?.code ?? null;
  }

  // If current provided, return the next in the flat list
  if (opts?.current) {
    const cur = normCode(opts.current);
    const idx = flat.indexOf(cur);
    if (idx >= 0 && idx + 1 < flat.length) return flat[idx + 1];
    return null;
  }

  // Default: first available item
  return flat[0] ?? null;
}

/**
 * Compute progress for a section.
 * Real implementation should read user/project answers; we return a safe default
 * that keeps API stable: total = number of items, completed = 0.
 */
export async function computeProgress(project: string, sectionCode: string): Promise<{ completed: number; total: number }> {
  void project; // reserved for real impl
  const { section, items } = await safeGetSectionWithItems(sectionCode);
  const total = items.length || 0;

  // If bundle carries simple status flags on items (title/status), we could derive:
  // const completed = items.filter((i: any) => i?.status === 'Final').length;

  const completed = 0;
  if (!section) return { completed: 0, total };
  return { completed, total };
}
