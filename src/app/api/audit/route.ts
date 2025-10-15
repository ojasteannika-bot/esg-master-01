import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';

export async function GET() {
  try {
    const buf = await fs.readFile('.data/audit/log.json');
    const text = buf.toString().trim();
    const json = text ? JSON.parse(text) : [];
    return NextResponse.json(Array.isArray(json) ? json : []);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const buf = await fs.readFile('.data/audit/log.json').catch(() => Buffer.from('[]'));
    const arr = (() => { try { return JSON.parse(buf.toString()) } catch { return [] } })();
    arr.push({ ts: new Date().toISOString(), ...body });
    await fs.writeFile('.data/audit/log.json', JSON.stringify(arr, null, 2));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
