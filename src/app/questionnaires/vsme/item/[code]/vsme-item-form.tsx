'use client';

import React, { useEffect, useState } from 'react';

type VsmeItem = {
  code: string;
  title: string;
  type: 'select' | 'text' | 'number' | 'boolean';
  options?: Array<{ value: string; label: string }>;
};

export default function VsmeItemForm({
  item,
  initialProjectId,
}: {
  item: VsmeItem;
  initialProjectId: string;
}) {
  const [projectId, setProjectId] = useState(initialProjectId);
  const [value, setValue] = useState<any>('');
  const [note, setNote] = useState<string>('');

  const [autoState, setAutoState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedHash, setLastSavedHash] = useState<string>('');

  // Prefill (kui vajad item-tasemel read-back’i, loo GET /api/vsme/item/load)
  // MVP: jätame tühjaks; soovi korral võime hiljem panna siia päringu.

  async function save(status: 'draft' | 'final') {
    try {
      setAutoState('saving');
      const res = await fetch('/api/vsme/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          itemCode: item.code,
          status,
          value,
        }),
      });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error || 'save failed');
      setLastSavedHash(JSON.stringify({ value }));
      setAutoState('saved');
      setTimeout(() => setAutoState('idle'), 1200);
    } catch {
      setAutoState('error');
    }
  }

  // AUTOSAVE draft (debounce ~1s)
  useEffect(() => {
    const currentHash = JSON.stringify({ value });
    if (currentHash === lastSavedHash) return;
    setAutoState('saving');
    const t = setTimeout(async () => {
      try {
        const res = await fetch('/api/vsme/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            itemCode: item.code,
            status: 'draft',
            value,
          }),
        });
        const json = await res.json();
        if (!json?.ok) throw new Error(json?.error || 'save failed');
        setLastSavedHash(currentHash);
        setAutoState('saved');
        setTimeout(() => setAutoState('idle'), 1200);
      } catch {
        setAutoState('error');
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [value, projectId, item.code, lastSavedHash]);

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium mb-1">Project</label>
          <input
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="px-3 py-2 border rounded w-64"
            placeholder="client-test1"
          />
        </div>
        <div className="text-xs text-gray-500 min-w-[88px] text-right">
          {autoState === 'saving' && 'Saving…'}
          {autoState === 'saved' && 'Saved ✓'}
          {autoState === 'error' && <span className="text-red-600">Save failed</span>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Answer</label>

        {item.type === 'select' && Array.isArray(item.options) ? (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="px-3 py-2 border rounded w-full"
          >
            <option value="">— select —</option>
            {item.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : item.type === 'boolean' ? (
          <select
            value={String(value)}
            onChange={(e) => setValue(e.target.value === 'true')}
            className="px-3 py-2 border rounded w-full"
          >
            <option value="">— select —</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        ) : item.type === 'number' ? (
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="px-3 py-2 border rounded w-full"
            placeholder="0"
          />
        ) : (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="px-3 py-2 border rounded w-full"
            rows={4}
            placeholder="Type your answer…"
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes (optional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="px-3 py-2 border rounded w-full"
          rows={3}
          placeholder="Optional notes…"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => save('draft')}
          className="px-4 py-2 rounded bg-gray-900 text-white disabled:opacity-50"
          disabled={autoState === 'saving'}
        >
          Save draft
        </button>
        <button
          onClick={() => save('final')}
          className="px-4 py-2 rounded bg-emerald-600 text-white disabled:opacity-50"
          disabled={autoState === 'saving'}
        >
          Save final
        </button>
      </div>
    </div>
  );
}
