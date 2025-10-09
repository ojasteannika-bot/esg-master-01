import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/vsme/status?project=client-X&codes=B1-1,B1-2
 * Vastab: { ok:true, data:{ 'B1-1':'ready'|'partial'|'not_started', ... } }
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const project = (searchParams.get('project') || '').trim();
  const codesCsv = (searchParams.get('codes') || '').trim();

  if (!project || !codesCsv) {
    return NextResponse.json({ ok: false, error: 'project and codes are required' }, { status: 400 });
  }

  const codes = codesCsv.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
  if (codes.length === 0) {
    return NextResponse.json({ ok: false, error: 'no codes' }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(url, key);

  const { data, error } = await supabase
    .from('cdm_records')
    .select('code,status,value')
    .eq('project_id', project)
    .in('code', codes);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const statusMap: Record<string, 'not_started' | 'partial' | 'ready'> = {};
  // vaikimisi not_started
  for (const c of codes) statusMap[c] = 'not_started';

  for (const row of data || []) {
    const c = String(row.code).toUpperCase();
    const s = String(row.status || '').toLowerCase();
    const hasValue = row.value != null && JSON.stringify(row.value) !== 'null';
    if (s === 'ready') statusMap[c] = 'ready';
    else if (s === 'draft' || hasValue) statusMap[c] = 'partial';
  }

  return NextResponse.json({ ok: true, data: statusMap });
}
