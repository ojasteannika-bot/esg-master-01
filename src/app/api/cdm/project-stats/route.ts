import { NextResponse } from 'next/server';
export async function GET(req: Request) {
  const url = new URL(req.url);
  const project = url.searchParams.get('project') ?? 'client-XYZ';
  return NextResponse.json({ project, completed: 0 });
}
