import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/client';

export async function POST(req: Request) {
  try {
    const payload = await req.json().catch(() => ({}));
    const { projectId, sectionCode, draft, cdm } = payload || {};

    if (!projectId || !sectionCode) {
      return NextResponse.json(
        { ok: false, error: 'Missing projectId or sectionCode' },
        { status: 400 }
      );
    }
    if (!draft && !cdm) {
      return NextResponse.json(
        { ok: false, error: 'Nothing to save (provide draft or cdm)' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const now = new Date().toISOString();

    // loe olemasolev
    const { data: existing, error: readErr } = await supabase
      .from('cdm_records')
      .select('cdm,draft')
      .eq('project_id', projectId)
      .eq('section_code', sectionCode)
      .maybeSingle();
    if (readErr) throw readErr;

    const newRow = {
      project_id: projectId,
      section_code: sectionCode,
      cdm: cdm ?? existing?.cdm ?? null,
      draft: draft ?? existing?.draft ?? null,
      updated_at: now,
    };

    const { error: upsertErr } = await supabase
      .from('cdm_records')
      .upsert(newRow, { onConflict: 'project_id,section_code' });

    if (upsertErr) throw upsertErr;

    return NextResponse.json({ ok: true, data: newRow });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}
