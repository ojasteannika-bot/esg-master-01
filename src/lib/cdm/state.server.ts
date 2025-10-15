import * as fs from 'fs/promises';
import * as path from 'path';

const ROOT = process.cwd();
const ANSWERS_DIR = path.join(ROOT, '.data', 'esglite', 'answers');
const STATUS_DIR  = path.join(ROOT, '.data', 'esglite', 'status');

function safePart(s: string) {
  return String(s).replace(/[^a-zA-Z0-9._-]/g, '_');
}

/* ------------ ANSWERS (JSON) ------------- */
function answersPath(project: string, code: string) {
  return path.join(ANSWERS_DIR, `${safePart(project)}__${safePart(code)}.json`);
}

export async function readAnswersFile(project: string, code: string): Promise<any> {
  await fs.mkdir(ANSWERS_DIR, { recursive: true });
  const fp = answersPath(project, code);
  try {
    const buf = await fs.readFile(fp, 'utf8');
    return JSON.parse(buf);
  } catch {
    return {};
  }
}

export async function writeAnswersFile(project: string, code: string, data: any): Promise<void> {
  await fs.mkdir(ANSWERS_DIR, { recursive: true });
  const fp = answersPath(project, code);
  const json = JSON.stringify(data ?? {}, null, 2);
  await fs.writeFile(fp, json, 'utf8');
}

/* ------------ STATUS (draft/final) ------------- */
function statusPath(project: string, code: string) {
  return path.join(STATUS_DIR, `${safePart(project)}__${safePart(code)}.json`);
}

export type ItemStatus = 'draft' | 'final';

export async function getItemStatus(project: string, code: string): Promise<ItemStatus> {
  await fs.mkdir(STATUS_DIR, { recursive: true });
  const fp = statusPath(project, code);
  try {
    const txt = await fs.readFile(fp, 'utf8');
    const j = JSON.parse(txt);
    return (j?.status === 'final') ? 'final' : 'draft';
  } catch {
    return 'draft';
  }
}

export async function setItemStatus(project: string, code: string, status: ItemStatus): Promise<void> {
  await fs.mkdir(STATUS_DIR, { recursive: true });
  const fp = statusPath(project, code);
  const json = JSON.stringify({ project, code, status, updatedAt: Date.now() }, null, 2);
  await fs.writeFile(fp, json, 'utf8');
}

/* ------------ readStatusFile (progress serverile) ------------- */
export async function readStatusFile(project: string, code: string): Promise<any | null> {
  await fs.mkdir(STATUS_DIR, { recursive: true });
  const fp = statusPath(project, code);
  try {
    const txt = await fs.readFile(fp, 'utf8');
    return JSON.parse(txt);
  } catch {
    return null;
  }
}
