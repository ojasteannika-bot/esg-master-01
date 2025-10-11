import { NextResponse } from 'next/server';
import { listEvidence } from '@/lib/cdm/state.server';

export async function GET(req: Request) {
  const u = new URL(req.url);
  const project = u.searchParams.get('project') || 'demo-project-01';
  const code = u.searchParams.get('code');
  if (!code) return NextResponse.json({ ok: false, error: 'code required' }, { status: 400 });
  const items = await listEvidence(project, code);
  return NextResponse.json({ ok: true, project, code, items });
}
