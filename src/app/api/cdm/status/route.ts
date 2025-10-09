import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../../lib/supabase/admin';

// GET /api/cdm/status?projectId=...
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const projectId = url.searchParams.get('projectId') ?? '';
    if (!projectId) {
      return NextResponse.json({ ok: false, error: 'Missing projectId' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // unique(project_id, section_code) -> max 1 rida sektsiooni kohta
    const { data, error } = await supabase
      .from('cdm_records')
      .select('section_code, cdm, draft, created_at, updated_at')
      .eq('project_id', projectId);
    if (error) throw error;

    const mapped = (data ?? []).map((r) => ({
      section_code: r.section_code as string,
      has_final: !!r.cdm,
      has_draft: !!r.draft,
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
    }));

    return NextResponse.json({ ok: true, data: mapped });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}
