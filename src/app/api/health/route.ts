import { NextResponse } from 'next/server';
import { ESGLITE_SECTIONS, ESLITE_SECTIONS } from '@/lib/esglite';

// noop – aga paneme globaali külge, kui mõni fail eeldab window/ globalThis muutujat
(globalThis as any).ESGLITE_SECTIONS = ESGLITE_SECTIONS;
(globalThis as any).ESLITE_SECTIONS = ESLITE_SECTIONS;

export function GET() {
  return NextResponse.json({ ok: true, sections: ESGLITE_SECTIONS });
}
