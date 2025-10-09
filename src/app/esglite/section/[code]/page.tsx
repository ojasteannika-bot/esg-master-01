'use client';

import * as React from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Donut from '@/components/Donut';

type Row = { code: string; title: string; status: 'not_started'|'draft'|'final'; updated_at: string|null };
type ApiResp = { ok: true; project: string; section: string; title: string; items: Row[] } | { ok: false; error: string };

export default function SectionPage() {
  const params = useParams<{ code: string }>();
  const sp = useSearchParams();
  const router = useRouter();
  const project = (sp.get('project') || '').trim();
  const section = params.code;

  const [title, setTitle] = React.useState<string>('');
  const [rows, setRows] = React.useState<Row[]>([]);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    setErr(null); setRows([]);
    if (!project || !section) return;
    (async () => {
      const res = await fetch(`/api/cdm/section?project=${encodeURIComponent(project)}&section=${encodeURIComponent(section)}`, { cache: 'no-store' });
      if (!res.ok) { setErr(`load ${res.status}`); return; }
      const json: ApiResp = await res.json();
      if ('ok' in json && json.ok) {
        setTitle(json.title);
        setRows(json.items);
      } else setErr((json as any).error || 'load failed');
    })();
  }, [project, section]);

  const total = rows.length;
  const final = rows.filter(r => r.status === 'final').length;
  const draft = rows.filter(r => r.status === 'draft').length;
  const pct = total ? Math.round((final / total) * 100) : 0;

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
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-600">Project <span className="font-mono">{project}</span> • Section <span className="font-mono">{section}</span></div>
          <h1 className="text-lg font-semibold mt-1">{title || section}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Donut value={pct} />
          <div className="text-xs text-gray-600">{final} final • {draft} draft • {total} total</div>
        </div>
      </div>

      {err && <div className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{err}</div>}

      <div className="divide-y rounded border">
        {rows.map(r => (
          <div key={r.code} className="flex items-center justify-between p-3">
            <div>
              <div className="text-sm font-medium">{r.code} — {r.title}</div>
              <div className="text-xs text-gray-500">Updated: {r.updated_at ? new Date(r.updated_at).toLocaleString() : '—'}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className={
                'rounded-full px-2 py-1 text-xs ' + (
                  r.status === 'final' ? 'bg-emerald-100 text-emerald-800' :
                  r.status === 'draft' ? 'bg-amber-100 text-amber-800' :
                  'bg-gray-100 text-gray-700')
              }>{r.status === 'not_started' ? 'not started' : r.status}</span>
              <button
                onClick={() => router.push(`/esglite/item/${encodeURIComponent(r.code)}?project=${encodeURIComponent(project)}`)}
                className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                {r.status === 'not_started' ? 'Start' : 'Continue'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push(`/esglite/nodes?project=${encodeURIComponent(project)}`)}
        className="text-sm underline underline-offset-2"
      >
        Back to sections
      </button>
    </div>
  );
}
