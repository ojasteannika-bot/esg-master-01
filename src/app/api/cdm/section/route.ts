import { NextResponse } from 'next/server';
import { z } from 'zod';
import { safeGetSectionWithItems } from '@/lib/cdm/schema.server';

const Q = z.object({
  project: z.string().min(1),                // lubame `client-test1` jms
  code: z.string().regex(/^[A-Z]+\d+$/i),    // nt B1, C2
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = Q.safeParse(Object.fromEntries(url.searchParams));

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid query' },
      { status: 400 },
    );
  }

  const { code, project } = parsed.data;

  try {
    const { section, items } = await safeGetSectionWithItems(code);
    // Garantii: alati massiiv
    const arr = Array.isArray(items) ? items : [];
    return NextResponse.json({ ok: true, project, section, items: arr });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Section load failed' },
      { status: 500 },
    );
  }
}
