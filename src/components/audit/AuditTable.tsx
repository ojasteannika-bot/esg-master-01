'use client';

import { useEffect, useState } from 'react';

type Row = {
  ts?: string;
  type?: string;
  ctx?: string;
  project?: string;
  data?: any;
};

export default function AuditTable(props: {
  project: string;
  limit: number;
  from?: string;
  to?: string;
}) {
  const { project, limit, from, to } = props;
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let on = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const q = new URLSearchParams();
        q.set('project', project);
        q.set('limit', String(limit));
        if (from) q.set('from', from);
        if (to) q.set('to', to);
        const res = await fetch(`/api/cdm/audit?${q.toString()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const j = await res.json();
        const r: Row[] = Array.isArray(j) ? j : (j.rows ?? j.data ?? []);
        if (!on) return;
        setRows(Array.isArray(r) ? r : []);
      } catch (e: any) {
        if (!on) return;
        setError(e?.message ?? 'Load failed');
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => { on = false; };
  }, [project, limit, from, to]);

  if (loading) return <div>Loading…</div>;
  if (error) return <div style={{ color: '#b91c1c' }}>Error: {error}</div>;
  if (!rows.length) return <div>No audit rows.</div>;

  return (
    <div style={{ overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead style={{ background: '#f8fafc' }}>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #e5e7eb' }}>Time</th>
            <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #e5e7eb' }}>Type</th>
            <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #e5e7eb' }}>Ctx</th>
            <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #e5e7eb' }}>Data</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>{r.ts ? new Date(r.ts).toLocaleString() : '—'}</td>
              <td style={{ padding: '8px 10px' }}>{r.type ?? '—'}</td>
              <td style={{ padding: '8px 10px' }}>{r.ctx ?? '—'}</td>
              <td style={{ padding: '8px 10px', maxWidth: 640, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <code>{typeof r.data === 'string' ? r.data : JSON.stringify(r.data ?? '')}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
