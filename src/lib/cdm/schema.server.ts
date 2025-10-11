// src/lib/cdm/schema.server.ts
import fs from 'fs';
import path from 'path';

type Section = { code: string; title: string; description?: string; items?: { code: string; title: string }[] };
type Bundle = { sections: Section[]; items?: Record<string, { section: string; title: string }> };

function loadBundle(): Bundle {
  const p = path.join(process.cwd(), 'src', 'data', 'esglite', 'bundle.json');
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw);
}

// ----- PÕHIEKSPORDID, MIDA APId OOTAVAD -----

export function getBundle(): Bundle {
  return loadBundle();
}

export function safeGetAllSections() {
  try {
    const b = loadBundle();
    return b.sections ?? [];
  } catch {
    return [];
  }
}

export function safeGetSectionWithItems(code: string) {
  try {
    const b = loadBundle();
    const section = (b.sections || []).find(s => s.code === code);
    const items = section?.items ?? [];
    return { section, items };
  } catch {
    return { section: null, items: [] as Section['items'] };
  }
}

export function safeGetItem(code: string) {
  try {
    const b = loadBundle();
    const map = b.items || {};
    return map[code] || null;
  } catch {
    return null;
  }
}

export function findItemAndSection(itemCode: string) {
  try {
    const b = loadBundle();
    const map = b.items || {};
    const item = map[itemCode] || null;
    if (!item) return { section: null, item: null };
    const section = (b.sections || []).find(s => s.code === item.section) || null;
    return { section, item };
  } catch {
    return { section: null, item: null };
  }
}

// Väike “järgmise küsimuse” stub – kohanda enda loogikale
export function chooseNextItemCode(sectionCode: string, answered: string[] = []) {
  const { items } = safeGetSectionWithItems(sectionCode);
  const next = (items || []).find(i => !answered.includes(i.code));
  return next?.code ?? null;
}
