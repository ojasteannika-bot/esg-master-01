// src/lib/cdm/state.server.ts
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

/* =========================
   PERSISTED STATE (per-project JSON)
   File: .data/esglite/<project>.json
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
};

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
    return { items: {}, evidence: {} };
  }
}

async function saveState(project: string, st: PersistedState) {
  await ensureDataDir();
  await fs.writeFile(stateFile(project), JSON.stringify(st, null, 2), 'utf8');
}

/* =========================
   ITEM STATUS
   ========================= */

export async function getItemStatus(project: string, code: string) {
  const st = await loadState(project);
  return st.items[code] ?? { status: 'not_started' as ItemStatus };
}

export async function setItemStatus(project: string, code: string, status: ItemStatus) {
  const st = await loadState(project);
  st.items[code] = { status, updated: new Date().toISOString() };
  await saveState(project, st);
  return st.items[code];
}

/* =========================
   EVIDENCE
   ========================= */

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
  const item: EvidenceItem = {
    id: randomUUID(),
    name,
    url,
    addedAt: new Date().toISOString(),
  };
  st.evidence[code] = [item, ...arr];
  await saveState(project, st);
  return item;
}

export async function removeEvidence(project: string, code: string, id: string) {
  const st = await loadState(project);
  const arr = st.evidence[code] ?? [];
  const next = arr.filter((e) => e.id !== id);
  st.evidence[code] = next;
  await saveState(project, st);
  return true;
}

/* =========================
   SECTION PROGRESS (lihtne)
   ========================= */

export async function getSectionProgress(project: string, codes: string[]) {
  const st = await loadState(project);
  const total = codes.length;
  let completed = 0;
  for (const c of codes) {
    const s = st.items[c];
    if (s?.status === 'final') completed += 1;
  }
  return { completed, total };
}

/* =========================
   AUDIT (JSONL; single impl)
   File: .data/esglite/audit.jsonl
   ========================= */

type AuditRow = {
  at: string;      // ISO time
  project: string;
  type: string;    // 'nav' | 'save' | 'status' | ...
  ctx?: string | null;
  data?: any;
};

const AUDIT_FILE = '.data/esglite/audit.jsonl';

async function ensureAuditFile() {
  await fs.mkdir('.data/esglite', { recursive: true });
  try {
    await fs.access(AUDIT_FILE);
  } catch {
    await fs.writeFile(AUDIT_FILE, '');
  }
}

export async function appendAudit(row: AuditRow) {
  await ensureAuditFile();
  const line = JSON.stringify(row) + '\n';
  await fs.appendFile(AUDIT_FILE, line, 'utf8');
}

export async function readAudit(opts: {
  project: string;
  type?: string;
  from?: string;          // ISO date or datetime
  to?: string;            // ISO date or datetime
  limit?: number;
  includeNav?: boolean;   // default false
}) {
  await ensureAuditFile();

  const raw = await fs.readFile(AUDIT_FILE, 'utf8');
  const rows = raw
    .split('\n')
    .filter(Boolean)
    .map((l) => {
      try { return JSON.parse(l) as AuditRow; } catch { return null; }
    })
    .filter(Boolean) as AuditRow[];

  const fromTs = opts.from ? Date.parse(opts.from) : Number.NEGATIVE_INFINITY;
  const toTs   = opts.to   ? Date.parse(opts.to)   : Number.POSITIVE_INFINITY;

  const filtered = rows.filter((r) => {
    if (r.project !== opts.project) return false;
    if (!opts.includeNav && r.type === 'nav') return false;
    if (opts.type && r.type !== opts.type) return false;

    const t = Date.parse(r.at);
    if (Number.isNaN(t)) return false;

    return t >= fromTs && t <= toTs;
  });

  return opts.limit && opts.limit > 0 ? filtered.slice(-opts.limit) : filtered;
}
// -------- ANSWERS (per item) --------
// struktuur: st.answers[code] = { [questionId]: any }
type Answers = Record<string, any>;

export async function getItemAnswers(project: string, code: string): Promise<Answers> {
  const st = await loadState(project);
  const all = (st as any).answers ?? {};
  return all[code] ?? {};
}

export async function saveItemAnswers(project: string, code: string, patch: Answers) {
  const st = await loadState(project);
  const all = (st as any).answers ?? {};
  const prev = all[code] ?? {};
  const next = { ...prev, ...patch };
  (st as any).answers = { ...all, [code]: next };
  await saveState(project, st);
  return next;
}
