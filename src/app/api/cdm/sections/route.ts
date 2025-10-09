import { NextResponse } from 'next/server';
import { listSections } from '@/lib/cdm/find.server';
import { computeProgress } from '@/lib/cdm/schema.server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const project = (searchParams.get('project') || '').trim();
  if (!project) {
    return NextResponse.json({ ok: false, error: 'missing project' }, { status: 400 });
  }

  const sections = await listSections();
  const rows = await Promise.all(
    sections.map(async (s) => {
      const p = await computeProgress(project, s.code);
      return {
        code: s.code,
        title: s.title ?? s.code,
        total: p.total,
        final: p.final,
        draft: p.draft,
        not_started: p.not_started
      };
    })
  );

  return NextResponse.json({ ok: true, project, sections: rows });
}
