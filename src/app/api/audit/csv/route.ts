import { createAdminClient } from '../../../../lib/supabase/admin';

function csvEscape(v: unknown) {
  if (v === null || v === undefined) return '""';
  const s = String(v).replace(/"/g, '""');
  return `"${s}"`;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const projectId = url.searchParams.get('projectId') ?? '';
    const limit = Math.min(Number(url.searchParams.get('limit') || 100), 5000);
    const includeNav = url.searchParams.get('includeNav') === '1';
    const from = url.searchParams.get('from') || '';
    const to = url.searchParams.get('to') || '';
    const type = url.searchParams.get('type') || '';
    const bom = url.searchParams.get('bom') === '1';

    if (!projectId) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing projectId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createAdminClient();

    let q = supabase
      .from('audit_entries')
      .select('ts, project_id, type, ctx, data')
      .eq('project_id', projectId);

    if (!includeNav) q = q.neq('type', 'nav');
    if (from) q = q.gte('ts', from);
    if (to) q = q.lte('ts', to);
    if (type) q = q.eq('type', type);

    q = q.order('ts', { ascending: false }).limit(limit);

    const { data, error } = await q;
    if (error) throw error;

    const lines: string[] = [];
    lines.push('ts,project_id,type,ctx,data');

    for (const r of data ?? []) {
      const dataJson = JSON.stringify(r.data ?? {});
      lines.push(
        [
          csvEscape(r.ts),
          csvEscape(r.project_id),
          csvEscape(r.type),
          csvEscape(r.ctx ?? ''),
          csvEscape(dataJson),
        ].join(',')
      );
    }

    const payload = (bom ? '\uFEFF' : '') + lines.join('\n');

    const fname =
      `audit_${projectId}_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;

    return new Response(payload, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fname}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: String(err?.message || err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Safari/Chrome võivad teha esmalt HEAD kontrolli — vastame OK-ga
export async function HEAD(_req: Request) {
  return new Response(null, { status: 200 });
}
