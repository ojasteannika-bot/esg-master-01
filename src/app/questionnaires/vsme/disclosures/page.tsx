// src/app/questionnaires/vsme/disclosures/page.tsx
import Link from 'next/link';
import ProgressRing from '@/components/vsme/ProgressRing';
import { readVsmeBundle } from '@/lib/vsme/schema';

type Search = Record<string, string | string[] | undefined>;

/** Kasuta B… kui BASIC, C… kui COMPREHENSIVE, muu -> BASIC (turvaline vaikimisi). */
function detectModule(code: string): 'BASIC' | 'COMPREHENSIVE' {
  if (code?.startsWith('C')) return 'COMPREHENSIVE';
  return 'BASIC';
}

/** Lihtne sektsioonide väljavõtt bundlist.
 * Otsime puust kõik elemendid, millel on code/id/key ja see vastab mustrile B1 / B1-1 / C3 jne.
 */
function collectSections(tree: any): { code: string; title?: string; module: 'BASIC' | 'COMPREHENSIVE' }[] {
  const out: { code: string; title?: string; module: 'BASIC' | 'COMPREHENSIVE' }[] = [];

  const walk = (node: any) => {
    if (!node || typeof node !== 'object') return;

    const code =
      node.code ??
      node.id ??
      node.key ??
      node?.attrs?.code ??
      node?.meta?.code ??
      undefined;

    if (typeof code === 'string' && /^[A-Z]\d+(?:-\d+)?$/.test(code)) {
      out.push({
        code,
        title: node.title ?? node.name ?? node.label,
        module: detectModule(code),
      });
    }
    const children = node.nodes ?? node.children ?? node.items ?? [];
    if (Array.isArray(children)) children.forEach(walk);
  };

  if (Array.isArray(tree)) {
    tree.forEach(walk);
  } else if (tree && typeof tree === 'object') {
    walk(tree);
  }
  return out;
}

function pill(href: string, active: boolean, label: string) {
  const base = 'px-3 py-1.5 rounded-full border text-sm';
  return (
    <Link
      href={href}
      className={
        active
          ? `${base} bg-gray-900 text-white border-gray-900`
          : `${base} bg-white hover:bg-gray-50 border-gray-300 text-gray-700`
      }
    >
      {label}
    </Link>
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const mode = (typeof sp.mode === 'string' ? sp.mode : 'all').toLowerCase() as
    | 'all'
    | 'basic'
    | 'comprehensive';

  // loe bundle
  const bundle = readVsmeBundle();
  const root = (bundle?.nodes ?? bundle) as any;
  const allSections = collectSections(root);

  const filtered =
    mode === 'all'
      ? allSections
      : allSections.filter((s) =>
          mode === 'basic' ? s.module === 'BASIC' : s.module === 'COMPREHENSIVE'
        );

  // MVP-progress (kuni DB seotus): completed = 0, total = sektsioonid
  const completed = 0;
  const total = allSections.length;
  const pct = total > 0 ? completed / total : 0;

  return (
    <main className="container mx-auto p-6">
      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/questionnaires">Questionnaires</Link>
        {' / '}
        <span>Disclosures</span>
      </nav>

      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">VSME — Disclosures</h1>
          <p className="text-gray-500 mt-1">
            Filter by module and open any section to answer questions.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <ProgressRing
            value={pct}
            label={`${completed} of ${total} datapoints completed`}
          />
          <div className="flex gap-2">
            {pill('/questionnaires/vsme/disclosures?mode=all', mode === 'all', 'All')}
            {pill('/questionnaires/vsme/disclosures?mode=basic', mode === 'basic', 'Basic module')}
            {pill(
              '/questionnaires/vsme/disclosures?mode=comprehensive',
              mode === 'comprehensive',
              'Comprehensive module'
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-lg border border-dashed p-8 text-gray-500">
            No sections found in bundle. Check{' '}
            <code>src/data/vsme/bundle.json</code>.
          </div>
        ) : (
          filtered.map((s) => (
            <div
              key={s.code}
              className="rounded-lg border bg-white p-4 hover:shadow-sm transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{s.title ?? 'Untitled section'}</div>
                  <div className="text-sm text-gray-500">Code: {s.code}</div>
                </div>

                <span className="text-xs px-2 py-1 rounded-full border">
                  {s.module}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="text-sm text-gray-500">EMPTY</div>
                <Link
                  href={`/questionnaires/vsme/${encodeURIComponent(s.code)}`}
                  className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-sm"
                >
                  Open
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
