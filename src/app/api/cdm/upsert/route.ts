import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

type Body = {
  projectId: string;
  sectionCode: string;
  draft?: any;
  cdm?: any;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const { projectId, sectionCode, draft, cdm } = body;

    if (!projectId || !sectionCode) {
      return NextResponse.json(
        { ok: false, error: 'Missing projectId or sectionCode' },
        { status: 400 }
      );
    }

    const supabase = admin();

    // upsert CDM/draft
    const { error } = await supabase.from('cdm_records').upsert(
      {
        project_id: projectId,
        section_code: sectionCode,
        cdm: cdm ?? null,
        draft: draft ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'project_id,section_code' }
    );

    if (error) throw error;

    // audit (serverist)
    await supabase.from('audit_entries').insert({
      project_id: projectId,
      ts: new Date().toISOString(),
      type: 'save',
      ctx: `vsme:${sectionCode}`,
      data: { mode: cdm ? 'final' : 'draft' },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
