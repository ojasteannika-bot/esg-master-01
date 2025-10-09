'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getProjectId, onProjectChange } from '../../lib/project';

type AuditRow = {
  id: string;
  ts: string;
  project_id: string;
  type: string;
  ctx: string | null;
  data: any;
};

const todayISO = () => new Date().toISOString().slice(0, 10);

function startOfMonthISO(d = new Date()) {
  const x = new Date(d.getFullYear(), d.getMonth(), 1);
  return x.toISOString().slice(0, 10);
}
function endOfMonthISO(d = new Date()) {
  const x = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return x.toISOString().slice(0, 10);
}

export default function AuditPage() {
  const [project, setProject] = useState<string>(getProjectId());
  const [limit, setLimit] = useState<number>(50);
  const [from, setFrom] = useState<string>(startOfMonthISO());
  const [to, setTo] = useState<string>(endOfMonthISO());
  const [includeNav, setIncludeNav] = useState<boolean>(false);
  const [type, setType] = useState<string>(''); // '', 'save', 'nav', 'field', 'test' jne
  const [useBom, setUseBom] = useState<boolean>(true);

  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // jälgi projektivalija muutusi (headeris)
  useEffect(() => onProjectChange((id) => setProject(id)), []);

  const searchParams = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set('projectId', project);
    sp.set('limit', String(limit));
    if (from) sp.set('from', from);
    if (to) sp.set('to', to);
    if (includeNav) sp.set('includeNav', '1');
    if (type) sp.set('type', type);
    return sp;
  }, [project, limit, from, to, includeNav, type]);

  const jsonUrl = useMemo(() => `/api/audit/list?${searchParams.toString()}`, [searchParams]);
  const csvUrl = useMemo(() => {
    const sp = new URLSearchParams(searchParams);
    if (useBom) sp.set('bom', '1');
    return `/api/audit/csv?${sp.toString()}`;
  }, [searchParams, useBom]);

  const load = useCallback(async () => {
    if (!project) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(jsonUrl, { cache: 'no-store' });
      const j = await res.json();
      if (!j?.ok) throw new Error(j?.error || 'Load failed');
      setRows(j.data || []);
    } catch (e: any) {
      setErr(String(e?.message || e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [project, jsonUrl]);

  useEffect(() => {
    load();
  }, [load]);

  function openJsonInNewTab() {
    window.open(jsonUrl, '_blank', 'noopener,noreferrer');
  }

  function downloadCsv() {
    // lihtsalt navigeerime – brauser käsitleb failina
    window.location.href = csvUrl;
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Audit log (demo)</h1>
        <div className="text-sm flex items-center gap-2">
          <span className="opacity-60">Project:</span>
          <input
            className="border rounded px-2 py-1 w-48"
            value={project}
            onChange={(e) => setProject(e.target.value)}
            title="Current project id (header ProjectPicker teeb sama)"
          />
        </div>
      </header>

      {/* filtrid */}
      <div className="flex flex-wrap items-end gap-4">
        <label className="text-sm">
          <div className="opacity-60">Limit</div>
          <input
            type="number"
            className="border rounded px-2 py-1 w-24"
            value={limit}
            onChange={(e) => setLimit(Math.max(1, Number(e.target.value || 1)))}
            min={1}
          />
        </label>

        <label className="text-sm">
          <div className="opacity-60">From (ISO / YYYY-MM-DD)</div>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={from}
            max={to || todayISO()}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>

        <label className="text-sm">
          <div className="opacity-60">To (ISO / YYYY-MM-DD)</div>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={to}
            min={from}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>

        <label className="text-sm">
          <div className="opacity-60">Type</div>
          <select
            className="border rounded px-2 py-1"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">(all)</option>
            <option value="save">save</option>
            <option value="field">field</option>
            <option value="nav">nav</option>
            <option value="test">test</option>
          </select>
        </label>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeNav}
            onChange={(e) => setIncludeNav(e.target.checked)}
          />
          Include nav events
        </label>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={useBom}
            onChange={(e) => setUseBom(e.target.checked)}
          />
          Excel BOM
        </label>

        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={load}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
          <button
            onClick={downloadCsv}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white"
            title="Generate CSV via /api/audit/csv"
          >
            Download CSV
          </button>
          <button
            onClick={openJsonInNewTab}
            className="px-4 py-2 rounded-lg bg-slate-700 text-white"
            title="Open raw JSON via /api/audit/list"
          >
            Open JSON
          </button>
        </div>
      </div>

      {err && (
        <div className="rounded border border-rose-300 bg-rose-50 text-rose-700 p-3 text-sm">
          {err}
        </div>
      )}

      {/* tulemused */}
      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left">
              <th className="px-3 py-2 w-56">Time</th>
              <th className="px-3 py-2 w-32">Type</th>
              <th className="px-3 py-2 w-56">Project</th>
              <th className="px-3 py-2">Context / Data</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center opacity-60" colSpan={4}>
                  No entries.
                </td>
              </tr>
            )}

            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2 whitespace-nowrap">
                  {new Date(r.ts).toLocaleString()}
                </td>
                <td className="px-3 py-2">{r.type}</td>
                <td className="px-3 py-2">{r.project_id}</td>
                <td className="px-3 py-2">
                  <div className="text-xs opacity-60">
                    ctx: {r.ctx || '—'}
                  </div>

                  <details className="mt-1 group">
                    <summary className="cursor-pointer select-none text-slate-700 underline decoration-dotted">
                      toggle JSON
                    </summary>
                    <pre className="mt-2 p-3 bg-slate-50 rounded border overflow-auto max-h-80">
                      {JSON.stringify(r.data ?? {}, null, 2)}
                    </pre>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
