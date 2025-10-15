// src/app/api/cdm/progress/route.ts
import { NextResponse } from 'next/server';
import { getSections } from '@/lib/cdm/catalog';
import { getSectionProgress } from '@/lib/cdm/progress.server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const project = searchParams.get('project') || 'client-test1';

  const sections = getSections();
  const rows = await Promise.all(sections.map(s => getSectionProgress(project, s.code)));

  return NextResponse.json({ project, sections: rows });
}
