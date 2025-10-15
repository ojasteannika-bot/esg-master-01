import { NextResponse } from 'next/server';
import fs from 'fs/promises';
export async function POST(req: Request) {
  const body = await req.json().catch(()=>null) as any;
  try {
    if (body?.project && body?.code) {
      await fs.mkdir(`.data/esglite/${body.project}`,{recursive:true});
      await fs.writeFile(`.data/esglite/${body.project}/${body.code}.json`, JSON.stringify(body, null, 2));
    }
  } catch {}
  return NextResponse.json({ ok: true });
}
