import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function POST(req: Request) {
  try {
    const supabase = createClient();

    // kui body polnud JSON, ära kuku läbi
    const body = await req.json().catch(() => ({} as any));

    const row = {
      project_id: body.project_id ?? 'demo-project-01',
      ts: new Date().toISOString(),
      type: body.type ?? 'test',
      ctx: body.ctx ?? null,
      data: body.data ?? null,
    };

    const { error } = await supabase.from('audit_entries').insert(row);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}
