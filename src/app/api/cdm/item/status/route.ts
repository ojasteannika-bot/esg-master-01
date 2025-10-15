// src/app/api/cdm/item/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getItemStatus, setItemStatus, type ItemStatus } from '@/lib/cdm/state.server';

function bad(msg: string, status = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const project = searchParams.get('project') ?? '';
    const code = searchParams.get('code') ?? '';
    if (!project || !code) return bad('Missing project or code');
    const status = await getItemStatus(project, code);
    return NextResponse.json({ ok: true, project, code, status });
  } catch (e:any) {
    return bad(e?.message || 'Failed to load status', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return bad('Invalid JSON body');
    const project = String(body.project ?? '');
    const code = String(body.code ?? '');
    const status = String(body.status ?? 'draft') as ItemStatus;
    if (!project || !code) return bad('Missing project or code');
    if (status !== 'draft' && status !== 'final') return bad('Invalid status');
    await setItemStatus(project, code, status);
    return NextResponse.json({ ok: true, project, code, status, savedAt: Date.now() });
  } catch (e:any) {
    return bad(e?.message || 'Failed to save status', 500);
  }
}
