// src/app/questionnaires/vsme/[code]/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { safeGetSectionWithItems } from '@/lib/vsme/schema.server';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: { code: string };            // nt "B1"
  searchParams: { project?: string };
};

async function getProgress(project: string, section: string) {
  // Serveri fetch vajab ABSOLUTE URL-i.
  // Pane .env.local faili: NEXT_PUBLIC_APP_URL=http://localhost:3001
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    'http://localhost:3001';

  try {
    const url = new URL('/api/vsme/progress', base);
    url.searchParams.set('project', project);
    url.searchParams.set('section', section);
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error(String(res.status));
    const json = await res.json();
    return {
      completed: Number(json.completed ?? 0),
      total: Number(json.total ?? 0),
    };
  } catch {
    // Fallback: kui API pole valmis, näita 0/total
    const { items } = await safeGetSectionWithItems(section);
    return { completed: 0, total: items.length };
  }
}

export default async function Page({ params, searchParams }: PageProps) {
  const sectionCode = (params.code || '').toUpperCase(); // "B1"
  const project = searchParams.project || '';

  const { section, items } = await safeGetSectionWithItems(sectionCode);
  if (!section) return notFound();

  const { completed, total } = await getProgress(project, sectionCode);
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-2 text-sm text-gray-500">
        Questionnaires / VSME sections / <span className="text-gray-900">{section.code}</span>
      </div>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{section.title}</h1>
          <div className="mt-1 text-sm text-gray-500">Project: <span className="font-medium">{project || '—'}</span></div>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <div className="text-2xl font-semibold">{pct}%</div>
          <div className="text-xs text-gray-500">
            Final {completed} / Total {total}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((it) => (
          <div key={it.code} className="rounded-lg border p-4">
            <div className="mb-1 text-xs text-gray-500">Code: {it.code}</div>
            <div className="mb-2 font-medium">{it.title}</div>
            <div className="flex items-center gap-2">
              <Link
                href={`/questionnaires/vsme/item/${it.code}?project=${encodeURIComponent(project)}`}
                className="inline-flex items-center rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-black"
              >
                Open
              </Link>
              <span className="text-xs text-gray-400">generic view WIP</span>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="rounded-md border p-4 text-sm text-gray-600">
            No disclosure requirements in this section yet.
          </div>
        )}
      </div>

      <div className="mt-6">
        <Link
          href="/questionnaires/vsme/nodes?project=client-test1"
          className="text-sm underline underline-offset-2"
        >
          All sections
        </Link>
      </div>
    </div>
  );
}
