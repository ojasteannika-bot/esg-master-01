import { NextResponse } from "next/server";
import {
  safeGetAllSections,
  safeGetSectionWithItems,
} from "@/lib/cdm/schema.server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const project = url.searchParams.get("project") || "demo-project-01";

  try {
    const secs = await safeGetAllSections();

    const sections = await Promise.all(
      secs.map(async (s) => {
        const { section, items } = await safeGetSectionWithItems(s.code);
        return {
          section: {
            code: section.code,
            title: section.title ?? "",
            description: (section as any).description ?? "",
          },
          items: items ?? [],
        };
      })
    );

    return NextResponse.json({ ok: true, project, sections });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "failed to load sections" },
      { status: 500 }
    );
  }
}
