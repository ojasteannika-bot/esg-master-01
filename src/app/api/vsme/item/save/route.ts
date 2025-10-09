// src/app/api/vsme/item/save/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

type Payload = {
  project: string;        // nt "client-test1"
  code: string;           // nt "B1-1"
  status: 'draft' | 'final';
  value: string | number | null; // lihtne MVP väärtus (tekst või number)
  notes?: string | null;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<Payload>;
    const project = (body.project || '').trim();
    const code = (body.code || '').toString().toUpperCase();
    const status = (body.status || 'draft') as 'draft' | 'final';
    const value = body.value ?? null;
    const notes = body.notes ?? null;

    if (!project || !code) {
      return NextResponse.json({ ok: false, error: 'Missing project/code' }, { status: 400 });
    }

    const supabase = createClient();

    const row = {
      project_id: project,
      code,
      status,
      data: { value, notes },
      ts: new Date().toISOString(),
    };

    // Upsert unikaalsele (project_id, code) kombinatsioonile
    const { data, error } = await supabase
      .from('cdm_records')
      .upsert(row, { onConflict: 'project_id,code' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, record: data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message ?? 'save failed' }, { status: 500 });
  }
}
