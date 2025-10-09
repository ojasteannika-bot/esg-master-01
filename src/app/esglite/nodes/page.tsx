'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type SectionRow = {
  code: string;
  title: string;
  total: number;
  final: number;
  draft: number;
  not_started: number;
};
type ApiResp = { ok: true; project: string; sections: SectionRow[] } | { ok: false; error: string };

export default function NodesPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const project = (sp.get('project') || '').trim();

  const [data, setData] = React.useState<SectionRow[]>([]);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    setErr(null); setData([]);
    if (!project) return;
    (async () => {
      const res = await fetch(`/api/cdm/sections?project=${encodeURIComponent(project)}`, { cache: 'no-store' });
      if (!res.ok) { setErr(`sections ${res.status}`); return; }
      const json: ApiResp = await res.json();
      if ('ok' in json && json.ok) {
        setData(json.sections);
      } else {
        setErr((json as any).error || 'load failed');
      }
    })();
  }, [project]);

  if (!project) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Lisa aadressiribale <code>?project=client-test1</code>.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-xl font-semibold">VSME Sections</h1>
      {err && (
        <div className="mb-4 rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{err}</div>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {data.map(s => (
          <div key={s.code} className="rounded border border-gray-200 p-4">
            <div className="mb-1 text-sm text-gray-600">Code: <span className="font-mono">{s.code}</span></div>
            <div className="font-medium">{s.title}</div>
            <div className="mt-2 text-xs text-gray-600">
              {s.final} final / {s.draft} draft / {s.total} total
            </div>
            <button
              onClick={() => router.push(`/esglite/section/${encodeURIComponent(s.code)}?project=${encodeURIComponent(project)}`)}
              className="mt-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Open
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
