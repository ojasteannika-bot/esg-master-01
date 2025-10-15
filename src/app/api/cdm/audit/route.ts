import { NextResponse } from 'next/server';
export function GET(){ return NextResponse.json({ok:false, error:'Not implemented'}, { status:404 }); }
