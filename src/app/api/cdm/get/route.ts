// src/app/api/cdm/get/route.ts
import { NextResponse } from "next/server";
import { readAnswersFile, readStatusFile } from "@/lib/cdm/state.server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const project = url.searchParams.get("projectId") ?? url.searchParams.get("project") ?? "";
    const code = (url.searchParams.get("sectionCode") ?? url.searchParams.get("code") ?? "").toUpperCase();
    if (!project || !code) {
      return NextResponse.json({ ok: false, error: "missing project/sectionCode" }, { status: 400 });
    }
    const status = await readStatusFile(project, code);
    const answers = await readAnswersFile(project, code);
    return NextResponse.json({ ok: true, project, code, status, answers });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}
