import { NextResponse } from "next/server";
import { fetchSectionStats } from "@/lib/vsme/stats";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = (searchParams.get("project") || "client-test1").trim();

  try {
    const stats = await fetchSectionStats(projectId);
    return NextResponse.json({ ok: true, project: projectId, ...stats });
  } catch (e: any) {
    console.error("section-stats GET error:", e?.message || e);
    return NextResponse.json({ ok: false, error: "stats_failed" }, { status: 500 });
  }
}
