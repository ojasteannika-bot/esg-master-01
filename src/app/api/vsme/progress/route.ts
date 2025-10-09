// src/app/api/vsme/progress/route.ts
import { NextResponse } from 'next/server';
import { listSectionItems } from '@/lib/vsme/schema.server'; // SERVER ONLY

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const project = searchParams.get('project') || '';
  const section = searchParams.get('section') || '';

  if (!project || !section) {
    return NextResponse.json({ ok: false, error: 'Missing project/section' }, { status: 400 });
  }

  // loe bundle’ist palju on kokku
  const items = await listSectionItems(section);
  const total = items.length;

  // siia pane sinu tegelik DB loogika (draft/final loetud arv)
  // all mock (0 valmis)
  const completed = 0;

  return NextResponse.json({ ok: true, completed, total });
}
