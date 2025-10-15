import { NextResponse } from 'next/server';
export async function POST(req: Request) {
  const ct = req.headers.get('content-type') || '';
  if (ct.includes('application/json')) { await req.json().catch(()=>null); }
  else if (ct.includes('application/x-www-form-urlencoded')) { await req.formData().catch(()=>null); }
  return NextResponse.json({ ok: true });
}
