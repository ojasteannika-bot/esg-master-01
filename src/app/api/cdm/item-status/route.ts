import { NextResponse } from 'next/server';
import { safeGetSectionWithItems } from '@/lib/cdm/schema.server';
import { getItemStatus, setItemStatus } from '@/lib/cdm/state.server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const project = searchParams.get('project') ?? 'demo-project-01';
  const code = searchParams.get('code'); // nt "B1-1"

  if (!code) {
    return NextResponse.json({ ok: false, error: 'missing code' }, { status: 400 });
  }

  const sectionCode = code.split('-')[0];
  const section = safeGetSectionWithItems({ code: sectionCode });
  if (!section) {
    return NextResponse.json({ ok: false, error: 'unknown section' }, { status: 404 });
  }

  const status = await getItemStatus(project, code);
  return NextResponse.json({ ok: true, project, code, status });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as { project?: string; code?: string; status?: 'not_started'|'draft'|'final' } | null;
  if (!body?.code || !body?.status) {
    return NextResponse.json({ ok: false, error: 'missing code/status' }, { status: 400 });
  }

  const project = body.project ?? 'demo-project-01';
  await setItemStatus(project, body.code, body.status);

  return NextResponse.json({ ok: true });
}
