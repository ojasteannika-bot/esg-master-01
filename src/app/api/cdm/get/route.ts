import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/client';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const projectId = url.searchParams.get('projectId');
    const sectionCode = url.searchParams.get('sectionCode');

    if (!projectId || !sectionCode) {
      return NextResponse.json(
        { ok: false, error: 'Missing projectId or sectionCode' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('cdm_records')
      .select('cdm,draft')
      .eq('project_id', projectId)
      .eq('section_code', sectionCode)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ ok: true, data: data ?? null });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}
