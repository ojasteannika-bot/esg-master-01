// src/app/api/vsme/item/load/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const project = searchParams.get('project') || '';
    const code = (searchParams.get('code') || '').toUpperCase();

    if (!project || !code) {
      return NextResponse.json({ ok: false, error: 'Missing project or code' }, { status: 400 });
    }

    const supabase = createClient();

    // Võtame viimase kirje antud (project, code) kohta.
    const { data, error } = await supabase
      .from('cdm_records')
      .select('project_id, code, status, data, ts')
      .eq('project_id', project)
      .eq('code', code)
      .order('ts', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      record: data ?? null,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message ?? 'load failed' }, { status: 500 });
  }
}
