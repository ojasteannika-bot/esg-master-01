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

function Ring({ pct }: { pct: number }) {
  const r = 32;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  const dash = c * (1 - clamped / 100);
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" className="shrink-0">
      <circle cx="40" cy="40" r={r} stroke="#e5e7eb" strokeWidth="8" fill="none" />
      <circle
        cx="40" cy="40" r={r}
        stroke="#111827" strokeWidth="8" fill="none"
        strokeDasharray={c} strokeDashoffset={dash}
        strokeLinecap="round"
        transform="rotate(-90 40 40)"
      />
      <text x="40" y="44" textAnchor="middle" fontSize="16" fontWeight="600" fill="#111827">
        {clamped}%
      </text>
    </svg>
  );
}

export default function EsgliteNodesPage() {
  const search = useSearchParams();
  const project = search.get('project') || '';

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sections, setSections] = React.useState<UiSection[]>([]);
  const [filter, setFilter] = React.useState<'all' | 'basic' | 'comprehensive'>('all');

  React.useEffect(() => {
    let aborted = false;
    async function load() {
      setError(null);
      setLoading(true);
      try {
        const found: UiSection[] = [];

        // Käime kandidaadid läbi ja küsime sektsiooni meta + staatuse
        for (const code of ALL_CANDIDATES) {
          // 1) skeem
          const sRes = await fetch(
            `/api/cdm/section?project=${encodeURIComponent(project)}&code=${encodeURIComponent(code)}`,
            { credentials: 'include' }
          );
          if (!sRes.ok) continue; // sektsiooni ei ole bundle’is – jätame vahele
          const sJson: SectionLoad = await sRes.json();

          // 2) staatuse koond
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

    if (project) void load();
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
            <code>/questionnaires/esglite/nodes?project=client-test1</code>
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

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-4 h-5 w-72 animate-pulse rounded bg-gray-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg border bg-white" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      {/* Header + filter */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Disclosures by section</h1>
          <p className="text-sm text-gray-600">Choose a section to continue.</p>
        </div>
        <div className="flex gap-2">
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
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => {
          const pct =
            s.counts.total > 0 ? Math.round((s.counts.final / s.counts.total) * 100) : 0;

          return (
            <div key={s.code} className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4">
              <Ring pct={pct} />
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

                  {/* Disclosures link – NÕUTUD */}
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
