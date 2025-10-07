import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/client';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const projectId = url.searchParams.get('projectId') || 'demo-project-01';

    const supabase = createClient();
    const { data, error } = await supabase
      .from('audit_entries')
      .select('*')
      .eq('project_id', projectId)
      .order('ts', { ascending: false })
      .limit(200);

    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}
