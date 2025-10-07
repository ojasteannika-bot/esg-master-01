import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  let payload: any = null;
  try { payload = await req.json(); } catch { /* no body */ }

  const bytes = payload ? JSON.stringify(payload).length : 0;

  return NextResponse.json({
    ok: true,
    received: {
      hasA: !!payload?.a,
      hasB: !!payload?.b,
      reportId: payload?.reportId ?? null,
      bytes,
    },
    ts: new Date().toISOString(),
    note: 'Stub only. Backend wiring comes later.',
  });
}
