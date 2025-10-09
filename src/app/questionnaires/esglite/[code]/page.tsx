'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';

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

function Ring({ pct, size = 72 }: { pct: number; size?: number }) {
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

export default function EsgliteSectionSummaryPage() {
  const params = useParams<{ code: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const project = search.get('project') || '';

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [section, setSection] = React.useState<SectionSchema | null>(null);
  const [st, setSt] = React.useState<SectionStatus | null>(null);

  React.useEffect(() => {
    let aborted = false;

    async function load() {
      setError(null);
      setLoading(true);
      try {
        // 1) sektsiooni meta (items)
        const sRes = await fetch(
          `/api/cdm/section?project=${encodeURIComponent(project)}&code=${encodeURIComponent(params.code)}`,
          { credentials: 'include' }
        );
        if (!sRes.ok) throw new Error(`section ${sRes.status}`);
        const sJson: SectionLoad = await sRes.json();
        if (aborted) return;
        setSection(sJson.section);

        // 2) sektsiooni staatuste koond
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
  }, [project, params.code]);

  const counts = st?.counts ?? { final: 0, draft: 0, total: section?.items.length || 0 };
  const pct = counts.total > 0 ? Math.round((counts.final / counts.total) * 100) : 0;

  function nextItemCode(): string | null {
    if (!section) return null;
    // eelis: esimene, mis pole final. kui kõik final → esimene
    for (const it of section.items) {
      const raw = st?.statuses?.[it.code];
      const status: ItemStatus = raw === 'final' ? 'final' : raw === 'draft' ? 'draft' : 'not_started';
      if (status !== 'final') return it.code;
    }
    return section.items[0]?.code || null;
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4">
          Missing <code>project</code> query param.
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="rounded-md border border-rose-300 bg-rose-50 p-4 text-rose-800">
          {error}
        </div>
      </div>
    );
  }

  if (loading || !section) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="mb-4 h-6 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mb-6 h-4 w-80 animate-pulse rounded bg-gray-200" />
        <div className="h-24 w-full animate-pulse rounded bg-gray-100" />
      </div>
    );
  }

  const next = nextItemCode();

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Ring pct={pct} />
          <div>
            <div className="text-xs text-gray-500">Section: {section.code}</div>
            <h1 className="text-xl font-semibold">{section.title}</h1>
            {!!section.description && (
              <p className="mt-1 text-sm text-gray-600">{section.description}</p>
            )}
            <div className="mt-2 text-xs text-gray-600">
              Final {counts.final} / Total {counts.total}
              {typeof counts.draft === 'number' && (
                <span className="text-gray-500"> — Draft {counts.draft}</span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link
                href={`/questionnaires/esglite/${encodeURIComponent(section.code)}/disclosures?project=${encodeURIComponent(project)}`}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Disclosures
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
        </div>

        <div className="shrink-0">
          <Link
            href={`/questionnaires/esglite/nodes?project=${encodeURIComponent(project)}`}
            className="text-sm underline underline-offset-2"
          >
            ← Back to sections
          </Link>
        </div>
      </div>

      {/* quick list */}
      <div className="overflow-hidden rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Code</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Title</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Updated</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {section.items.map((it) => {
              const raw = st?.statuses?.[it.code];
              const status: ItemStatus =
                raw === 'final' ? 'final' : raw === 'draft' ? 'draft' : 'not_started';
              const updated = st?.updated?.[it.code] || null;

              return (
                <tr key={it.code}>
                  <td className="px-4 py-2 text-gray-700">{it.code}</td>
                  <td className="px-4 py-2">
                    <div className="font-medium text-gray-900">{it.title}</div>
                  </td>
                  <td className="px-4 py-2"><StatusPill status={status} /></td>
                  <td className="px-4 py-2 text-gray-600">
                    {updated ? new Date(updated).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/esglite/item/${encodeURIComponent(it.code)}?project=${encodeURIComponent(project)}`}
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 hover:bg-gray-50"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              );
            })}
            {section.items.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                  No disclosures in this section.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
