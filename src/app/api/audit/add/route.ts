// src/app/api/audit/add/route.ts
import { NextResponse } from "next/server";
import { appendAudit } from "@/lib/cdm/state.server";

type Status = "not_started" | "draft" | "final";

export async function POST(req: Request) {
  try {
    let project = "";
    let code = "";
    let status: Status | undefined;
    let answers: any | undefined;

    const ct = req.headers.get("content-type") ?? "";

    if (ct.includes("application/json")) {
      const body = (await req.json().catch(() => ({}))) as any;
      project = String(body.project ?? "");
      code = String(body.code ?? "");
      if (["not_started", "draft", "final"].includes(body.status)) {
        status = body.status as Status;
      }
      answers = body.answers;
    } else {
      const form = await req.formData();
      project = String(form.get("project") ?? "");
      code = String(form.get("code") ?? "");
      const s = String(form.get("status") ?? "");
      if (["not_started", "draft", "final"].includes(s)) {
        status = s as Status;
      }
      const a = form.get("answers");
      if (a != null) {
        try {
          answers = JSON.parse(String(a));
        } catch {
          /* ignore – jätame undefined */
        }
      }
    }

    if (!project /* code võib MVP-s olla tühi */) {
      return NextResponse.json(
        { ok: false, error: "missing project" },
        { status: 400 }
      );
    }

    // Kirjuta auditilogisse üks rida
    await appendAudit(project, { type: "add", code, status, answers });

    return NextResponse.json({
      ok: true,
      saved: { status: !!status, answers: answers !== undefined },
      project,
      code,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
