import Link from 'next/link';
import ProgressBadge from '@/components/ProgressBadge';
import { getSections } from '@/lib/cdm/catalog';

type Search = { project?: string };

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Search> | Search;
}) {
  const sp =
    (searchParams && 'then' in (searchParams as any)
      ? await (searchParams as Promise<Search>)
      : (searchParams as Search)) || {};
  const project = sp.project ?? 'client-test1';
  const sections = getSections();

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <header className="mb-6" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>Questionnaires</h1>
        <Link href={`/get-report?project=${encodeURIComponent(project)}`} className="btn btn-primary">Generate report</Link>
      </header>

      <div className="space-y-2">
        {sections.map((s) => (
          <div key={s.code} className="border border-[--color-border] rounded p-3" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div className="font-semibold" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span>Section {s.code} — {s.title}</span>
                {s.note ? <span className="q-badge">{s.note}</span> : null}
                <ProgressBadge project={project} code={s.code} />
              </div>
              <div className="text-sm text-[--color-text-muted]">Code: {s.code}</div>
            </div>
            <Link className="btn btn-secondary" href={`/questionnaires/vsme/${s.code}?project=${encodeURIComponent(project)}`}>Open</Link>
          </div>
        ))}
      </div>
    </main>
  );
}
