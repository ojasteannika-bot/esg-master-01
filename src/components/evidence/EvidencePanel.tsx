'use client';

import * as React from 'react';

type Evidence = {
  id: string;
  project_id: string;
  code: string;            // item code (nt B1-1)
  kind: 'file' | 'url';
  path_or_url: string;
  tags?: string[] | null;
  created_at: string;
};

export default function EvidencePanel({
  project,
  itemCode,
}: { project: string; itemCode: string }) {
  const [items, setItems] = React.useState<Evidence[]>([]);
  const [url, setUrl] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [posting, setPosting] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(
        `/api/evidence/list?project=${encodeURIComponent(project)}&code=${encodeURIComponent(itemCode)}`
      );
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || `Load failed: ${res.status}`);
      setItems(json.items ?? []);
    } catch (e: any) {
      setErr(e?.message ?? 'Load error');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { void load(); }, [project, itemCode]);

  async function addUrl() {
    if (!url.trim()) return;
    setPosting(true);
    setErr(null);
    try {
      const res = await fetch('/api/evidence/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project,
          item_code: itemCode,   // API-s kasutame item_code nime
          url,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || `Add failed: ${res.status}`);
      setUrl('');
      await load();
    } catch (e: any) {
      setErr(e?.message ?? 'Add error');
    } finally {
      setPosting(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this evidence?')) return;
    setErr(null);
    try {
      const res = await fetch(`/api/evidence/${encodeURIComponent(id)}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || `Delete failed: ${res.status}`);
      await load();
    } catch (e: any) {
      setErr(e?.message ?? 'Delete error');
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="mb-2 text-sm font-semibold">Evidence</div>

      <div className="flex gap-2">
        <input
          className="flex-1 rounded border px-3 py-2 text-sm"
          placeholder="Paste URL…"
          value={url}
          onChange={e => setUrl(e.target.value)}
        />
        <button
          onClick={addUrl}
          disabled={posting || !url.trim()}
          className="rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          {posting ? 'Adding…' : 'Add'}
        </button>
      </div>

      {err && <p className="mt-2 text-xs text-red-600">{err}</p>}

      <ul className="mt-3 divide-y">
        {loading && <li className="p-3 text-sm text-gray-500">Loading…</li>}
        {!loading && items.length === 0 && (
          <li className="p-3 text-sm text-gray-500">No evidence yet.</li>
        )}
        {items.map(ev => (
          <li key={ev.id} className="p-3 text-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-medium">{ev.kind.toUpperCase()}</div>
                <a
                  href={ev.path_or_url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline break-all"
                >
                  {ev.path_or_url}
                </a>
                <div className="text-xs text-gray-500">{new Date(ev.created_at).toLocaleString()}</div>
              </div>
              <button
                onClick={() => remove(ev.id)}
                className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
