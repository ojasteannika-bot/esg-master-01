'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';

type ItemStatus = 'not_started' | 'draft' | 'final';

type Field =
  | { id: string; label: string; type: 'text' | 'number' | 'date' | 'textarea' }
  | { id: string; label: string; type: 'select'; options: string[] };

type VsmeItem = { code: string; title: string; description?: string; fields: Field[] };
type SectionSchema = { code: string; title: string; description?: string; items: VsmeItem[] };

type SectionLoad = { ok: boolean; project: string; section: SectionSchema };
type SectionStatus = {
  ok: boolean;
  project: string;
  section: string;
  statuses: Record<string, ItemStatus | 'ready' | 'partial' | 'not_started'>;
  updated: Record<string, string | null>;
  counts: { final: number; draft: number; total: number };
};

const cx = (...cls: (string | false | null | undefined)[]) => cls.filter(Boolean).join(' ');

function StatusPill({ status }: { status: ItemStatus }) {
  const map: Record<ItemStatus, string> = {
    not_started: 'bg-gray-100 text-gray-700',
    draft: 'bg-amber-100 text-amber-800',
    final: 'bg-emerald-100 text-emerald-800',
  };
  const label: Record<ItemStatus, string> = {
    not_started: 'Not started',
    draft: 'Draft',
    final: 'Final',
  };
  return (
    <span className={cx('inline-flex items-center rounded-full px-2 py-1 text-xs font-medium', map[status])}>
      {label[status]}
    </span>
  );
}

export default function DisclosuresTablePage() {
  const params = useParams<{ code: string }>();
  const search = useSearchParams();
  const project = search.get('project') || '';

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [section, setSection] = React.useState<SectionSchema | null>(null);
  const [st, setSt] = React.useState<SectionStatus | null>(null);

  // UI: otsing + staatuse filter + sort
  const [q, setQ] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | ItemStatus>('all');
  const [sortBy, setSortBy] = React.useState<'code' | 'status' | 'updated'>('code');
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc');

  React.useEffect(() => {
    let aborted = false;

    async function load() {
      setError(null);
      setLoading(true);
      try {
        const secRes = await fetch(
          `/api/cdm/section?project=${encodeURIComponent(project)}&code=${encodeURIComponent(params.code)}`,
          { credentials: 'include' }
        );
        if (!secRes.ok) throw new Error(`section ${secRes.status}`);
        const secJson: SectionLoad = await secRes.json();
        if (aborted) return;
        setSection(secJson.section);

        const stRes = await fetch(
          `/api/cdm/section-status?project=${encodeURIComponent(project)}&code=${encodeURIComponent(params.code)}`,
          { credentials: 'include' }
        );
        if (!stRes.ok) throw new Error(`section-status ${stRes.status}`);
        const stJson: SectionStatus = await stRes.json();
        if (aborted) return;
        setSt(stJson);
      } catch (e: any) {
        if (!aborted) setError(e.message || 'load failed');
      } finally {
        if (!aborted) setLoading(false);
      }
    }

    if (project && params.code) void load();
    return () => { aborted = true; };
  }, [project, params.code]);

  function nextItemCode(): string | null {
    if (!section) return null;
    for (const it of section.items) {
      const raw = st?.statuses?.[it.code];
      const status: ItemStatus =
        raw === 'final' ? 'final' : raw === 'draft' ? 'draft' : 'not_started';
      if (status !== 'final') return it.code;
    }
    return section.items[0]?.code ?? null;
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4">
          Missing <code>project</code> query param.
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="rounded-md border border-rose-300 bg-rose-50 p-3 text-rose-800">
          {error}
        </div>
      </div>
    );
  }

  if (loading || !section) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-4 h-6 w-56 animate-pulse rounded bg-gray-200" />
        <div className="h-10 w-full animate-pulse rounded bg-gray-100" />
        <div className="mt-2 h-10 w-full animate-pulse rounded bg-gray-100" />
      </div>
    );
  }

  const counts = st?.counts ?? { final: 0, draft: 0, total: section.items.length };
  const pct = counts.total > 0 ? Math.round((counts.final / counts.total) * 100) : 0;
  const next = nextItemCode();

  // Filtreerimine + sort
  type Row = {
    code: string;
    title: string;
    status: ItemStatus;
    updated: string | null;
  };

  const rows: Row[] = section.items.map((it) => {
    const raw = (st?.statuses?.[it.code] as ItemStatus | undefined) || 'not_started';
    const status: ItemStatus = raw === 'final' ? 'final' : raw === 'draft' ? 'draft' : 'not_started';
    const updatedAt = st?.updated?.[it.code] || null;
    return { code: it.code, title: it.title, status, updated: updatedAt };
  });

  const filtered = rows.filter((r) => {
    const okStatus = statusFilter === 'all' ? true : r.status === statusFilter;
    const term = q.trim().toLowerCase();
    const okText = term
      ? r.code.toLowerCase().includes(term) || r.title.toLowerCase().includes(term)
      : true;
    return okStatus && okText;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'code') {
      cmp = a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' });
    } else if (sortBy === 'status') {
      const rank: Record<ItemStatus, number> = { not_started: 0, draft: 1, final: 2 };
      cmp = rank[a.status] - rank[b.status];
    } else if (sortBy === 'updated') {
      const ta = a.updated ? Date.parse(a.updated) : 0;
      const tb = b.updated ? Date.parse(b.updated) : 0;
      cmp = ta - tb;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  function changeSort(key: 'code' | 'status' | 'updated') {
    if (sortBy === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs text-gray-500">Section: {section.code}</div>
          <h1 className="text-xl font-semibold">{section.title}</h1>
          {!!section.description && (<p className="text-sm text-gray-600 mt-1">{section.description}</p>)}
          <div className="mt-2 text-xs text-gray-600">
            {pct}% — Final {counts.final} / Total {counts.total} (Draft {counts.draft})
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/questionnaires/esglite/${encodeURIComponent(section.code)}?project=${encodeURIComponent(project)}`}
            className="text-sm underline underline-offset-2"
          >
            ← Back to section
          </Link>

          <Link
            href={`/questionnaires/esglite/nodes?project=${encodeURIComponent(project)}`}
            className="text-sm underline underline-offset-2"
          >
            All sections
          </Link>

          {next && (
            <Link
              href={`/esglite/item/${encodeURIComponent(next)}?project=${encodeURIComponent(project)}`}
              className="inline-flex items-center rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-black"
            >
              {counts.final === 0 ? 'Start' : 'Continue'}
            </Link>
          )}
        </div>
      </div>

      {/* Toolbar: search + status filter */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          className="h-9 w-full max-w-xs rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          placeholder="Search code or title…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <div className="flex items-center gap-1 text-sm">
          <span className="text-gray-600">Status:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={cx('rounded-md border px-2 py-1', statusFilter === 'all' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-300')}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('not_started')}
            className={cx('rounded-md border px-2 py-1', statusFilter === 'not_started' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-300')}
          >
            Not started
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={cx('rounded-md border px-2 py-1', statusFilter === 'draft' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-300')}
          >
            Draft
          </button>
          <button
            onClick={() => setStatusFilter('final')}
            className={cx('rounded-md border px-2 py-1', statusFilter === 'final' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-300')}
          >
            Final
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-700">
                <button onClick={() => changeSort('code')} className="inline-flex items-center gap-1 hover:underline">
                  Code {sortBy === 'code' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </button>
              </th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Title</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">
                <button onClick={() => changeSort('status')} className="inline-flex items-center gap-1 hover:underline">
                  Status {sortBy === 'status' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </button>
              </th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">
                <button onClick={() => changeSort('updated')} className="inline-flex items-center gap-1 hover:underline">
                  Updated {sortBy === 'updated' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </button>
              </th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {sorted.map((row) => (
              <tr key={row.code}>
                <td className="px-4 py-2 text-gray-700">{row.code}</td>
                <td className="px-4 py-2">
                  <div className="font-medium text-gray-900">
                    {section.items.find(i => i.code === row.code)?.title || row.code}
                  </div>
                </td>
                <td className="px-4 py-2"><StatusPill status={row.status} /></td>
                <td className="px-4 py-2 text-gray-600">
                  {row.updated ? new Date(row.updated).toLocaleString() : '—'}
                </td>
                <td className="px-4 py-2 text-right">
                  <Link
                    href={`/esglite/item/${encodeURIComponent(row.code)}?project=${encodeURIComponent(project)}`}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 hover:bg-gray-50"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                  No disclosures match filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
