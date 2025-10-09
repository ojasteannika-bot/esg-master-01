'use client';

import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import * as React from 'react';

type ItemRow = {
  code: string;
  title: string;
  status?: 'final' | 'draft' | 'not_started';
  updated_at?: string | null;
};

export default function EsSectionPage() {
  const params = useParams<{ code: string }>();
  const sectionCode = (params?.code as string) ?? '';
  const search = useSearchParams();
  const project = search.get('project') ?? '';
  const router = useRouter();

  const [rows, setRows] = React.useState<ItemRow[]>([]);
  const [progress, setProgress] = React.useState({
    percent: 0,
    final: 0,
    draft: 0,
    total: 0,
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let abort = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const url = `/api/cdm/section?project=${encodeURIComponent(
          project
        )}&code=${encodeURIComponent(sectionCode)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${res.status}`);
        const json = await res.json();
        if (abort) return;

        const items: ItemRow[] = (json?.items ?? []).map((it: any) => ({
          code: it.code,
          title: it.title ?? it.name ?? it.label ?? it.code,
          status: (it.status ?? it.item?.status ?? 'not_started') as any,
          updated_at: it.updated_at ?? it.item?.updated_at ?? null,
        }));

        setRows(items);
        const pr = json?.progress ?? {};
        setProgress({
          percent: Number(pr.percent ?? 0),
          final: Number(pr.final ?? 0),
          draft: Number(pr.draft ?? 0),
          total: Number(pr.total ?? items.length ?? 0),
        });
      } catch (e: any) {
        if (!abort) setError(e?.message ?? 'load error');
      } finally {
        if (!abort) setLoading(false);
      }
    }

    if (project && sectionCode) load();
    return () => {
      abort = true;
    };
  }, [project, sectionCode]);

  function openItem(code: string) {
    router.push(
      `/esglite/item/${encodeURIComponent(code)}?project=${encodeURIComponent(
        project
      )}`
    );
  }

  function badge(status?: string) {
    const base =
      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border';
    switch (status) {
      case 'final':
        return (
          <span className={`${base} border-green-300 text-green-800 bg-green-50`}>
            final
          </span>
        );
      case 'draft':
        return (
          <span className={`${base} border-amber-300 text-amber-800 bg-amber-50`}>
            draft
          </span>
        );
      default:
        return (
          <span className={`${base} border-slate-300 text-slate-700 bg-slate-50`}>
            not_started
          </span>
        );
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Basis for preparation</h1>
        <div className="text-xs text-gray-600">
          {progress.percent}% · Final {progress.final} / Draft {progress.draft} / Total{' '}
          {progress.total}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <Link
          className="text-xs text-gray-600 underline underline-offset-2"
          href={`/questionnaires/esglite/${encodeURIComponent(
            sectionCode
          )}/disclosures?project=${encodeURIComponent(project)}`}
        >
          Disclosures view
        </Link>

        <button
          className="ml-auto rounded bg-neutral-900 text-white text-sm px-3 py-1.5 disabled:opacity-50"
          disabled={loading || rows.length === 0}
          onClick={() => {
            const next =
              rows.find((r) => (r.status ?? 'not_started') !== 'final') ?? rows[0];
            openItem(next.code);
          }}
        >
          Continue
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          load {error}
        </p>
      )}

      <div className="mt-5 overflow-hidden rounded-md border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                Code
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                Title
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                Status
              </th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {rows.map((r) => (
              <tr key={r.code}>
                <td className="px-3 py-2 text-sm font-medium text-gray-900">
                  {r.code}
                </td>
                <td className="px-3 py-2 text-sm text-gray-800">{r.title}</td>
                <td className="px-3 py-2">{badge(r.status)}</td>
                <td className="px-3 py-2 text-right">
                  <button
                    className="rounded border border-gray-300 px-2.5 py-1 text-sm"
                    onClick={() => openItem(r.code)}
                  >
                    Open
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr>
                <td className="px-3 py-6 text-sm text-gray-600" colSpan={4}>
                  No items
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <Link
          href={`/questionnaires/esglite/nodes?project=${encodeURIComponent(project)}`}
          className="text-sm text-gray-700 underline underline-offset-2"
        >
          ← Back to sections
        </Link>
      </div>
    </div>
  );
}
