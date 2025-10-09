// src/app/api/cdm/save/route.ts
import 'server-only';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { deriveSectionCode } from '@/lib/cdm/derive';

// Väike abi
function bad(msg: string, code = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status: code });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return bad('Invalid JSON');

    const project = (body.project || '').trim();
    const code = (body.code || '').trim();
    const patch = (body.patch || {}) as {
      values?: Record<string, any>;
      status?: 'not_started' | 'draft' | 'final';
      // NB! section_code't EI kasutata enam, ignoreerime
    };
    const finalize = !!body.finalize;

    if (!project) return bad('Missing project');
    if (!code) return bad('Missing code');

    // 🔒 PÜSIV KAITSE: tuletame alati section_code koodist
    const section_code = deriveSectionCode(code);

    // Statusi reegel
    const status: 'not_started' | 'draft' | 'final' =
      finalize ? 'final' : (patch.status || 'draft');

    // Supabase kliendi loomine
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    if (!supabaseUrl || !supabaseKey) {
      return bad('Supabase env missing', 500);
    }
    const sb = createClient(supabaseUrl, supabaseKey);

    // Upsert logika: eeldame unikaalset (project_id, code)
    // Andmemudel: cdm_records(project_id, code, section_code, status, cdm jsonb, updated_at ...)
    const nowValues = patch.values ?? {};

    const { data, error } = await sb
      .from('cdm_records')
      .upsert(
        [{
          project_id: project,
          code,
          section_code, // <- alati derive’itud
          status,
          // hoia kasutaja väärtused ühe 'cdm' jsonb all
          cdm: { values: nowValues },
        }],
        { onConflict: 'project_id,code' }
      )
      .select('project_id, code, section_code, status, updated_at')
      .single();

    if (error) return bad(error.message, 500);

    return NextResponse.json({
      ok: true,
      project: data.project_id,
      code: data.code,
      section_code: data.section_code,
      status: data.status,
      updated_at: data.updated_at,
    });
  } catch (e: any) {
    return bad(e?.message || 'Save failed', 500);
  }
}
