// src/app/api/vsme/item/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { inferSectionCode } from "@/lib/vsme/schema";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

type DbRow = {
  project_id: string;
  code: string;
  section_code: string;
  status: "draft" | "final";
  value: any;
  notes: string | null;
  updated_at?: string;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const project = (searchParams.get("project") || "").trim();
  const code = (searchParams.get("code") || "").trim();

  if (!project || !code) {
    return NextResponse.json({ ok: false, error: "Missing project or code" }, { status: 400 });
  }

  const { data, error } = await sb
    .from("cdm_records")
    .select("project_id, code, section_code, status, value, notes, updated_at")
    .eq("project_id", project)
    .eq("code", code)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, item: data ?? null });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const project = (body.project ?? "").trim();
  const code = (body.code ?? "").trim();
  const status = (body.status ?? "draft").trim();
  const value = body.value ?? null;
  const notes = body.notes ?? null;

  if (!project || !code) {
    return NextResponse.json({ ok: false, error: "Missing project or code" }, { status: 400 });
  }
  if (!["draft", "final"].includes(status)) {
    return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
  }

  const row: DbRow = {
    project_id: project,
    code,
    section_code: inferSectionCode(code),
    status,
    value,
    notes,
  };

  // Upsert ilma unique constraintita: kontrollime olemasolu ja teeme insert/update
  const { data: exists, error: selErr } = await sb
    .from("cdm_records")
    .select("project_id, code")
    .eq("project_id", project)
    .eq("code", code)
    .maybeSingle();

  if (selErr) return NextResponse.json({ ok: false, error: selErr.message }, { status: 500 });

  if (!exists) {
    const { error: insErr } = await sb.from("cdm_records").insert(row as any);
    if (insErr) return NextResponse.json({ ok: false, error: insErr.message }, { status: 500 });
  } else {
    const { error: updErr } = await sb
      .from("cdm_records")
      .update({ status, value, notes, section_code: row.section_code })
      .eq("project_id", project)
      .eq("code", code);

    if (updErr) return NextResponse.json({ ok: false, error: updErr.message }, { status: 500 });
  }

  // tagasta viimane seis
  const { data: saved } = await sb
    .from("cdm_records")
    .select("project_id, code, section_code, status, value, notes, updated_at")
    .eq("project_id", project)
    .eq("code", code)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ ok: true, item: saved ?? null });
}
