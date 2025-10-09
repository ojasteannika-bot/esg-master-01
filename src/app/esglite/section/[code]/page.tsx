'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';

type ItemRow = {
  code: string;
  title: string;
  status?: 'not_started' | 'draft' | 'final';
  updated_at?: string | null;
};

type SectionPayload = {
  ok: boolean;
  section?: { code: string; title: string } | null;
  items?: ItemRow[];
  error?: string;
};

type StatusKey = 'all' | 'not_started' | 'draft' | 'final';

export default function SectionPage() {
  const params = useParams<{ code: string }>();
  const search = useSearchParams();
  const project = search.get('project') ?? '';

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sectionTitle, setSectionTitle] = React.useState<string>('');
  const [items, setItems] = React.useState<ItemRow[]>([]);

  const [q, setQ] = React.useState('');
  const [filter, setFilter] = React.useState<StatusKey>('all');

  React.useEffect(() => {
    let aborted = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const url = `/api/cdm/section?project=${encodeURIComponent(
          project
        )}&code=${encodeURIComponent(params.code)}`;
        const res = await fetch(url, { credentials: 'include' });
        if (!res.ok) throw new Error(`load ${res.status}`);
        const json: SectionPayload = await res.json();
        if (aborted) return;

        if (!json.ok) throw new Error(json.error || 'load failed');
        setSectionTitle(json.section?.title || params.code);
        setItems(Array.isArray(json.items) ? json.items : []);
      } catch (e: any) {
        if (!aborted) setError(e?.message ?? 'Load error');
      } finally {
        if (!aborted) setLoading(false);
      }
    }

    if (project && params.code) load();
    return () => {
      aborted = true;
    };
  }, [project, params.code]);

  const norm = (s?: string | null) =>
    (s as ItemRow['status']) || 'not_started';

  const counts = React.useMemo(() => {
    const base = { not_started: 0, draft: 0, final: 0 };
    for (const it of items) base[norm(it.status)]++;
    return base;
  }, [items]);

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((it) => {
      const statusOk = filter === 'all' || norm(it.status) === filter;
      const textOk =
        !term ||
        it.code.toLowerCase().includes(term) ||
        (it.title || '').toLowerCase().includes(term);
      return statusOk && textOk;
    });
  }, [items, q, filter]);

  const total = items.length;
  const done = counts.final;
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <div className="text-sm text-gray-500">
            Project <span className="font-medium">{project || '—'}</span> · Section{' '}
            <span className="font-medium">{params.code}</span>
          </div>
          <h1 className="text-2xl font-semibold">
            {sectionTitle || 'Section'}
          </h1>
        </div>

        {/* mini progress */}
        <div className="flex items-center gap-3 text-sm">
          <div className="h-2 w-40 rounded bg-gray-200">
            <div
              className="h-2 rounded bg-gray-900 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="tabular-nums text-gray-600">
            {percent}% · Final {counts.final} / Draft {counts.draft} / Total {total}
          </div>
        </div>
      </div>

      {/* toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search code or title…"
          className="w-64 rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
        />

        <StatusPill
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          label="All"
        />
        <StatusPill
          active={filter === 'not_started'}
          onClick={() => setFilter('not_started')}
          label={`Not started (${counts.not_started})`}
        />
        <StatusPill
          active={filter === 'draft'}
          onClick={() => setFilter('draft')}
          label={`Draft (${counts.draft})`}
        />
        <StatusPill
          active={filter === 'final'}
          onClick={() => setFilter('final')}
          label={`Final (${counts.final})`}
        />

        <div className="ml-auto flex items-center gap-2">
          <Link
            className="text-sm text-gray-600 underline underline-offset-2"
            href={`/questionnaires/esglite/${encodeURIComponent(
              params.code
            )}/disclosures?project=${encodeURIComponent(project)}`}
          >
            Disclosures view
          </Link>
          <Link
            className="rounded bg-gray-900 px-3 py-2 text-sm text-white"
            href={`/questionnaires/esglite/nodes?project=${encodeURIComponent(
              project
            )}`}
          >
            Continue
          </Link>
        </div>
      </div>

      {/* states */}
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

      {/* table */}
      {!loading && !error && (
        <div className="overflow-hidden rounded border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-3 py-3 text-right"> </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it) => (
                <tr key={it.code} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-mono">{it.code}</td>
                  <td className="px-4 py-3">{it.title}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={norm(it.status)} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {it.updated_at ?? '—'}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Link
                      href={`/esglite/item/${encodeURIComponent(
                        it.code
                      )}?project=${encodeURIComponent(project)}`}
                      className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-gray-500"
                    colSpan={5}
                  >
                    Nothing matches your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* back link */}
      <div className="mt-6">
        <Link
          className="text-sm text-gray-600 underline underline-offset-2"
          href={`/questionnaires/esglite/nodes?project=${encodeURIComponent(
            project
          )}`}
        >
          ← Back to sections
        </Link>
      </div>
    </div>
  );
}

function StatusPill({
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

function StatusBadge({ status }: { status: ItemRow['status'] }) {
  const map: Record<string, string> = {
    not_started: 'bg-gray-100 text-gray-700',
    draft: 'bg-yellow-100 text-yellow-800',
    final: 'bg-green-100 text-green-800',
  };
  return (
    <span className={`rounded-full px-2 py-1 text-xs ${map[status || 'not_started']}`}>
      {status || 'not_started'}
    </span>
  );
}
