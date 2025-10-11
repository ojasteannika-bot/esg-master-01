// src/app/api/audit/list/route.ts
import { NextResponse } from 'next/server';
import { readAudit } from '@/lib/cdm/state.server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const project = searchParams.get('project') ?? '';
  if (!project) return NextResponse.json({ ok: false, error: 'Missing project' }, { status: 400 });

  const type = searchParams.get('type') ?? undefined;
  const from = searchParams.get('from') ?? undefined;
  const to   = searchParams.get('to') ?? undefined;
  const limit = Number(searchParams.get('limit') ?? '100');
  const includeNav = searchParams.get('includeNav') === '1';

  const items = await readAudit({ project, type, from, to, limit, includeNav });
  return NextResponse.json({ ok: true, items });
}
