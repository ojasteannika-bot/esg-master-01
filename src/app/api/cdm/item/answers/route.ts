// src/app/api/cdm/item/answers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { readAnswersFile, writeAnswersFile } from '@/lib/cdm/state.server';

function bad(msg: string, status = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const project = searchParams.get('project') ?? '';
    const code = searchParams.get('code') ?? '';
    if (!project || !code) return bad('Missing project or code');

    const data = await readAnswersFile(project, code);
    return NextResponse.json({ ok: true, project, code, data });
  } catch (err: any) {
    return bad(err?.message || 'Failed to load answers', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return bad('Invalid JSON body');

    const project = String(body.project ?? '');
    const code = String(body.code ?? '');
    const data = body.data ?? {};
    if (!project || !code) return bad('Missing project or code');

    await writeAnswersFile(project, code, data);
    return NextResponse.json({ ok: true, project, code, savedAt: Date.now() });
  } catch (err: any) {
    return bad(err?.message || 'Failed to save answers', 500);
  }
}
