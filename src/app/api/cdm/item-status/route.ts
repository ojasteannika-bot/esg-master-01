// src/app/api/cdm/item-status/route.ts
import { NextResponse } from 'next/server';
import { getItemStatus, setItemStatus, appendAudit } from '@/lib/cdm/state.server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const project = searchParams.get('project') ?? '';
  const code = searchParams.get('code') ?? '';
  if (!project || !code) {
    return NextResponse.json({ ok: false, error: 'Missing project or code' }, { status: 400 });
  }
  const status = await getItemStatus(project, code);
  return NextResponse.json({ ok: true, status });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const project = body.project ?? '';
  const code = body.code ?? '';
  const status = body.status ?? '';
  if (!project || !code || !status) {
    return NextResponse.json({ ok: false, error: 'Missing project/code/status' }, { status: 400 });
  }
  await setItemStatus(project, code, status);
  await appendAudit({ at: new Date().toISOString(), project, type: 'status', ctx: code, data: { status } });
  return NextResponse.json({ ok: true });
}
