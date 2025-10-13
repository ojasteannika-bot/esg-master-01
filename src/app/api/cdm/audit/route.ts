import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

type Row = { ts?: string; type?: string; ctx?: string; project?: string; data?: any };

async function readLines(abs: string): Promise<string[]> {
  try {
    const txt = await fs.readFile(abs, "utf8");
    return txt.split(/\r?\n/).filter(Boolean);
  } catch {
    return [];
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const project = url.searchParams.get("project") ?? "";
    const limit = Math.max(1, Math.min(2000, Number(url.searchParams.get("limit") ?? "100")));
    const from = url.searchParams.get("from") ?? undefined;
    const to = url.searchParams.get("to") ?? undefined;

    if (!project) return NextResponse.json({ ok: false, error: "missing project" }, { status: 400 });

    const root = path.join(process.cwd(), ".data", "state", project, "audit");
    const file = path.join(root, "log.jsonl");
    const lines = await readLines(file);
    let rows: Row[] = [];
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        rows.push(JSON.parse(lines[i]));
      } catch {}
      if (rows.length >= 5000) break;
    }

    if (from) {
      const fts = new Date(from + "T00:00:00Z").getTime();
      rows = rows.filter(r => r?.ts ? new Date(r.ts).getTime() >= fts : true);
    }
    if (to) {
      const tts = new Date(to + "T23:59:59Z").getTime();
      rows = rows.filter(r => r?.ts ? new Date(r.ts).getTime() <= tts : true);
    }

    rows = rows.slice(0, limit);
    return NextResponse.json({ ok: true, project, rows }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}
