import 'server-only';
import fs from 'fs/promises';
import path from 'path';

type AnyRec = Record<string, any>;

// --- sisemine cache (devis piisab lihtsast mälu-cache'st)
let _cache: { mtimeMs: number; data: AnyRec } | null = null;

function bundlePath() {
  // eeldame, et ESLITE bundel on siin; vajadusel muuda rada
  return path.join(process.cwd(), 'src', 'data', 'esglite', 'bundle.json');
}

async function readJSON(p: string) {
  const buf = await fs.readFile(p, 'utf8');
  return JSON.parse(buf);
}

/** Lae bundle turvaliselt (vahemäluga). */
export async function getBundle(): Promise<AnyRec> {
  const p = bundlePath();
  const stat = await fs.stat(p);
  if (_cache && _cache.mtimeMs === stat.mtimeMs) return _cache.data;

  const data = await readJSON(p);
  _cache = { mtimeMs: stat.mtimeMs, data };
  return data;
}

// --- abifunktsioonid -----------------------------------------------

function toArray<T = any>(v: any): T[] {
  if (Array.isArray(v)) return v as T[];
  if (v && typeof v === 'object') return Object.values(v) as T[];
  return [];
}

function normCode(s: string) {
  return String(s || '').trim().toUpperCase();
}

function parseCodesFromBundle(bundle: AnyRec) {
  // Proovime kahte levinud kuju:
  // 1) { sections: [{ code, title, items:[{code,...}] } ...] }
  // 2) { sections: { B1: { ... }, B2: { ... } } } + { items: { 'B1-1': {...} } }
  const sections = toArray(bundle.sections).map((s: AnyRec) => ({
    code: normCode(s.code),
    title: s.title || s.name || '',
    description: s.description || '',
    items: toArray(s.items).map((it: AnyRec) => ({ ...it, code: normCode(it.code) })),
  }));

  // Kui sektsioonides pole “items”, üritame tuletada items kogu-bundle’ist
  if (sections.every(s => s.items.length === 0)) {
    const allItemsObj = (bundle.items && typeof bundle.items === 'object') ? bundle.items : null;
    const allItems = allItemsObj ? Object.values(allItemsObj) as AnyRec[] : toArray(bundle.items);
    for (const s of sections) {
      s.items = allItems
        .map(it => ({ ...it, code: normCode(it.code) }))
        .filter(it => it.code.startsWith(s.code + '-'));
    }
  }

  return sections;
}

// --- avalikud turvalised getteri-funktsioonid ----------------------

/** Tagasta kõik sektsioonid koos item’itega. */
export async function safeGetAllSections() {
  const bundle = await getBundle();
  return parseCodesFromBundle(bundle);
}

/** Tagasta üks sektsioon koos item’itega. */
export async function safeGetSectionWithItems(sectionCode: string) {
  const code = normCode(sectionCode);
  const sections = await safeGetAllSections();
  const section = sections.find(s => s.code === code) || { code, title: '', description: '', items: [] as AnyRec[] };
  return { section, items: section.items };
}

/** Tagasta üks item koodiga Bx-y. */
export async function safeGetItem(itemCode: string) {
  const code = normCode(itemCode);
  const sections = await safeGetAllSections();
  for (const s of sections) {
    const it = s.items.find(i => normCode(i.code) === code);
    if (it) return it;
  }
  // võimalusel vaata ka bundle.items sõnastikust
  const bundle = await getBundle();
  const dict = (bundle.items && typeof bundle.items === 'object') ? bundle.items : null;
  if (dict && dict[code]) return dict[code];
  return null;
}
// -----------------------------------------------------------------------------
// Real implementations (first pass) for exports used by API routes
// -----------------------------------------------------------------------------

/**
 * Find item and its section by item code.
 * - Scans sections->items
 * - Falls back to bundle.items dictionary if present
 */
export async function findItemAndSection(_code: string) {
  const code = normCode(String(_code || ''));
  if (!code) return { item: null as any, section: null as any };

  // 1) search in structured sections
  const sections = await safeGetAllSections();
  for (const s of sections) {
    const it = (Array.isArray(s.items) ? s.items : []).find(
      (i: any) => normCode(i?.code) === code
    );
    if (it) return { item: it, section: s };
  }

  // 2) optional dictionary fallback from bundle
  try {
    const bundle = await getBundle();
    const dict = (bundle?.items && typeof bundle.items === 'object') ? bundle.items : null;
    if (dict && dict[code]) {
      const sections2 = await safeGetAllSections();
      for (const s of sections2) {
        if ((Array.isArray(s.items) ? s.items : []).some((i: any) => normCode(i?.code) === code)) {
          return { item: dict[code], section: s };
        }
      }
      return { item: dict[code], section: null as any };
    }
  } catch {
    // ignore
  }

  return { item: null as any, section: null as any };
}

/**
 * Choose next (or previous) item code for simple linear navigation.
 * opts: { current?: string, direction?: 'next'|'prev' }
 */
export async function chooseNextItemCode(opts?: { current?: string; direction?: 'next' | 'prev' }) {
  const direction = opts?.direction === 'prev' ? 'prev' : 'next';
  const cur = normCode(String(opts?.current || ''));

  const sections = await safeGetAllSections();
  const flat: string[] = [];
  for (const s of sections) {
    for (const i of (Array.isArray(s.items) ? s.items : [])) {
      const c = normCode(i?.code);
      if (c) flat.push(c);
    }
  }
  if (flat.length === 0) return null;

  if (!cur) return direction === 'prev' ? flat[flat.length - 1] : flat[0];

  const idx = flat.indexOf(cur);
  if (idx < 0) return direction === 'prev' ? flat[flat.length - 1] : flat[0];

  if (direction === 'prev') return idx > 0 ? flat[idx - 1] : null;
  return idx < flat.length - 1 ? flat[idx + 1] : null;
}

/**
 * Compute simple progress over all items.
 * First pass: totals are real, completed=0 (extend later with answers).
 */
export async function computeProgress(): Promise<{ completed: number; total: number }> {
  const sections = await safeGetAllSections();
  let total = 0;
  for (const s of sections) total += Array.isArray(s.items) ? s.items.length : 0;
  const completed = 0;
  return { completed, total };
}
