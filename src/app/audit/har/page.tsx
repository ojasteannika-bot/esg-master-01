'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

type Har = {
  log: {
    entries: Array<{
      startedDateTime: string;
      time: number;
      request: { method: string; url: string };
      response: { status: number; statusText: string };
    }>;
  };
};

export default function Page() {
  const [har, setHar] = useState<Har | null>(null);
  const entries = har?.log?.entries ?? [];

  function onFile(ev: React.ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0];
    if (!f) return;
    const fr = new FileReader();
    fr.onload = () => {
      try { setHar(JSON.parse(String(fr.result || '{}')) as Har); }
      catch { alert('Invalid HAR'); }
    };
    fr.readAsText(f);
  }

  const stats = useMemo(() => {
    const total = entries.length;
    const byStatus: Record<string, number> = {};
    let sum = 0;
    const byHost: Record<string, number> = {};
    for (const e of entries) {
      const s = String(e.response?.status ?? '?');
      byStatus[s] = (byStatus[s] ?? 0) + 1;
      sum += Number(e.time || 0);
      try {
        const u = new URL(e.request.url);
        const host = u.host;
        byHost[host] = (byHost[host] ?? 0) + 1;
      } catch {}
    }
    const avg = total ? Math.round(sum / total) : 0;
    const topHosts = Object.entries(byHost).sort((a,b)=>b[1]-a[1]).slice(0,8);
    return { total, byStatus, avg, topHosts };
  }, [entries]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/audit" className="px-3 py-1 rounded border">&larr; Back</Link>
        <h1 className="text-2xl font-semibold">HAR summary</h1>
      </div>

      <div className="bg-white border rounded-2xl p-5 space-y-3">
        <input type="file" accept=".har,application/json" onChange={onFile} />
        <p className="text-sm text-slate-600">Drop your HAR export here (DevTools → Network → Save all as HAR).</p>
      </div>

      {har && (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white border rounded-2xl p-4">
              <div className="text-sm text-slate-600">Requests</div>
              <div className="text-2xl font-semibold">{stats.total}</div>
            </div>
            <div className="bg-white border rounded-2xl p-4">
              <div className="text-sm text-slate-600">Avg time (ms)</div>
              <div className="text-2xl font-semibold">{stats.avg}</div>
            </div>
            <div className="bg-white border rounded-2xl p-4">
              <div className="text-sm text-slate-600 mb-2">Status codes</div>
              <div className="text-sm">{Object.entries(stats.byStatus).map(([k,v])=>`${k}: ${v}`).join('  •  ') || '—'}</div>
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-4">
            <div className="font-medium mb-2">Top hosts</div>
            <ul className="list-disc pl-5 text-sm text-slate-700">
              {stats.topHosts.map(([h, n]) => <li key={h}>{h} — {n}</li>)}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
