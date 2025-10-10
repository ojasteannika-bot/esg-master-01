import { NextResponse } from 'next/server';
import { appendAudit } from '@/lib/cdm/state.server';

type Body = {
  project: string;
  type: string;
  ctx?: string | null;
  data?: any;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    if (!body?.project || !body?.type) {
      return NextResponse.json({ ok:false, error:'Missing project or type' }, { status:400 });
    }
    await appendAudit({
      at: new Date().toISOString(),
      project: body.project,
      type: body.type,
      ctx: body.ctx ?? null,
      data: body.data ?? null,
    });
    return NextResponse.json({ ok:true });
  } catch (err: any) {
    return NextResponse.json({ ok:false, error:String(err?.message ?? err) }, { status:500 });
  }
}
