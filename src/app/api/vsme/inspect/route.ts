import { NextRequest, NextResponse } from "next/server";
import { readVsmeBundle, findSection, enumerateQuestions } from "@/lib/vsme/schema";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = (searchParams.get("code") || "").trim();

    if (!code) {
      return NextResponse.json({ ok: false, error: "Missing ?code=" }, { status: 400 });
    }

    const bundle = readVsmeBundle();
    const section = findSection(code, bundle);
    if (!section) {
      return NextResponse.json({ ok: false, error: `Section ${code} not found` }, { status: 404 });
    }

    const questions = enumerateQuestions(section);

    return NextResponse.json({
      ok: true,
      section: { code: section.code, title: section.title },
      questions, // [{ key, label, type, help?, options? }]
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
