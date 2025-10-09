// src/app/api/evidence/[id]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v as string;
}

export async function DELETE(
  _req: Request,
  ctx: { params: { id?: string } }
) {
  try {
    const id = ctx.params?.id?.trim();
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });
    }

    const supabase = createClient(
      mustEnv('NEXT_PUBLIC_SUPABASE_URL'),
      mustEnv('SUPABASE_SERVICE_ROLE_KEY') // serveris lubatud
    );

    const { error } = await supabase.from('evidence').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Server error' },
      { status: 500 }
    );
  }
}
