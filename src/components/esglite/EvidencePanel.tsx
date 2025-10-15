'use client';

import React, { useEffect, useMemo, useState } from 'react';

type EvidenceItem = {
  id?: string;
  kind?: string;           // 'url' | ... (tulevikus)
  url?: string;
  tags?: string[] | null;
  created_at?: string;
  note?: string | null;
};

type ListResp =
  | { ok: true; items?: EvidenceItem[] }
  | { ok: false; error?: string };

type Props = { project: string; code: string };

export default function EvidencePanel({ project, code }: Props) {
  const [items, setItems] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // form
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState('');

  const canAdd = useMemo(() => {
    try {
      if (!url.trim()) return false;
      // lubame ka mitte-HTTP dokumendid; kui on http(s), siis new URL kontroll.
      if (/^https?:\/\//i.test(url.trim())) new URL(url.trim());
      return true;
    } catch {
      return false;
    }
  }, [url]);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(
        `/api/evidence/list?project=${encodeURIComponent(project)}&code=${encodeURIComponent(code)}`,
        { cache: 'no-store' }
      );
      const json: ListResp = await r.json();
      if (!json || (json as any).ok === false) {
        throw new Error((json as any)?.error || 'Failed to load evidence');
      }
      setItems((json as any).items ?? []);
    } catch (e: any) {
      setErr(e?.message || 'Load failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, code]);

  async function addUrl() {
    if (!canAdd) return;
    setErr(null);
    try {
      const body = {
        project,
        code,
        kind: 'url',
        url: url.trim(),
        // sisesta komadega eraldatult; tühjad filtrisse
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };
      const r = await fetch('/api/evidence/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await r.json();
      if (!json?.ok) throw new Error(json?.error || 'Add failed');
      setUrl('');
      setTags('');
      await load();
    } catch (e: any) {
      setErr(e?.message || 'Add failed');
    }
  }

  return (
    <div className="rounded-md border border-gray-200">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h3 className="text-sm font-semibold">Evidence</h3>
        <button
          onClick={load}
          className="text-xs rounded border px-2 py-1 hover:bg-gray-50"
          title="Refresh"
        >
          Refresh
        </button>
      </div>

      {/* Add form */}
      <div className="space-y-2 p-4">
        <label className="block text-xs text-gray-600">Add URL</label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/document.pdf"
          className="w-full rounded border px-2 py-1 text-sm"
        />
        <label className="block text-xs text-gray-600">Tags (comma-separated)</label>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="policy, 2024"
          className="w-full rounded border px-2 py-1 text-sm"
        />
        <button
          onClick={addUrl}
          disabled={!canAdd}
          className="w-full rounded bg-gray-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Add evidence
        </button>
        {err && <p className="text-xs text-red-600">Error: {err}</p>}
      </div>

      {/* List */}
      <div className="divide-y">
        {loading && <p className="p-4 text-sm text-gray-500">Loading…</p>}
        {!loading && items.length === 0 && (
          <p className="p-4 text-sm text-gray-500">No evidence yet.</p>
        )}
        {(items ?? []).map((it, idx) => {
          const host =
            it.url && /^https?:\/\//i.test(it.url) ? safeHost(it.url) : undefined;
          return (
            <div key={it.id ?? idx} className="grid gap-1 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide text-gray-500">
                  {it.kind ?? 'url'}
                </span>
                {it.created_at && (
                  <span className="text-xs text-gray-400">
                    {new Date(it.created_at).toLocaleString()}
                  </span>
                )}
              </div>
              {it.url && (
                <a
                  href={it.url}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-sm text-blue-700 underline"
                  title={it.url}
                >
                  {host ? `${host} — ` : ''}
                  {it.url}
                </a>
              )}
              {Array.isArray(it.tags) && it.tags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {it.tags.map((t, i) => (
                    <span
                      key={`${t}-${i}`}
                      className="rounded border bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function safeHost(u: string) {
  try {
    return new URL(u).host;
  } catch {
    return undefined;
  }
}
