// src/app/api/vsme/save/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

type SaveBody = {
  projectId?: string;
  itemCode?: string;
  status?: "draft" | "final";
  value?: any;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SaveBody;
    const projectId = (body.projectId ?? "").trim();
    const itemCode = (body.itemCode ?? "").trim();
    const status = (body.status ?? "draft").toLowerCase() as "draft" | "final";
    const value = body.value ?? null;

    if (!projectId || !itemCode) {
      return NextResponse.json(
        { ok: false, error: "projectId and itemCode are required" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // 1) püüame salvestada cdm_records sisse (MVP: schema: project_id, type, ctx, code, status, data)
    const payload = {
      project_id: projectId,
      type: "vsme",
      ctx: "item",
      code: itemCode,
      status,
      data: { value },
    };

    const { error } = await supabase.from("cdm_records").insert(payload);
    if (error) {
      // 2) fallback — vähemalt logime auditisse, kuid ei kuku läbi
      await supabase.from("audit_entries").insert({
        project_id: projectId,
        type: "save",
        ctx: "vsme:item",
        data: { itemCode, status, value, note: "cdm_records insert failed", supabase_error: error.message },
      });
      return NextResponse.json({
        ok: true,
        note: "Saved to audit log (cdm_records insert failed on this environment).",
      });
    }

    // audit loosime nagunii
    await supabase.from("audit_entries").insert({
      project_id: projectId,
      type: "save",
      ctx: "vsme:item",
      data: { itemCode, status, value },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}
