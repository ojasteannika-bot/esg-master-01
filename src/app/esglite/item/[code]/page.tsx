'use client';

import { use, useEffect, useState, useCallback } from 'react';

type ItemStatus = 'not_started' | 'draft' | 'final';
type EvidenceItem = { id: string; name: string; url: string; addedAt: string };

type SP = { project?: string };
type PP = { code: string };

// --- Questions (demo) ---
function QuestionsBox({ project, code }: { project: string; code: string }) {
  const [loading, setLoading] = useState(true);
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(
        `/api/cdm/item/answers?project=${encodeURIComponent(project)}&code=${encodeURIComponent(code)}`
      );
      const j = await r.json();
      if (j?.ok) {
        setQ1(j.data?.q1 ?? '');
        setQ2(j.data?.q2 ?? '');
      }
    } finally {
      setLoading(false);
    }
  }, [project, code]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    const r = await fetch('/api/cdm/item/answers', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ project, code, data: { q1, q2 } }),
    });
    const j = await r.json();
    if (!j?.ok) alert('Save failed: ' + (j?.error ?? 'unknown'));
  }

  return (
    <div style={{ border: '1px solid #ececec', borderRadius: 8, padding: 16, marginTop: 16 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Questions (demo)</div>
      {loading ? (
        <div>Loading…</div>
      ) : (
        <>
          <label style={{ display: 'block', marginBottom: 8 }}>
            1) Policy exists?
            <input
              style={{ marginLeft: 8 }}
              value={q1}
              placeholder="yes/no/partial"
              onChange={(e) => setQ1(e.target.value)}
            />
          </label>

          <label style={{ display: 'block', marginBottom: 12 }}>
            2) Latest update year
            <input
              style={{ marginLeft: 8 }}
              value={q2}
              placeholder="2024"
              onChange={(e) => setQ2(e.target.value)}
            />
          </label>

          <button onClick={save}>Save answers</button>
        </>
      )}
    </div>
  );
}

export default function ItemPage({
  searchParams,
  params,
}: {
  searchParams: Promise<SP>;
  params: Promise<PP> | PP;
}) {
  const { project: spProject } = use(searchParams);
  const { code } = use(params as Promise<PP>);
  const project = spProject ?? 'client-test1';

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ItemStatus>('not_started');
  const [updated, setUpdated] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [evUrl, setEvUrl] = useState('');
  const [evTags, setEvTags] = useState('policy, 2024');
  const [msg, setMsg] = useState<string>('');

  // NAV audit on mount
  useEffect(() => {
    (async () => {
      try {
        await fetch('/api/audit/add', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ project, type: 'nav', ctx: code, data: { page: 'item' } }),
        });
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, code]);

  const load = useCallback(async () => {
    setLoading(true);
    setMsg('');
    try {
      // status
      const sRes = await fetch(
        `/api/cdm/item?project=${encodeURIComponent(project)}&code=${encodeURIComponent(code)}`
      );
      const sJson = await sRes.json();
      if (sJson?.status?.status) {
        setStatus(sJson.status.status as ItemStatus);
        setUpdated(sJson.status.updated ?? null);
      } else {
        setStatus('not_started');
        setUpdated(null);
      }

      // evidence
      const eRes = await fetch(
        `/api/evidence/list?project=${encodeURIComponent(project)}&code=${encodeURIComponent(code)}`
      );
      const eJson = await eRes.json();
      setEvidence(Array.isArray(eJson?.items) ? eJson.items : []);
    } catch (e: any) {
      setMsg(e?.message ?? 'Load failed');
    } finally {
      setLoading(false);
    }
  }, [project, code]);

  useEffect(() => {
    load();
  }, [load]);

  async function setItemStatus(next: ItemStatus) {
    setMsg('');
    const res = await fetch('/api/cdm/item', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ project, code, status: next }),
    });
    const j = await res.json();
    if (j?.ok) {
      try {
        await fetch('/api/audit/add', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            project,
            type: 'save',
            ctx: code,
            data: { field: 'status', value: next },
          }),
        });
      } catch {}
      await load();
    } else {
      setMsg('Status update failed');
    }
  }

  async function addEvidence() {
    setMsg('');
    const url = evUrl.trim();
    if (!url) {
      setMsg('Please enter URL');
      return;
    }
    const res = await fetch('/api/evidence/add', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ project, code, name: evTags || 'Attachment', url }),
    });
    const j = await res.json();
    if (j?.ok) {
      setEvUrl('');
      try {
        await fetch('/api/audit/add', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            project,
            type: 'save',
            ctx: code,
            data: { field: 'evidence', value: 'add' },
          }),
        });
      } catch {}
      await load();
    } else {
      setMsg('Add evidence failed');
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <a href={`/questionnaires/esglite/${code.split('-')[0]}?project=${encodeURIComponent(project)}`}>
        &larr; Back to section
      </a>

      <h1 style={{ marginTop: 16 }}>
        {code} {loading ? '– Loading…' : ''}
      </h1>

      <p>
        Project: <b>{project}</b> · Status: <b>{status.replace('_', ' ')}</b>
        {updated ? ` · Updated: ${new Date(updated).toLocaleString()}` : ''}
      </p>

      <div style={{ display: 'flex', gap: 12, margin: '12px 0 24px' }}>
        <button onClick={() => setItemStatus('not_started')}>Mark: Not started</button>
        <button onClick={() => setItemStatus('draft')}>Mark: Draft</button>
        <button onClick={() => setItemStatus('final')}>Mark: Final</button>
        <button onClick={() => load()}>Refresh</button>
      </div>

      {msg && <div style={{ color: '#b00', marginBottom: 12 }}>{msg}</div>}

      {/* Questions demo */}
      <QuestionsBox project={project} code={code} />

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 16 }}>
        <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
          <h3>Help · AI assist</h3>
          <p>
            Kureeritud abi + AI assist lisandub siia. Praegu placeholder.
            <br />
            Context: <code>{project} · {code}</code>
          </p>
        </div>

        <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Evidence</h3>
            <button onClick={() => load()}>Refresh</button>
          </div>

          <div style={{ display: 'grid', gap: 8, margin: '8px 0 12px' }}>
            <input
              type="url"
              placeholder="https://example.com/document.pdf"
              value={evUrl}
              onChange={(e) => setEvUrl(e.target.value)}
            />
            <input
              type="text"
              placeholder="tags, comma-separated"
              value={evTags}
              onChange={(e) => setEvTags(e.target.value)}
            />
            <button onClick={addEvidence}>Add evidence</button>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {evidence.map((ev) => (
              <li key={ev.id} style={{ padding: '8px 0', borderBottom: '1px solid #f1f1f1' }}>
                <div style={{ fontWeight: 600 }}>{ev.name}</div>
                <a href={ev.url} target="_blank" rel="noreferrer">{ev.url}</a>
                <div style={{ fontSize: 12, color: '#666' }}>
                  Added: {new Date(ev.addedAt).toLocaleString()}
                </div>
              </li>
            ))}
            {evidence.length === 0 && <li>No evidence yet.</li>}
          </ul>
        </div>
      </section>
    </main>
  );
}
