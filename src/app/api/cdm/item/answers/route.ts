import { NextResponse } from 'next/server';
import { getItemAnswers, saveItemAnswers } from '@/lib/cdm/state.server';

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
  try {
    const body = await req.json() as { project?: string; code?: string; data?: Record<string, any> };
    if (!body.project || !body.code) {
      return NextResponse.json({ ok: false, error: 'Missing project or code' }, { status: 400 });
    }
    const saved = await saveItemAnswers(body.project, body.code, body.data ?? {});
    return NextResponse.json({ ok: true, data: saved });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}
