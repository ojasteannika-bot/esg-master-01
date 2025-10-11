'use client';

import { use, useEffect, useMemo, useState } from 'react';

type Row = {
  at: string;
  project: string;
  type: string;
  ctx?: string | null;
  data?: any;
};

type SP = { project?: string };

export default function AuditPage({ searchParams }: { searchParams: Promise<SP> }) {
  const { project: spProject } = use(searchParams);
  const [project, setProject] = useState(spProject ?? 'client-test1');
  const [from, setFrom] = useState<string>(new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10));
  const [to, setTo] = useState<string>(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<string>('');
  const [limit, setLimit] = useState<number>(50);
  const [includeNav, setIncludeNav] = useState<boolean>(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string>('');
  const [excelBom, setExcelBom] = useState<boolean>(true);

  const qs = useMemo(() => {
    const q = new URLSearchParams();
    q.set('project', project);
    q.set('limit', String(limit));
    q.set('from', from);
    q.set('to', to);
    if (type) q.set('type', type);
    if (includeNav) q.set('includeNav', '1');
    return q.toString();
  }, [project, limit, from, to, type, includeNav]);

  async function refresh() {
    try {
      setErr('');
      const res = await fetch(`/api/audit/list?${qs}`);
      const j = await res.json();
      if (!j?.ok) throw new Error(j?.error ?? 'Load failed');
      setRows(j.items ?? []);
    } catch (e: any) {
      setRows([]);
      setErr(e?.message ?? 'Load failed');
    }
  }

  useEffect(() => {
    if (project) refresh();
  }, [qs]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      <h1>Audit log (demo)</h1>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        <label>Limit <input type="number" value={limit} onChange={(e) => setLimit(Number(e.target.value || 0))} style={{ width: 80 }} /></label>
        <label>From (ISO / YYYY-MM-DD) <input value={from} onChange={(e) => setFrom(e.target.value)} /></label>
        <label>To (ISO / YYYY-MM-DD) <input value={to} onChange={(e) => setTo(e.target.value)} /></label>
        <label>Type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">(all)</option>
            <option value="nav">nav</option>
            <option value="save">save</option>
            <option value="status">status</option>
          </select>
        </label>
        <label><input type="checkbox" checked={includeNav} onChange={(e) => setIncludeNav(e.target.checked)} /> Include nav events</label>
        <label><input type="checkbox" checked={excelBom} onChange={(e) => setExcelBom(e.target.checked)} /> Excel BOM</label>
        <button onClick={refresh}>Refresh</button>
        <a
          href={`/api/audit/list?${qs}`}
          target="_blank"
          rel="noreferrer"
          style={{ padding: '8px 12px', borderRadius: 6, background: '#16a34a', color: 'white', textDecoration: 'none' }}
        >
          Open JSON
        </a>
      </div>

      {!project && <div style={{ background: '#fee2e2', color: '#991b1b', padding: 12, borderRadius: 8, marginBottom: 12 }}>Missing project</div>}
      {err && <div style={{ background: '#fee2e2', color: '#991b1b', padding: 12, borderRadius: 8, marginBottom: 12 }}>{err}</div>}

      <div style={{ marginBottom: 8 }}>
        Project:{' '}
        <input value={project} onChange={(e) => setProject(e.target.value)} style={{ width: 240 }} />
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
            <th style={{ padding: 8 }}>Time</th>
            <th style={{ padding: 8 }}>Type</th>
            <th style={{ padding: 8 }}>Project</th>
            <th style={{ padding: 8 }}>Context / Data</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={4} style={{ padding: 16, color: '#6b7280' }}>No entries.</td></tr>
          )}
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: 8 }}>{new Date(r.at).toLocaleString()}</td>
              <td style={{ padding: 8 }}>{r.type}</td>
              <td style={{ padding: 8 }}>{r.project}</td>
              <td style={{ padding: 8 }}>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{r.ctx}</div>
                <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>{r.data ? JSON.stringify(r.data) : ''}</pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
