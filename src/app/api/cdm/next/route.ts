// src/app/api/cdm/next/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/client';
import { getBundle, chooseNextItemCode } from '../../../../lib/cdm/schema.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const project = url.searchParams.get('project') || '';
  if (!project) {
    return NextResponse.json({ ok: false, error: 'Missing project' }, { status: 400 });
  }

  const supabase = createClient();
  const bundle = await getBundle();

  // Koosta järjestatud koodide nimekiri + map item->section
  const orderedCodes: string[] = [];
  const itemToSection = new Map<string, string>();
  for (const s of bundle.sections) {
    for (const it of s.items) {
      orderedCodes.push(it.code);
      itemToSection.set(it.code, s.code);
    }
  }
  if (orderedCodes.length === 0) {
    return NextResponse.json({ ok: false, error: 'Bundle has no items' }, { status: 404 });
  }

  // Loe projekti read
  const { data: rows, error } = await supabase
    .from('cdm_records')
    .select('code,status')
    .eq('project_id', project);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const nextCode = chooseNextItemCode(orderedCodes, (rows || []) as any);
  if (!nextCode) {
    // kõik valmis – suuna esimesele itemile
    const first = orderedCodes[0];
    return NextResponse.json({
      ok: true,
      done: true,
      code: first,
      section: itemToSection.get(first) || null,
    });
  }

  return NextResponse.json({
    ok: true,
    done: false,
    code: nextCode,
    section: itemToSection.get(nextCode) || null,
  });
}
