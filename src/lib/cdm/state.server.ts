// src/lib/cdm/state.server.ts
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { getItems } from '@/lib/cdm/catalog';

/* =========================
   PERSISTED STATE (per-project JSON)
   Failid: .data/esglite/<project>.json    +    .data/esglite/audit.jsonl
   ========================= */

const DATA_DIR = '.data/esglite';

export type ItemStatus = 'not_started' | 'draft' | 'final';

export type EvidenceItem = {
  id: string;
  name: string;
  url: string;
  addedAt: string; // ISO
};

type PersistedState = {
  items: Record<string, { status: ItemStatus; updated?: string }>;
  evidence: Record<string, EvidenceItem[]>;
  // demoks talletame ka küsimused (q1,q2) per item
  answers?: Record<string, { q1?: string; q2?: string }>;
};

// ---- utils
function stateFile(project: string) {
  return path.join(DATA_DIR, `${project}.json`);
}
async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}
async function loadState(project: string): Promise<PersistedState> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(stateFile(project), 'utf8');
    return JSON.parse(raw) as PersistedState;
  } catch {
    return { items: {}, evidence: {}, answers: {} };
  }
}
async function saveState(project: string, st: PersistedState) {
  await ensureDataDir();
  await fs.writeFile(stateFile(project), JSON.stringify(st, null, 2));
}

/* ========== Answers (demo) ========== */
export async function getItemAnswers(project: string, code: string) {
  const st = await loadState(project);
  return st.answers?.[code] ?? { q1: '', q2: '' };
}
export async function setItemAnswers(
  project: string,
  code: string,
  data: { q1?: string; q2?: string }
) {
  const st = await loadState(project);
  if (!st.answers) st.answers = {};
  st.answers[code] = { ...(st.answers[code] ?? {}), ...data };
  await saveState(project, st);
  return true;
}

/* ========== Evidence ========== */
export async function listEvidence(project: string, code: string) {
  const st = await loadState(project);
  return st.evidence[code] ?? [];
}
export async function addEvidence(
  project: string,
  code: string,
  name: string,
  url: string
) {
  const st = await loadState(project);
  const arr = st.evidence[code] ?? [];
  arr.push({ id: randomUUID(), name, url, addedAt: new Date().toISOString() });
  st.evidence[code] = arr;
  await saveState(project, st);
  return true;
}
export async function removeEvidence(project: string, code: string, id: string) {
  const st = await loadState(project);
  const arr = st.evidence[code] ?? [];
  st.evidence[code] = arr.filter(x => x.id !== id);
  await saveState(project, st);
  return true;
}

/* ========== Item status + section progress ========== */
export async function getItemStatus(
  project: string,
  code: string
): Promise<ItemStatus> {
  const st = await loadState(project);
  return st.items?.[code]?.status ?? 'not_started';
}
export async function setItemStatus(
  project: string,
  code: string,
  status: ItemStatus
) {
  const st = await loadState(project);
  if (!st.items) st.items = {};
  if (!st.items[code]) st.items[code] = { status: 'not_started' };
  st.items[code].status = status;
  st.items[code].updated = new Date().toISOString();
  await saveState(project, st);
  return true;
}

export async function getSectionStatus(project: string, sectionCode: string) {
  const st = await loadState(project);
  const items = getItems(sectionCode); // [{code,title,section}]
  const total = items.length;
  let completed = 0;
  for (const it of items) {
    const s = st.items?.[it.code]?.status;
    if (s === 'final') completed += 1;
  }
  const percent = total ? Math.round((completed / total) * 100) : 0;
  return { section: sectionCode, total, completed, percent };
}

/* ========== Audit (JSONL) ========== */
type AuditRow = {
  at: string;              // ISO
  project: string;
  type: string;            // 'nav' | 'save' | 'status' | 'evidence.add' | 'evidence.remove' | ...
  ctx?: string | null;
  data?: any;
};

const AUDIT_FILE = '.data/esglite/audit.jsonl';

async function ensureAuditFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try { await fs.access(AUDIT_FILE); }
  catch { await fs.writeFile(AUDIT_FILE, ''); }
}

export async function appendAudit(row: AuditRow) {
  await ensureAuditFile();
  const line = JSON.stringify(row) + '\n';
  await fs.appendFile(AUDIT_FILE, line, 'utf8');
}

/** Inclusive start-of-day for YYYY-MM-DD (>=). ISO string lubatud. */
function parseStart(dateStr?: string): number {
  if (!dateStr) return -Infinity;
  return Date.parse(dateStr);
}
/** Inclusive end-of-day for YYYY-MM-DD: +1 day, hiljem kasutame < toTs. */
function parseEnd(dateStr?: string): number {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.getTime();
}

export async function readAudit(opts: {
  project: string;
  type?: string;
  from?: string;
  to?: string;
  limit?: number;
  includeNav?: boolean;
}) {
  await ensureAuditFile();
  const raw = await fs.readFile(AUDIT_FILE, 'utf8');
  const lines = raw.split('\n').filter(Boolean);

  const fromTs = parseStart(opts.from);
  const toTs   = parseEnd(opts.to);
  const limit  = Math.max(1, Number(opts.limit ?? 100));

  const events: AuditRow[] = [];
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      const ev = JSON.parse(lines[i]) as AuditRow;
      if (ev.project !== opts.project) continue;
      if (!opts.includeNav && ev.type === 'nav') continue;
      if (opts.type && ev.type !== opts.type) continue;

      const ts = Date.parse(ev.at);
      if (!(ts >= fromTs && ts < toTs)) continue;

      events.push(ev);
      if (events.length >= limit) break;
    } catch { /* ignore bad line */ }
  }
  return events;
}
