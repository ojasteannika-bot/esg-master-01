// src/lib/cdm/state.server.ts
import { promises as fs } from "node:fs";
import path from "node:path";

export type Status = "not_started" | "draft" | "final";

function baseDir(project: string) {
  // failistruktuur: _data/state/<project>/cdm/{status,items}/<code>.json
  const root = path.join(process.cwd(), "_data", "state", project, "cdm");
  return {
    root,
    statusDir: path.join(root, "status"),
    itemsDir: path.join(root, "items"),
    auditDir: path.join(process.cwd(), "_data", "state", project, "audit"),
    logFile: path.join(process.cwd(), "_data", "state", project, "log.jsonl"),
  };
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export async function readJson<T>(abs: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(abs, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export async function writeJson(abs: string, data: unknown) {
  await ensureDir(path.dirname(abs));
  await fs.writeFile(abs, JSON.stringify(data, null, 2));
}

export async function appendAudit(project: string, row: any) {
  const { logFile } = baseDir(project);
  await ensureDir(path.dirname(logFile));
  const line = JSON.stringify({ ts: new Date().toISOString(), project, ...row });
  await fs.appendFile(logFile, line + "\n");
}

/* --- CDM state helpers --- */

export async function saveStatus(project: string, code: string, status: Status) {
  const { statusDir } = baseDir(project);
  const abs = path.join(statusDir, `${code}.json`);
  await writeJson(abs, { status, updated: new Date().toISOString() });
}

export async function saveAnswers(project: string, code: string, answers: any) {
  const { itemsDir } = baseDir(project);
  const abs = path.join(itemsDir, `${code}.json`);
  await writeJson(abs, answers ?? {});
}

export async function readStatusFile(project: string, code: string) {
  const { statusDir } = baseDir(project);
  const abs = path.join(statusDir, `${code}.json`);
  return readJson<{ status?: Status; updated?: string }>(abs, {});
}

export async function readAnswersFile(project: string, code: string) {
  const { itemsDir } = baseDir(project);
  const abs = path.join(itemsDir, `${code}.json`);
  return readJson<any>(abs, {});
}

export async function listStatuses(project: string) {
  const { statusDir } = baseDir(project);
  await ensureDir(statusDir);
  const files = (await fs.readdir(statusDir)).filter(f => f.endsWith(".json"));
  const rows = await Promise.all(
    files.map(async (f) => {
      const code = f.replace(/\.json$/, "");
      const data = await readStatusFile(project, code);
      return { code, ...data };
    })
  );
  return rows; // [{code, status, updated}]
}
