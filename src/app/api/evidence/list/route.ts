// src/app/api/evidence/list/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'; // vältib agressiivset cache'i

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const project = url.searchParams.get('project') || '';
    const code = url.searchParams.get('code') || '';

    if (!project || !code) {
      return NextResponse.json(
        { ok: false, error: 'Missing ?project and/or ?code' },
        { status: 400 }
      );
    }

    // Serveris on ohutu kasutada service role key'd (RLS võib olla lubatud/keelatud).
    const supabase = createClient(
      mustEnv('NEXT_PUBLIC_SUPABASE_URL'),
      mustEnv('SUPABASE_SERVICE_ROLE_KEY')
    );

    // NB! Siin peab veerunimi ühtima sinu tabeli skeemiga.
    // Kasutame 'code' (mitte 'item_code').
    const { data, error } = await supabase
      .from('evidence')
      .select('*')
      .eq('project_id', project)
      .eq('code', code)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, items: data ?? [] });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Unknown error' },
      { status: 500 }
    );
    }
}
