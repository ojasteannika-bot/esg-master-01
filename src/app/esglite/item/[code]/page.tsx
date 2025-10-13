'use client';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';

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
    } finally {
      setLoading(false);
    }
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

  if (loading) return <p>Loading…</p>;

  return (
    <div style={{ border: '1px solid #eee', padding: 16, borderRadius: 8 }}>
      <h4>Demo questions</h4>
      <div style={{ marginBottom: 8 }}>
        <label>Q1<br />
          <input value={q1} onChange={e => setQ1(e.target.value)} style={{ width: '100%' }} />
        </label>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label>Q2<br />
          <input value={q2} onChange={e => setQ2(e.target.value)} style={{ width: '100%' }} />
        </label>
      </div>
      <button onClick={save}>Save draft</button>
    </div>
  );
}

export default function Page(props: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ project?: string }>;
}) {
  const p = props as any;
  const params = (p.params ?? {}) as { code: string };
  const search = (p.searchParams ?? {}) as { project?: string };
  const project = search.project ?? 'client-test1';
  const code = params.code;

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <p><Link href={`/questionnaires/esglite/nodes?project=${encodeURIComponent(project)}`}>&larr; Back</Link></p>
      <h3>Section item {code}</h3>
      <p>Project: <b>{project}</b></p>
      <QuestionsBox project={project} code={code} />
    </main>
  );
}
