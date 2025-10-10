// src/app/api/cdm/section-status/route.ts
import { NextResponse } from "next/server";
import {
  safeGetSectionWithItems,
  computeProgress,
} from "@/lib/cdm/schema.server";

// Force dynamic so dev/prod won’t cache this route
export const dynamic = "force-dynamic";

type ItemStatus = "not_started" | "draft" | "final";
type Progress = { completed: number; total: number };

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const project = searchParams.get("project") ?? "demo-project-01";
    const code = (searchParams.get("code") ?? "").toUpperCase();

    if (!code) {
      return NextResponse.json(
        { ok: false, error: "missing code" },
        { status: 400 }
      );
    }

    // Load section + items from bundle (failsafe if missing)
    const section = await safeGetSectionWithItems(code);
    if (!section) {
      return NextResponse.json(
        { ok: false, error: "unknown section", project, code },
        { status: 404 }
      );
    }

    // Default item list
    const itemCodes: string[] = Array.isArray(section.items)
      ? section.items.map((it: any) => String(it.code)).filter(Boolean)
      : [];

    // Compute progress (fallback to zeros on any error)
    let progress: Progress = { completed: 0, total: itemCodes.length };
    try {
      const p = await (computeProgress as any)(project, section);
      if (p && typeof p.completed === "number" && typeof p.total === "number") {
        progress = { completed: p.completed, total: p.total };
      }
    } catch {
      // ignore – keep default progress
    }

    // Very light default statuses so the UI has something to render
    const items = itemCodes.map((c) => ({
      code: c,
      status: "not_started" as ItemStatus,
      updated: null as string | null,
    }));

    // Optionally derive draft/final counts from statuses (all not_started here)
    const counts = {
      final: items.filter((i) => i.status === "final").length,
      draft: items.filter((i) => i.status === "draft").length,
      total: items.length,
    };

    return NextResponse.json({
      ok: true,
      project,
      code,
      progress,
      counts,
      items,
    });
  } catch (e: any) {
    // Never kill the page with 500; return an ok:false payload instead
    return NextResponse.json(
      { ok: false, error: e?.message ?? "unexpected error" },
      { status: 200 }
    );
  }
}
