'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

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

type ProgressTotals = {
  final: number;
  draft: number;
  total: number;
  updated_at?: string;
};

type ProgressResp = {
  ok: boolean;
  project: string;
  totals: ProgressTotals;
  sections: Record<
    string,
    {
      final: number;
      draft: number;
      total: number;
    }
  >;
};

type UiSection = {
  code: string;
  title: string;
  description?: string;
  counts: { final: number; draft: number; total: number };
};

const ALL_CANDIDATES = [
  'B1','B2','B3','B4','B5','B6','B7','B8','B9','B10','B11',
  'C1','C2','C3','C4','C5','C6','C7','C8','C9',
];

const cx = (...cls: (string | false | null | undefined)[]) => cls.filter(Boolean).join(' ');

function Ring({ pct, size = 90 }: { pct: number; size?: number }) {
  const r = (size / 2) - 8;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  const dash = c * (1 - clamped / 100);
  const center = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={center} cy={center} r={r} stroke="#e5e7eb" strokeWidth="8" fill="none" />
      <circle
        cx={center} cy={center} r={r}
        stroke="#111827" strokeWidth="8" fill="none"
        strokeDasharray={c} strokeDashoffset={dash}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
      />
      <text x={center} y={center + 5} textAnchor="middle" fontSize={Math.round(size/4.5)} fontWeight="600" fill="#111827">
        {clamped}%
      </text>
    </svg>
  );
}

export default function EsgliteHomePage() {
  const search = useSearchParams();
  const project = search.get('project') || '';

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [totals, setTotals] = React.useState<ProgressTotals | null>(null);
  const [sections, setSections] = React.useState<UiSection[]>([]);
  const [filter, setFilter] = React.useState<'all' | 'basic' | 'comprehensive'>('all');

  React.useEffect(() => {
    let aborted = false;

    async function loadAll() {
      setError(null);
      setLoading(true);
      try {
        // 1) Üldprogress (kasutab sinu olemasolevat /api/cdm/progress)
        const pRes = await fetch(
          `/api/cdm/progress?project=${encodeURIComponent(project)}`,
          { credentials: 'include' }
        );
        if (!pRes.ok) throw new Error(`progress ${pRes.status}`);
        const pJson: ProgressResp = await pRes.json();
        if (!pJson.ok) throw new Error('progress not ok');
        if (aborted) return;
        setTotals(pJson.totals);

        // 2) Sektsioonide meta + staatuste koond (nagu “nodes” lehel)
        const found: UiSection[] = [];
        for (const code of ALL_CANDIDATES) {
          const sRes = await fetch(
            `/api/cdm/section?project=${encodeURIComponent(project)}&code=${encodeURIComponent(code)}`,
            { credentials: 'include' }
          );
          if (!sRes.ok) continue;
          const sJson: SectionLoad = await sRes.json();

          const stRes = await fetch(
            `/api/cdm/section-status?project=${encodeURIComponent(project)}&code=${encodeURIComponent(code)}`,
            { credentials: 'include' }
          );
          if (!stRes.ok) continue;
          const stJson: SectionStatus = await stRes.json();

          found.push({
            code: sJson.section.code,
            title: sJson.section.title,
            description: sJson.section.description || '',
            counts: stJson.counts || { final: 0, draft: 0, total: sJson.section.items.length },
          });
        }

        if (!aborted) setSections(found);
      } catch (e: any) {
        if (!aborted) setError(e.message || 'load failed');
      } finally {
        if (!aborted) setLoading(false);
      }
    }

    if (project) void loadAll();
  }, [project]);

  const filtered = sections.filter((s) => {
    if (filter === 'all') return true;
    if (filter === 'basic') return s.code.startsWith('B');
    if (filter === 'comprehensive') return s.code.startsWith('C');
    return true;
  });

  if (!project) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            Puudub <code>project</code> query param. Ava näiteks:{' '}
            <code>/esglite?project=client-test1</code>
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="rounded-md border border-rose-300 bg-rose-50 p-4 text-rose-800">
          {error}
        </div>
      </div>
    );
  }

  if (loading || !totals) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-6 flex items-center gap-6">
          <div className="h-[90px] w-[90px] animate-pulse rounded-full bg-gray-200" />
          <div>
            <div className="h-5 w-64 animate-pulse rounded bg-gray-200 mb-2" />
            <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg border bg-white" />
          ))}
        </div>
      </div>
    );
  }

  const overallPct = totals.total > 0 ? Math.round((totals.final / totals.total) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl p-6">
      {/* Top summary */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Ring pct={overallPct} />
          <div>
            <div className="text-xs text-gray-500">Project: {project}</div>
            <h1 className="text-xl font-semibold">VSME Disclosures</h1>
            <div className="mt-1 text-sm text-gray-700">
              Final {totals.final} / Total {totals.total}
              {typeof totals.draft === 'number' && (
                <span className="text-gray-500"> — Draft {totals.draft}</span>
              )}
            </div>
            {totals.updated_at && (
              <div className="mt-1 text-xs text-gray-500">
                Updated: {new Date(totals.updated_at).toLocaleString()}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/questionnaires/esglite/nodes?project=${encodeURIComponent(project)}`}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            View by sections
          </Link>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={cx(
            'rounded-md border px-3 py-1.5 text-sm',
            filter === 'all' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-300 hover:bg-gray-50'
          )}
        >
          All
        </button>
        <button
          onClick={() => setFilter('basic')}
          className={cx(
            'rounded-md border px-3 py-1.5 text-sm',
            filter === 'basic' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-300 hover:bg-gray-50'
          )}
        >
          Basic
        </button>
        <button
          onClick={() => setFilter('comprehensive')}
          className={cx(
            'rounded-md border px-3 py-1.5 text-sm',
            filter === 'comprehensive' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-300 hover:bg-gray-50'
          )}
        >
          Comprehensive
        </button>
      </div>

      {/* Grid of sections */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => {
          const pct =
            s.counts.total > 0 ? Math.round((s.counts.final / s.counts.total) * 100) : 0;

          return (
            <div key={s.code} className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4">
              <Ring pct={pct} size={72} />
              <div className="min-w-0 flex-1">
                <div className="text-xs text-gray-500">{s.code}</div>
                <div className="truncate text-sm font-medium text-gray-900">{s.title}</div>
                <div className="mt-1 text-xs text-gray-600">
                  Final {s.counts.final} / Total {s.counts.total}
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <Link
                    className="text-xs underline underline-offset-2"
                    href={`/questionnaires/esglite/${encodeURIComponent(s.code)}?project=${encodeURIComponent(project)}`}
                  >
                    Open
                  </Link>
                  <Link
                    className="text-xs text-gray-600 underline underline-offset-2"
                    href={`/questionnaires/esglite/${encodeURIComponent(s.code)}/disclosures?project=${encodeURIComponent(project)}`}
                  >
                    Disclosures
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full rounded-md border bg-white p-4 text-sm text-gray-600">
            No sections match this filter.
          </div>
        )}
      </div>
    </div>
  );
}
