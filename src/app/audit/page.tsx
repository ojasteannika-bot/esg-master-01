'use client';

import { useEffect, useState } from 'react';
import { getProjectId, onProjectChange } from '@/lib/project';
import { logAudit } from '@/lib/audit';

type AuditRow = {
  id: string;
  project_id: string;
  ts: string;
  type: string;
  ctx: string | null;
  data: any | null;
};

function toJsonSafe(res: Response): Promise<any> {
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    return res.text().then(t => ({ ok: false, error: t || `HTTP ${res.status}` }));
  }
  return res.json();
}

export default function AuditPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [pid, setPid] = useState<string>(getProjectId());

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch('/api/audit/list', {
        headers: { 'x-project-id': getProjectId() },
        cache: 'no-store',
      });
      const json = await toJsonSafe(res);
      if (!json?.ok) throw new Error(json?.error || 'Load failed');
      setRows(json.data ?? []);
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to load audit entries');
    } finally {
      setLoading(false);
    }
  }

  // Lisa üks testirida praeguse projekti alla (kasutab client-side logAudit abi)
  async function addTest() {
    await logAudit('test', 'ui', { msg: 'hello' });
    await load();
  }

  useEffect(() => {
    load();
    // kui navis projekt muutub, lae uuesti
    const off = onProjectChange((id) => {
      setPid(id);
      load();
    });
    return off;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Audit log (demo)</h1>
        <div className="text-sm text-slate-600">Project: <span className="font-medium">{pid}</span></div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={load}
          className="px-3 py-2 rounded-lg bg-slate-900 text-white"
        >
          Refresh
        </button>
        <button
          onClick={addTest}
          className="px-3 py-2 rounded-lg bg-emerald-600 text-white"
        >
          Add test row
        </button>
      </div>

      {err && (
        <div className="rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">
          {err}
        </div>
      )}

      {loading ? (
        <div className="text-slate-600">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="text-slate-500">No entries yet.</div>
      ) : (
        <div className="overflow-auto rounded-lg border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Project</th>
                <th className="px-3 py-2">Context / Data</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2 whitespace-nowrap">
                    {new Date(r.ts).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">{r.type}</td>
                  <td className="px-3 py-2">{r.project_id}</td>
                  <td className="px-3 py-2">
                    <div className="text-xs text-slate-700 space-y-1">
                      {r.ctx ? <div>ctx: {r.ctx}</div> : null}
                      <pre className="whitespace-pre-wrap">
                        {r.data ? JSON.stringify(r.data, null, 2) : '-'}
                      </pre>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
