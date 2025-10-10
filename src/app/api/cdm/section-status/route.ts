// src/app/api/cdm/section-status/route.ts
import { NextResponse } from 'next/server';
import { ESGLITE_SECTIONS } from '@/lib/cdm/catalog';
import { getSectionProgress } from '@/lib/cdm/state.server';

// GET /api/cdm/section-status?project=client-test1&code=B1
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const project = searchParams.get('project') ?? '';
  const code = searchParams.get('code') ?? '';

  if (!project || !code) {
    return NextResponse.json(
      { ok: false, error: 'Missing project or code' },
      { status: 400 }
    );
  }

  const sec = ESGLITE_SECTIONS.find(s => s.code === code);
  const codes = sec?.items ?? [];

  // Kui items puuduvad, näitame 0% (või 100% kui tahad)
  if (codes.length === 0) {
    return NextResponse.json({ ok: true, completed: 0, total: 0, percent: 0 });
  }

  const { completed, total } = await getSectionProgress(project, codes);
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return NextResponse.json({ ok: true, completed, total, percent });
}
