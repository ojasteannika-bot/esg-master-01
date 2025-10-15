import { NextResponse } from 'next/server';
import { ESGLITE_SECTIONS } from '@/lib/esglite';
export async function GET() { return NextResponse.json({ sections: ESGLITE_SECTIONS }); }
