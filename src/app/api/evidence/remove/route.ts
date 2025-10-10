import { NextResponse } from 'next/server';
import { removeEvidence } from '@/lib/cdm/state.server';
import { appendAudit } from '@/lib/cdm/state.server';

export async function POST(req: Request) {
  try {
    const body = await req.json() as { project?: string; code?: string; id?: string };
    const project = body.project ?? '';
    const code = body.code ?? '';
    const id = body.id ?? '';
    if (!project || !code || !id) {
      return NextResponse.json({ ok: false, error: 'Missing project/code/id' }, { status: 400 });
    }
    const res = await removeEvidence(project, code, id);

    // AUDIT
    await appendAudit({
      at: new Date().toISOString(),
      project,
      type: 'evidence_remove',
      ctx: code,
      data: { id }
    });

    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}
