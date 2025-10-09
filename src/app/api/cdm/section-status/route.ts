// src/app/api/cdm/section-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getBundle } from '@/lib/cdm/schema.server';

type Counts = { final: number; draft: number; total: number };
type Status = 'not_started' | 'draft' | 'final' | 'ready';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const project = searchParams.get('project') || '';
    const sectionRaw = searchParams.get('code') || '';

    if (!project || !sectionRaw) {
      return NextResponse.json(
        { ok: false, error: 'Missing project or code' },
        { status: 400 }
      );
    }

    // Normaliseeri sektsiooni kood (B1, B2, ...)
    const section = sectionRaw.toUpperCase();

    // Leia sektsiooni itemid bundle’ist
    const bundle = await getBundle();
    const sec = (bundle.sections || []).find((s: any) => (s.code || '').toUpperCase() === section);
    const itemCodes: string[] = Array.isArray(sec?.items)
      ? sec.items.map((it: any) => it.code).filter(Boolean)
      : [];

    // Valmista ette defaults
    const statuses: Record<string, Status> = {};
    const updated: Record<string, string | null> = {};
    for (const code of itemCodes) {
      statuses[code] = 'not_started';
      updated[code] = null;
    }

    // Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Loeme olemasolevad read antud sektsiooni kohta
    const { data, error } = await supabase
      .from('cdm_records')
      .select('code,status,updated_at,section_code')
      .eq('project_id', project)
      .eq('section_code', section);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Arvuta loendurid + uuenda staatuseid
    const counts: Counts = { final: 0, draft: 0, total: itemCodes.length };

    for (const row of data || []) {
      const code = row.code as string;
      const st = (row.status as string) || 'not_started';

      if (code && code in statuses) {
        // map 'ready' → 'final' visuaalselt
        const norm: Status = st === 'ready' ? 'final' : (st as Status);
        statuses[code] = norm;

        if (row.updated_at) {
          const ts = new Date(row.updated_at).toISOString();
          if (!updated[code] || ts > (updated[code] as string)) {
            updated[code] = ts;
          }
        }
      }
    }

    // Lõpuks loe loendurid
    for (const code of itemCodes) {
      const st = statuses[code];
      if (st === 'final') counts.final += 1;
      else if (st === 'draft' || st === 'partial') counts.draft += 1;
    }

    return NextResponse.json({
      ok: true,
      project,
      section,
      statuses,
      updated,
      counts,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'section-status failed' }, { status: 500 });
  }
}
