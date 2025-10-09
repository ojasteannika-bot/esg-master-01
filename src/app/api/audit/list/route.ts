import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../../lib/supabase/admin';

// GET /api/audit/list?projectId=...&limit=50&from=YYYY-MM-DD&to=YYYY-MM-DD&includeNav=1&type=save
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const projectId = url.searchParams.get('projectId') ?? '';
    const limit = Math.min(Number(url.searchParams.get('limit') || 50), 1000);
    const includeNav = url.searchParams.get('includeNav') === '1';
    const from = url.searchParams.get('from') || '';
    const to = url.searchParams.get('to') || '';
    const type = url.searchParams.get('type') || '';

    if (!projectId) {
      return NextResponse.json({ ok: false, error: 'Missing projectId' }, { status: 400 });
    }

    const supabase = createAdminClient();

    let q = supabase
      .from('audit_entries')
      .select('id, ts, project_id, type, ctx, data')
      .eq('project_id', projectId);

    if (!includeNav) q = q.neq('type', 'nav');
    if (from) q = q.gte('ts', from);
    if (to) q = q.lte('ts', to);
    if (type) q = q.eq('type', type);

    q = q.order('ts', { ascending: false }).limit(limit);

    const { data, error } = await q;
    if (error) throw error;

    return NextResponse.json({ ok: true, data: data ?? [] });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}
