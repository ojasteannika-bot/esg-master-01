// src/app/api/cdm/section-stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getCodesBySection } from '@/lib/cdm/questions';

const ROOT = process.cwd();
const STATUS_DIR  = path.join(ROOT, '.data', 'esglite', 'status');

function bad(msg: string, status = 400) {
  return NextResponse.json({ ok:false, error: msg }, { status });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const project = searchParams.get('project') ?? '';
    const section = searchParams.get('section') ?? '';
    if (!project || !section) return bad('Missing project or section');

    const codes = getCodesBySection(section);
    if (!codes.length) return NextResponse.json({ ok:true, section, project, total: 0, completed: 0, percent: 0, items: [] });

    // loe failid; puudumisel 'draft'
    await fs.mkdir(STATUS_DIR, { recursive: true });
    const items = [];
    let completed = 0;

    for (const code of codes) {
      const safeProject = project.replace(/[^a-zA-Z0-9._-]/g, '_');
      const safeCode = code.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fp = path.join(STATUS_DIR, `${safeProject}__${safeCode}.json`);
      let status: 'draft'|'final' = 'draft';
      try {
        const txt = await fs.readFile(fp, 'utf8');
        const j = JSON.parse(txt);
        status = j?.status === 'final' ? 'final' : 'draft';
      } catch (_) {}
      if (status === 'final') completed += 1;
      items.push({ code, status });
    }

    const total = codes.length;
    const percent = total ? Math.round((completed/total)*100) : 0;

    return NextResponse.json({ ok:true, section, project, total, completed, percent, items });
  } catch (e:any) {
    return bad(e?.message || 'Failed to compute section stats', 500);
  }
}
