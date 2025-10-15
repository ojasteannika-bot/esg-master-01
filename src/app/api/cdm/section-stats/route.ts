import { NextResponse } from 'next/server';
import { ESGLITE_SECTIONS } from '@/lib/esglite';
export async function GET(req: Request) {
  const url = new URL(req.url);
  const project = url.searchParams.get('project') ?? 'client-XYZ';
  const stats = ESGLITE_SECTIONS.map(s => ({ code: s.code, done: 0, total: 4 }));
  return NextResponse.json({ project, stats });
}
