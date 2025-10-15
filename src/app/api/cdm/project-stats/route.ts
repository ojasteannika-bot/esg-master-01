// src/app/api/cdm/project-stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { SECTION_INDEX } from '@/lib/cdm/questions';

const ROOT = process.cwd();
const STATUS_DIR = path.join(ROOT, '.data', 'esglite', 'status');

function bad(msg: string, status = 400) {
  return NextResponse.json({ ok:false, error: msg }, { status });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const project = searchParams.get('project') ?? '';
    if (!project) return bad('Missing project');

    await fs.mkdir(STATUS_DIR, { recursive: true });

    let total = 0;
    let completed = 0;
    const sections: Record<string, { total:number; completed:number }> = {};

    for (const [section, codes] of Object.entries(SECTION_INDEX)) {
      let stTotal = 0;
      let stCompleted = 0;

      for (const code of codes) {
        stTotal += 1;
        total += 1;

        const safeProject = project.replace(/[^a-zA-Z0-9._-]/g, '_');
        const safeCode = code.replace(/[^a-zA-Z0-9._-]/g, '_');
        const fp = path.join(STATUS_DIR, `${safeProject}__${safeCode}.json`);
        try {
          const txt = await fs.readFile(fp, 'utf8');
          const j = JSON.parse(txt);
          if (j?.status === 'final') { stCompleted += 1; completed += 1; }
        } catch { /* missing -> draft */ }
      }

      sections[section] = { total: stTotal, completed: stCompleted };
    }

    const percent = total ? Math.round((completed/total)*100) : 0;
    return NextResponse.json({ ok:true, project, total, completed, percent, sections });
  } catch (e:any) {
    return bad(e?.message || 'Failed to compute project stats', 500);
  }
}
