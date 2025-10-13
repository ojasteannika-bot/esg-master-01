import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

type Status = "not_started" | "draft" | "final";

async function ensureDir(d: string) {
  await fs.mkdir(d, { recursive: true });
}

async function readJson<T>(abs: string, fallback: T): Promise<T> {
  try { return JSON.parse(await fs.readFile(abs, "utf8")) as T; } catch { return fallback; }
}

async function writeJson(abs: string, data: any) {
  await ensureDir(path.dirname(abs));
  await fs.writeFile(abs, JSON.stringify(data, null, 2));
}

async function appendAudit(project: string, row: any) {
  const dir = path.join(process.cwd(), ".data", "state", project, "audit");
  await ensureDir(dir);
  const line = JSON.stringify({ ts: new Date().toISOString(), project, ...row });
  await fs.appendFile(path.join(dir, "log.jsonl"), line + "\n");
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const project = url.searchParams.get("project") ?? "";
    const code = url.searchParams.get("code") ?? "";
    if (!project || !code) return NextResponse.json({ ok: false, error: "missing project/code" }, { status: 400 });

    const base = path.join(process.cwd(), ".data", "state", project);
    const status = await readJson<{ status?: Status; updated?: string }>(
      path.join(base, "cdm", "status", `${code}.json`),
      {}
    );
    const answers = await readJson<any>(
      path.join(base, "cdm", "items", `${code}.json`),
      {}
    );

    return NextResponse.json({ ok: true, status, answers }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    type Status = "not_started" | "draft" | "final";
    let project = "", code = "", status: Status | undefined;
    let answers: any | undefined;

    const ct = req.headers.get("content-type") ?? "";

    if (ct.includes("application/json")) {
      // fetch(JSON) -> { project, code, status?, answers? }
      const body = await req.json().catch(() => ({} as any));
      project = String(body.project ?? "");
      code = String(body.code ?? "");
      status = (["not_started", "draft", "final"].includes(body.status)) ? body.status as Status : undefined;
      answers = body.answers;
    } else {
      // HTML vorm (urlencoded või multipart)
      const form = await req.formData();
      project = String(form.get("project") ?? "");
      code = String(form.get("code") ?? "");
      const s = form.get("status");
      if (typeof s === "string" && ["not_started", "draft", "final"].includes(s)) {
        status = s as Status;
      }
      const a = form.get("answers");
      if (a != null) {
        try { answers = JSON.parse(String(a)); } catch { /* ignore -> jätame undefined */ }
      }
    }

    if (!project || !code) {
      return NextResponse.json({ ok: false, error: "missing project/code" }, { status: 400 });
    }

    const base = path.join(process.cwd(), ".data", "state", project, "cdm");
    const now = new Date().toISOString();

    // salvesta staatus
    if (status) {
      await writeJson(path.join(base, "status", `${code}.json`), { status, updated: now });
      await appendAudit(project, { type: "status", code, data: { status } });
    }

    // salvesta vastused
    if (answers && typeof answers === "object") {
      await writeJson(path.join(base, "items", `${code}.json`), answers);
      await appendAudit(project, { type: "save", code, data: answers });
    }

    return NextResponse.json({
      ok: true,
      project,
      code,
      saved: { status: !!status, answers: !!answers },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}
