// src/app/api/cdm/item/answers/route.ts
import { NextResponse } from 'next/server';
import { getItemAnswers, setItemAnswers, appendAudit } from '@/lib/cdm/state.server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const project = searchParams.get('project') ?? '';
  const code = searchParams.get('code') ?? '';
  if (!project || !code) {
    return NextResponse.json({ ok: false, error: 'Missing project or code' }, { status: 400 });
  }
  const data = await getItemAnswers(project, code);
  return NextResponse.json({ ok: true, data });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const project = body.project ?? '';
  const code = body.code ?? '';
  const data = body.data ?? {};
  if (!project || !code) {
    return NextResponse.json({ ok: false, error: 'Missing project or code' }, { status: 400 });
  }
  await setItemAnswers(project, code, data);
  await appendAudit({ at: new Date().toISOString(), project, type: 'save', ctx: code, data });
  return NextResponse.json({ ok: true });
}
