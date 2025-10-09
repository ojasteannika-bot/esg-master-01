// src/app/api/vsme/debug/route.ts
import { NextResponse } from 'next/server';
import { readVsmeBundle, getRootNodes, collectAllSections } from '@/lib/vsme/schema';

export async function GET() {
  const bundle = readVsmeBundle();
  const roots = getRootNodes(bundle);
  const sections = collectAllSections(bundle);

  return NextResponse.json({
    ok: true,
    rootArray: Array.isArray(roots),
    rootsCount: Array.isArray(roots) ? roots.length : 0,
    sampleRootKeys: Array.isArray(roots) && roots[0] ? Object.keys(roots[0]).slice(0, 15) : [],
    totalSections: sections.length,
    sectionsPreview: sections.slice(0, 30),
  });
}
