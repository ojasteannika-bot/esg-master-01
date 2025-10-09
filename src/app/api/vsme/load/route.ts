// src/app/api/vsme/load/route.ts
import { NextResponse } from 'next/server';
import { loadSectionFromSupabase } from '@/lib/vsme/storage';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const projectId = String(url.searchParams.get('projectId') || '');
    const code = String(url.searchParams.get('code') || '');

    if (!projectId || !code) {
      return NextResponse.json({ ok: false, error: 'Missing projectId or code' }, { status: 400 });
    }

    const res = await loadSectionFromSupabase(projectId, code);
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}
