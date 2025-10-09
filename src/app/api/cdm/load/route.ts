// src/app/api/cdm/load/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/client';
import { findItemAndSection } from '../../../../lib/cdm/schema.server';

export const dynamic = 'force-dynamic';

type ItemStatus = 'not_started' | 'partial' | 'ready';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const project = url.searchParams.get('project') || '';
  const code = url.searchParams.get('code') || '';

  if (!project || !code) {
    return NextResponse.json({ ok: false, error: 'Missing project or code' }, { status: 400 });
  }

  const supabase = createClient();

  // leia skeem bundle'ist + parent sektsioon
  const { item: schema, sectionCode } = await findItemAndSection(code);
  if (!schema || !sectionCode) {
    return NextResponse.json({ ok: false, error: 'Item not found in bundle' }, { status: 404 });
  }

  // loe cdm_records rida (project + code)
  const { data: list, error: errRow } = await supabase
    .from('cdm_records')
    .select('code,status,value,section_code')
    .eq('project_id', project)
    .eq('code', code);

  if (errRow) {
    return NextResponse.json({ ok: false, error: errRow.message }, { status: 500 });
  }

  const row: any = Array.isArray(list) ? list[0] : null;
  const status: ItemStatus =
    (row?.status === 'ready' || row?.status === 'partial' || row?.status === 'draft')
      ? (row.status === 'draft' ? 'partial' : (row.status as ItemStatus))
      : 'not_started';

  // sektsiooni progress (valikuline meta)
  const { data: secRows } = await supabase
    .from('cdm_records')
    .select('status')
    .eq('project_id', project)
    .eq('section_code', sectionCode);

  const total = schema ? 1 : 0; // per-item tasemel pole mõtet, jätame üldiseks
  const completed = (secRows || []).filter(r => String(r.status).toLowerCase() === 'ready').length;

  // audit viimased 10
  const { data: audit } = await supabase
    .from('audit_entries')
    .select('id, ts, type, ctx')
    .eq('project_id', project)
    .order('ts', { ascending: false })
    .limit(10);

  return NextResponse.json({
    ok: true,
    item: {
      code,
      status,
      values: row?.value || {},
    },
    schema,
    evidence: [], // WIP
    audit: (audit || []).map(a => ({
      id: a.id,
      action: a.type,
      actor_id: null,
      ts: a.ts,
    })),
    sectionStats: { completed, total }, // informatiivne
  });
}
