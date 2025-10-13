import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const project = searchParams.get("project") ?? "";
    const includeNav = searchParams.get("includeNav");
    const from = searchParams.get("from") ?? undefined;
    const to = searchParams.get("to") ?? undefined;
    const limit = Number(searchParams.get("limit") ?? "100");

    if (!project) {
      return NextResponse.json({ ok: false, error: "missing project" }, { status: 400 });
    }

    // MVP: turvaline tühi kokkuvõte
    return NextResponse.json({
      ok: true,
      project,
      range: { from, to },
      limit,
      counts: { total: 0, byType: {} as Record<string, number> },
      latestAt: null as string | null,
      items: [] as any[],
      nav: includeNav ? { prev: null, next: null } : undefined,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}
