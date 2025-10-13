// src/app/api/cdm/status/route.ts
import { NextResponse } from "next/server";
import { listStatuses } from "@/lib/cdm/state.server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    // hoidkem varasemat parami nime, mida su UI juba kutsub:
    const project = url.searchParams.get("projectId") ?? url.searchParams.get("project") ?? "";
    if (!project) {
      return NextResponse.json({ ok: false, error: "missing projectId" }, { status: 400 });
    }
    const rows = await listStatuses(project);
    return NextResponse.json({ ok: true, project, rows });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}
