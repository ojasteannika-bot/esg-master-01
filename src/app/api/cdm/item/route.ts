import { NextResponse } from 'next/server';
import { z } from 'zod';
import { safeGetItem } from '@/lib/cdm/schema.server';
import { createClient } from '@supabase/supabase-js';

const Q = z.object({
  project: z.string().min(1),                       // lubame inimloetavad ID-d
  code: z.string().regex(/^[A-Z]+\d+-\d+$/i),       // B1-1, B1-2, C3-10 jne
});

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = Q.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid query' },
      { status: 400 },
    );
  }
  const { project, code } = parsed.data;

  try {
    const schema = await safeGetItem(code);

    // Loe olemasolev kirje (kui on)
    const supa = sb();
    const { data, error } = await supa
      .from('cdm_records')
      .select('status, cdm, draft, updated_at, section_code, code')
      .eq('project_id', project)
      .eq('code', code)
      .maybeSingle();

    if (error) throw error;

    const item = {
      code,
      status: (data?.status ?? 'not_started') as 'not_started' | 'draft' | 'final',
      values: (data?.cdm ?? data?.draft ?? {}) as Record<string, any>,
      updated_at: data?.updated_at ?? null,
      section_code: data?.section_code ?? schema.section_code,
    };

    return NextResponse.json({
      ok: true,
      project,
      schema,      // definitsioon bundle’ist
      item,        // olemasolev vastus (kui oli)
      evidence: [],// (täidame hiljem)
      audit: [],   // (täidame hiljem)
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Item load failed' },
      { status: 500 },
    );
  }
}
