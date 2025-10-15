// src/app/api/uploads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = process.cwd();
const UP_DIR = path.join(ROOT, '.data', 'esglite', 'uploads');

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ ok:false, error:'No file' }, { status:400 });
    }
    await fs.mkdir(UP_DIR, { recursive: true });

    const orig = file.name || 'upload.bin';
    const ext = path.extname(orig);
    const base = crypto.randomBytes(8).toString('hex');
    const fname = `${base}${ext || ''}`;
    const fpath = path.join(UP_DIR, fname);

    const buf = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(fpath, buf);

    // tagastame GET-URLi läbi API
    const url = `/api/uploads/${encodeURIComponent(fname)}`;
    return NextResponse.json({
      ok:true,
      file:{ name: orig, stored: fname, size: buf.length, type: file.type, url }
    });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message || 'Upload failed' }, { status:500 });
  }
}
