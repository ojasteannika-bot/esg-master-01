import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

type Payload = {
  project_id: string;
  type: string;   // 'save' | 'nav' | 'field' | ...
  ctx?: string;   // vabatahtlik konteksti väli
  data?: any;     // suvaline JSON
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;

    if (!body?.project_id || !body?.type) {
      return NextResponse.json(
        { ok: false, error: 'Missing project_id or type' },
        { status: 400 }
      );
    }

    const supabase = admin();
    const { error } = await supabase.from('audit_entries').insert({
      project_id: body.project_id,
      ts: new Date().toISOString(),
      type: body.type,
      ctx: body.ctx ?? null,
      data: body.data ?? null,
    });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
