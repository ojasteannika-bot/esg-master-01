// src/app/api/cdm/section-status/route.ts
import { NextResponse } from 'next/server';
import { getSectionStatus } from '@/lib/cdm/state.server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const project = searchParams.get('project') ?? '';
  const code = searchParams.get('code') ?? '';
  if (!project || !code) {
    return NextResponse.json({ ok: false, error: 'Missing project or code' }, { status: 400 });
  }
  const info = await getSectionStatus(project, code);
  return NextResponse.json({ ok: true, ...info });
}
