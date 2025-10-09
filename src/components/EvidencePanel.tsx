'use client';

import * as React from 'react';

type Evidence = {
  id: string;
  kind: 'url' | 'file';
  path_or_url: string;
  tags?: string[];
  created_at?: string;
};

function cx(...cls: (string | false | null | undefined)[]) {
  return cls.filter(Boolean).join(' ');
}

export default function EvidencePanel({
  project,
  code,
}: {
  project: string;
  code: string;
}) {
  const [items, setItems] = React.useState<Evidence[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  // Add URL form
  const [url, setUrl] = React.useState('');
  const [tags, setTags] = React.useState('');

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/evidence/list?project=${encodeURIComponent(project)}&code=${encodeURIComponent(code)}`,
        { credentials: 'include' }
      );
      if (!res.ok) throw new Error(`list ${res.status}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'list error');
      setItems(json.evidence || []);
    } catch (e: any) {
      setErr(e.message || 'Load error');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (project && code) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, code]);

  async function addUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch('/api/evidence/add', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project,
          code,
          kind: 'url',
          url: url.trim(),
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || `add ${res.status}`);
      }
      setUrl('');
      setTags('');
      await load();
    } catch (e: any) {
      setErr(e.message || 'Add error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold">Evidence</div>
        <button
          onClick={() => load()}
          className="text-xs underline underline-offset-2"
          disabled={loading}
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {err && (
        <div className="mb-3 rounded border border-rose-300 bg-rose-50 p-2 text-xs text-rose-800">
          {err}
        </div>
      )}

      <ul className="space-y-2">
        {items.length === 0 && (
          <li className="text-sm text-gray-500">No evidence yet.</li>
        )}
        {items.map((ev) => (
          <li key={ev.id} className="text-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="mr-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-gray-700">
                  {ev.kind}
                </span>
                {ev.kind === 'url' ? (
                  <a
                    href={ev.path_or_url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-2"
                  >
                    {ev.path_or_url}
                  </a>
                ) : (
                  <span>{ev.path_or_url}</span>
                )}
                {ev.tags?.length ? (
                  <span className="ml-2 text-xs text-gray-500">
                    • {ev.tags.join(', ')}
                  </span>
                ) : null}
              </div>
              {ev.created_at && (
                <span className="shrink-0 text-xs text-gray-400">
                  {new Date(ev.created_at).toLocaleString()}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>

      <hr className="my-3" />

      {/* Add URL evidence */}
      <form onSubmit={addUrl} className="space-y-2">
        <div className="text-xs font-medium text-gray-700">Add URL</div>
        <input
          type="url"
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          placeholder="https://example.com/policy.pdf"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <input
          type="text"
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          placeholder="tags (comma-separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={loading}
            className={cx(
              'inline-flex items-center rounded-md px-3 py-1.5 text-sm text-white',
              loading ? 'bg-gray-600' : 'bg-gray-900 hover:bg-black'
            )}
          >
            {loading ? 'Adding…' : 'Add URL'}
          </button>
          <span className="text-xs text-gray-500">
            File-upload tuleb eraldi (hiljem, S3/Supabase Storage).
          </span>
        </div>
      </form>
    </div>
  );
}
