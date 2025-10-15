// src/app/api/cdm/audit.csv/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";

type Q = {
  project?: string;
  limit?: string;
  from?: string;
  to?: string;
  includeNav?: string;
};

function toCSV(rows: any[]): string {
  if (!Array.isArray(rows) || rows.length === 0) return "timestamp,type,ctx,data\n";
  // leia veerud (stabiilsed + dünaamiline fallback)
  const baseCols = ["timestamp", "type", "ctx", "data"];
  const header = baseCols.join(",");
  const esc = (v: any) => {
    const s = typeof v === "string" ? v : JSON.stringify(v ?? "");
    const needs = /[",\n]/.test(s);
    return needs ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = rows.map((r) => {
    // proovi levinud võtmeid; toeta ka alternatiivseid nimesid
    const ts = r.timestamp ?? r.time ?? r.created_at ?? r.createdAt ?? "";
    const type = r.type ?? r.event ?? "";
    const ctx = r.ctx ?? r.context ?? r.section ?? "";
    const data = r.data ?? r.payload ?? r.body ?? "";
    return [esc(ts), esc(type), esc(ctx), esc(data)].join(",");
  });
  return [header, ...lines].join("\n") + "\n";
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = Object.fromEntries(url.searchParams.entries()) as Q;

    // Ehita absoluutne URL backendisse (samas Next apps)
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3001";
    const proto = h.get("x-forwarded-proto") ?? "http";

    const qs = new URLSearchParams();
    if (q.project) qs.set("project", q.project);
    if (q.limit) qs.set("limit", q.limit);
    if (q.from) qs.set("from", q.from);
    if (q.to) qs.set("to", q.to);
    if (q.includeNav) qs.set("includeNav", q.includeNav);

    const jsonUrl = `${proto}://${host}/api/cdm/audit?${qs.toString()}`;
    const res = await fetch(jsonUrl, { cache: "no-store" });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return new NextResponse(`Upstream /api/cdm/audit failed: ${res.status}\n${text}`, { status: 500 });
    }

    let payload: any = await res.json();
    const rows: any[] = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
      ? payload.data
      : [];

    const csv = toCSV(rows);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="audit-${q.project ?? "export"}.csv"`,
      },
    });
  } catch (err: any) {
    return new NextResponse(`CSV error: ${err?.message ?? "unknown"}`, { status: 500 });
  }
}
