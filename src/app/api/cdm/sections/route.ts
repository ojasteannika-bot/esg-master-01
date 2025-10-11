// src/app/api/cdm/sections/route.ts
import { NextResponse } from 'next/server';
import { ESGLITE_SECTIONS } from '@/lib/cdm/catalog';

export async function GET() {
  // Lihtne: tagastame kataloogi
  return NextResponse.json({ ok: true, sections: ESGLITE_SECTIONS });
}
