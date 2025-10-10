import { NextResponse } from 'next/server';
import { addEvidence } from '@/lib/cdm/state.server';
import { appendAudit } from '@/lib/cdm/state.server';

export async function POST(req: Request) {
  try {
    const body = await req.json() as { project?: string; code?: string; name?: string; url?: string };
    const project = body.project ?? '';
    const code = body.code ?? '';
    const name = body.name ?? '';
    const url = body.url ?? '';
    if (!project || !code || !name || !url) {
      return NextResponse.json({ ok: false, error: 'Missing project/code/name/url' }, { status: 400 });
    }
    const res = await addEvidence(project, code, name, url);

    // AUDIT
    await appendAudit({
      at: new Date().toISOString(),
      project,
      type: 'evidence_add',
      ctx: code,
      data: { id: res.evidence.id, name, url }
    });

    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}
