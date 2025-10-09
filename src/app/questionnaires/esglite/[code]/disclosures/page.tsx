'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';

type ItemStatus = 'not_started' | 'draft' | 'final';

type ItemRow = {
  code: string;
  title: string;
  status?: ItemStatus;
  updated_at?: string | null;
};

type SectionPayload = {
  ok: boolean;
  error?: string;
  section?: { code: string; title: string } | null;
  items?: ItemRow[];
};

const norm = (s?: string | null): ItemStatus =>
  (s as ItemStatus) || 'not_started';

export default function DisclosuresPage() {
  const params = useParams<{ code: string }>();
  const search = useSearchParams();
  const project = search.get('project') ?? '';
  const sectionCode = params.code;

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState<string>('');
  const [items, setItems] = React.useState<ItemRow[]>([]);

  const [q, setQ] = React.useState('');
  const [tab, setTab] = React.useState<'all' | ItemStatus>('all');

  React.useEffect(() => {
    let aborted = false;
    async function load() {
      if (!project || !sectionCode) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/cdm/section?project=${encodeURIComponent(project)}&code=${encodeURIComponent(
            sectionCode
          )}`,
          { cache: 'no-store' }
        );
        if (!res.ok) throw new Error(`load ${res.status}`);
        const json: SectionPayload = await res.json();
        if (aborted) return;
        if (!json.ok) throw new Error(json.error || 'load failed');
        setTitle(json.section?.title || sectionCode);
        setItems(Array.isArray(json.items) ? json.items : []);
      } catch (e: any) {
        if (!aborted) setError(e?.message || 'Load error');
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    load();
    return () => {
      aborted = true;
    };
  }, [project, sectionCode]);

  const counts = React.useMemo(() => {
    const base = { not_started: 0, draft: 0, final: 0 };
    for (const it of items) base[norm(it.status)]++;
    return base;
  }, [items]);

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((it) => {
      const matchesTab = tab === 'all' || norm(it.status) === tab;
      const matchesQ =
        !term ||
        it.code.toLowerCase().includes(term) ||
        (it.title || '').toLowerCase().includes(term);
      return matchesTab && matchesQ;
    });
  }, [items, q, tab]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm text-gray-500">
            Project <span className="font-mono">{project}</span> · Section{' '}
            <span className="font-mono">{sectionCode}</span>
          </div>
          <h1 className="text-2xl font-semibold">Disclosures — {title}</h1>
        </div>
        <Link
          className="text-sm text-gray-600 underline underline-offset-2"
          href={`/esglite/section/${encodeURIComponent(sectionCode)}?project=${encodeURIComponent(
            project
          )}`}
        >
          ← Back to section table
        </Link>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search code or title…"
          className="w-64 rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
        />
        <Pill active={tab === 'all'} onClick={() => setTab('all')} label="All" />
        <Pill
          active={tab === 'not_started'}
          onClick={() => setTab('not_started')}
          label={`Not started (${counts.not_started})`}
        />
        <Pill active={tab === 'draft'} onClick={() => setTab('draft')} label={`Draft (${counts.draft})`} />
        <Pill active={tab === 'final'} onClick={() => setTab('final')} label={`Final (${counts.final})`} />
      </div>

      {/* States */}
      {loading && (
        <div className="rounded border border-gray-200 bg-white p-4 text-sm text-gray-600">
          Loading…
        </div>
      )}
      {!!error && !loading && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          load {error}
        </div>
      )}

      {/* Grid of disclosure cards */}
      {!loading && !error && (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((it) => (
            <li key={it.code} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="font-mono text-xs text-gray-600">{it.code}</div>
                <StatusBadge status={norm(it.status)} />
              </div>
              <div className="text-sm font-medium text-gray-900">{it.title}</div>
              <div className="mt-3 flex items-center gap-2">
                <Link
                  href={`/esglite/item/${encodeURIComponent(it.code)}?project=${encodeURIComponent(
                    project
                  )}`}
                  className="inline-flex items-center rounded bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-black"
                >
                  Open
                </Link>
                <Link
                  href={`/audit?project=${encodeURIComponent(project)}&code=${encodeURIComponent(
                    it.code
                  )}`}
                  className="text-xs text-gray-600 underline underline-offset-2"
                >
                  Audit
                </Link>
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="rounded border border-gray-200 bg-white p-6 text-center text-sm text-gray-600">
              Nothing matches your filters.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

function Pill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        'rounded-full px-3 py-1.5 text-xs ' +
        (active
          ? 'bg-gray-900 text-white'
          : 'bg-gray-100 text-gray-800 hover:bg-gray-200')
      }
    >
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: ItemStatus }) {
  const map: Record<ItemStatus, string> = {
    not_started: 'bg-gray-100 text-gray-700',
    draft: 'bg-yellow-100 text-yellow-800',
    final: 'bg-green-100 text-green-800',
  };
  return (
    <span className={`rounded-full px-2 py-1 text-xs ${map[status]}`}>{status}</span>
  );
}
