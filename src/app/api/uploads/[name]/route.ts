// src/app/api/uploads/[name]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const ROOT = process.cwd();
const UP_DIR = path.join(ROOT, '.data', 'esglite', 'uploads');

export async function GET(_req: NextRequest, { params }: { params: { name: string } }) {
  try {
    const safe = params.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fpath = path.join(UP_DIR, safe);
    const buf = await fs.readFile(fpath);
    // väga lihtne headers; brauserid laevad alla/vaatavad
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'content-type': 'application/octet-stream',
        'content-disposition': `inline; filename="${safe}"`
      }
    });
  } catch {
    return NextResponse.json({ ok:false, error:'Not found' }, { status:404 });
  }
}
