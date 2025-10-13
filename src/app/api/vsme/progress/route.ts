// src/app/api/vsme/progress/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { enumerateQuestions } from '@/lib/vsme/schema';

type Status = 'not_started' | 'draft' | 'final';

// failipõhine MVP state samas formaadis, mida varem kasutasime
import { promises as fs } from 'node:fs';
import path from 'node:path';

async function readJsonSafe<T>(abs: string, fallback: T): Promise<T> {
  try {
    const buf = await fs.readFile(abs, 'utf8');
    return JSON.parse(buf) as T;
  } catch {
    return fallback;
  }
}

// oletame, et salvestame staatuse kujul:
// .data/state/{project}/cdm/status/{ITEM_CODE}.json  -> { status: "draft" | "final" | "not_started" }
async function readItemStatus(project: string, code: string): Promise<Status> {
  const root = path.join(process.cwd(), '.data', 'state', project, 'cdm', 'status');
  const file = path.join(root, `${code}.json`);
  const j = await readJsonSafe<{ status?: Status }>(file, {});
  const s = j.status ?? 'not_started';
  return s as Status;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const project = url.searchParams.get('project') ?? 'client-test1';
  const section = url.searchParams.get('section') ?? 'B1';

  // küsi küsimused (items) antud sektsioonist
  const items = await enumerateQuestions(section);
  const codes = (Array.isArray(items) ? items : [])
    .map((n: any) => String(n?.code ?? n?.id ?? n?.key ?? ''))
    .filter(Boolean);

  let total = codes.length;
  let completed = 0;

  for (const c of codes) {
    const st = await readItemStatus(project, c);
    if (st === 'final') completed += 1;
  }

  return NextResponse.json({ ok: true, section, project, completed, total });
}
