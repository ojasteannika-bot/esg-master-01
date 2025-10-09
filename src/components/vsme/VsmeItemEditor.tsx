// src/components/vsme/VsmeItemEditor.tsx
'use client';

import React from 'react';

type Props = {
  projectId: string;
  code: string;          // "B1-1"
  title: string;
};

export default function VsmeItemEditor({ projectId, code, title }: Props) {
  const [value, setValue] = React.useState<string>('');
  const [notes, setNotes] = React.useState<string>('');
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [loaded, setLoaded] = React.useState(false);

  // Lae algandmed kliendis (lihtne, väldime serveri absoluut-URL muresid)
  React.useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const url = `/api/vsme/item/load?project=${encodeURIComponent(projectId)}&code=${encodeURIComponent(code)}`;
        const res = await fetch(url, { cache: 'no-store' });
        const json = await res.json();
        if (!dead && json?.ok && json?.record?.data) {
          setValue(json.record.data.value ?? '');
          setNotes(json.record.data.notes ?? '');
        }
      } catch (e) {
        // ignore, näitame tühja vormi
      } finally {
        if (!dead) setLoaded(true);
      }
    })();
    return () => { dead = true; };
  }, [projectId, code]);

  async function save(status: 'draft' | 'final') {
    try {
      setBusy(true);
      setMsg(null);

      const res = await fetch('/api/vsme/item/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: projectId,
          code,
          status,
          value: value.length ? value : null,
          notes: notes.length ? notes : null,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || 'Save failed');

      setMsg(status === 'final' ? 'Saved as FINAL' : 'Saved as draft');
    } catch (e: any) {
      setMsg(e?.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500">Code: <span className="font-mono">{code}</span></div>

      <label className="block text-sm font-medium mb-1">Project</label>
      <input className="w-full rounded border px-3 py-2 bg-gray-50" value={projectId} disabled />

      <label className="block text-sm font-medium mt-3 mb-1">Answer</label>
      <textarea
        className="w-full rounded border px-3 py-2 h-32"
        placeholder="Type your answer..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <label className="block text-sm font-medium mt-3 mb-1">Notes (optional)</label>
      <textarea
        className="w-full rounded border px-3 py-2 h-24"
        placeholder="Optional notes..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => save('draft')}
          disabled={busy || !loaded}
          className="rounded bg-slate-800 text-white px-4 py-2 disabled:opacity-50"
        >
          Save draft
        </button>
        <button
          onClick={() => save('final')}
          disabled={busy || !loaded}
          className="rounded bg-emerald-600 text-white px-4 py-2 disabled:opacity-50"
        >
          Save final
        </button>
      </div>

      {msg && <div className="text-sm text-gray-700">{msg}</div>}
    </div>
  );
}
