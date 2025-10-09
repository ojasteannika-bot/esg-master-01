import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client'; // sama util mida juba kasutasid

// GET /api/vsme/records?project=client-test1&code=B1-1
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const project = searchParams.get('project') ?? '';
  const code = searchParams.get('code') ?? '';

  const supabase = createClient();
  const { data, error } = await supabase
    .from('cdm_records')
    .select('project_id, code, section_code, status, value, notes, updated_at')
    .eq('project_id', project)
    .eq('code', code)
    .maybeSingle();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, record: data });
}

// POST body: { projectId, code, value, notes, status }
export async function POST(req: Request) {
  const body = await req.json();
  const projectId: string = body.projectId;
  const code: string = body.code;
  const status: 'draft' | 'final' = body.status ?? 'draft';
  const value = body.value ?? null;
  const notes = body.notes ?? null;

  if (!projectId || !code) {
    return NextResponse.json({ ok: false, error: 'projectId and code are required' }, { status: 400 });
  }

  const section_code = code.split('-')[0];
  const supabase = createClient();

  const payload = { project_id: projectId, code, section_code, status, value, notes };

  const { data, error } = await supabase
    .from('cdm_records')
    .upsert(payload, { onConflict: 'project_id,code' })
    .select()
    .maybeSingle();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, record: data });
}
