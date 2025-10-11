import { NextResponse } from 'next/server';
import { getItemStatus, setItemStatus } from '@/lib/cdm/state.server';
import { appendAudit } from '@/lib/cdm/state.server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const project = searchParams.get('project') ?? '';
  const code = searchParams.get('code') ?? '';
  if (!project || !code) {
    return NextResponse.json({ ok: false, error: 'Missing project or code' }, { status: 400 });
  }
  const status = await getItemStatus(project, code);
  return NextResponse.json({ ok: true, project, code, status });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const project: string = body?.project ?? '';
    const code: string = body?.code ?? '';
    const status: 'not_started' | 'draft' | 'final' = body?.status ?? 'not_started';
    if (!project || !code) {
      return NextResponse.json({ ok: false, error: 'Missing project or code' }, { status: 400 });
    }
    await setItemStatus(project, code, status);

    await appendAudit({
      at: new Date().toISOString(),
      project,
      type: 'save',
      ctx: code,
      data: { field: 'status', value: status },
    });

    return NextResponse.json({ ok: true, project, code, status: { status, updated: new Date().toISOString() } });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}
