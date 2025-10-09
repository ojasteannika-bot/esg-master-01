// src/app/api/evidence/add/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const project = (body.project || '').trim();
    const code = (body.code || '').trim();          // <-- kasutame 'code'
    const kind = (body.kind || '').trim();          // 'url' | 'file'
    const url = body.url || body.path_or_url || body.filePath || '';
    const tags = Array.isArray(body.tags) ? body.tags : [];

    if (!project || !code || !kind) {
      return NextResponse.json(
        { ok: false, error: 'Missing project | code | kind' },
        { status: 400 }
      );
    }
    if (kind === 'url' && !url) {
      return NextResponse.json({ ok: false, error: 'Missing url' }, { status: 400 });
    }

    // kasuta serveris role-key'd (turvaline serveris; .env.local peab sisaldama SUPABASE_SERVICE_ROLE_KEY)
    const supabase = createClient(
      mustEnv('NEXT_PUBLIC_SUPABASE_URL'),
      mustEnv('SUPABASE_SERVICE_ROLE_KEY')
    );

    const { data, error } = await supabase
      .from('evidence')
      .insert({
        project_id: project,
        code,                    // <-- joondatud tabeli veeruga
        kind,                    // 'url' | 'file'
        path_or_url: url,
        tags,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, evidence: data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Internal error' },
      { status: 500 }
    );
  }
}
