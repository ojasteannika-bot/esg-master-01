// src/app/esglite/item/[code]/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

type ItemStatus = 'not_started' | 'draft' | 'final';

function QuestionsBox({ project, code }: { project: string; code: string }) {
  const [loading, setLoading] = useState(true);
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/cdm/item/answers?project=${encodeURIComponent(project)}&code=${encodeURIComponent(code)}`);
      const j = await r.json();
      setQ1(j?.data?.q1 ?? '');
      setQ2(j?.data?.q2 ?? '');
    } finally { setLoading(false); }
  }, [project, code]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    await fetch('/api/cdm/item/answers', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ project, code, data: { q1, q2 } }),
    });
    await load();
  };

  return (
    <div style={{ border:'1px solid #eee', padding:16, borderRadius:8 }}>
      <h4>Help · AI assist</h4>
      <p>Demo questions</p>
      {loading ? <p>Loading…</p> : (
        <>
          <div style={{ marginBottom:8 }}>
            <label>Q1<br />
              <input value={q1} onChange={e => setQ1(e.target.value)} style={{ width:'100%' }} />
            </label>
          </div>
          <div style={{ marginBottom:8 }}>
            <label>Q2<br />
              <input value={q2} onChange={e => setQ2(e.target.value)} style={{ width:'100%' }} />
            </label>
          </div>
          <button onClick={save}>Save answers</button>
        </>
      )}
    </div>
  );
}

export default function ItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ project?: string }>;
}) {
  const p = (params as any) as { code: string };
  const sp = (searchParams as any) as { project?: string };
  const project = sp?.project ?? 'client-test1';
  const code = p?.code;

  const [status, setStatus] = useState<ItemStatus>('not_started');
  const [busy, setBusy] = useState(false);

  const loadStatus = useCallback(async () => {
    const r = await fetch(`/api/cdm/item-status?project=${encodeURIComponent(project)}&code=${encodeURIComponent(code)}`);
    const j = await r.json();
    setStatus(j?.status ?? 'not_started');
  }, [project, code]);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  const mark = async (s: ItemStatus) => {
    setBusy(true);
    try {
      await fetch('/api/cdm/item-status', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ project, code, status: s }),
      });
      await loadStatus();
    } finally { setBusy(false); }
  };

  return (
    <main style={{ maxWidth:900, margin:'0 auto', padding:24 }}>
      <p><Link href={`/esglite/${code.split('-')[0]}?project=${encodeURIComponent(project)}`}>← Back to section</Link></p>
      <h3>{code}</h3>
      <p>Project: <b>{project}</b> · Status: <b>{status.replace('_',' ')}</b></p>

      <div style={{ margin:'12px 0' }}>
        <button disabled={busy} onClick={() => mark('not_started')}>Mark: Not started</button>{' '}
        <button disabled={busy} onClick={() => mark('draft')}>Mark: Draft</button>{' '}
        <button disabled={busy} onClick={() => mark('final')}>Mark: Final</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <QuestionsBox project={project} code={code} />
        <div style={{ border:'1px solid #eee', padding:16, borderRadius:8 }}>
          <h4>Evidence</h4>
          <p><i>No evidence yet (demo box)</i></p>
        </div>
      </div>
    </main>
  );
}
