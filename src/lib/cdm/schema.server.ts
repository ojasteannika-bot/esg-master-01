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
// --- Temporary restore stubs for missing exports ---
export function findItemAndSection(_code: string) {
  return { item: null, section: null };
}

export function chooseNextItemCode(_opts?: any) {
  return null;
}

export function computeProgress() {
  return { completed: 0, total: 0 };
}
