'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { getProjectId } from '@/lib/project';

type VsmeItem = {
  code?: string;             // nt "B1-1"
  id?: string;
  title?: string;
  label?: string;
  type?: string;             // "text" | "number" | "select" | ...
  options?: any[];
  attrs?: any;
  meta?: any;
};

type VsmeSection = {
  code?: string;             // "B1" vms
  title?: string;
  nodes?: VsmeItem[];
  items?: VsmeItem[];
  children?: VsmeItem[];
};

type Props = {
  section: VsmeSection;
  initialProjectId?: string;
};

function inferType(it: VsmeItem): string {
  const t = it.type || it?.attrs?.type || it?.meta?.type;
  if (t) return t;
  const opts = it.options || it?.attrs?.options || it?.meta?.options;
  if (opts && Array.isArray(opts) && opts.length) return 'select';
  return 'text';
}

function readOptions(it: VsmeItem): { label: string; value: any }[] {
  const raw = it.options || it?.attrs?.options || it?.meta?.options || [];
  if (!Array.isArray(raw)) return [];
  if (raw.length && typeof raw[0] === 'object') {
    return raw.map((r: any) => ({ label: r.label ?? String(r.value ?? r.label), value: r.value ?? r.label }));
  }
  return raw.map((r: any) => ({ label: String(r), value: r }));
}

export default function SectionForm({ section, initialProjectId }: Props) {
  const projectId = initialProjectId || getProjectId();
  const code = section.code || 'unknown';
  const items = useMemo<VsmeItem[]>(() => section.items || section.nodes || section.children || [], [section]);

  const [values, setValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<null | 'draft' | 'final'>(null);

  // autosave state
  const [autoState, setAutoState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedHash, setLastSavedHash] = useState<string>('');

  // Prefill — lae serverist olemasolevad väärtused
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const url = `/api/vsme/load?projectId=${encodeURIComponent(projectId)}&code=${encodeURIComponent(code)}`;
        const resp = await fetch(url, { cache: 'no-store' });
        const json = await resp.json();
        if (!cancelled && json?.ok) {
          const initial = json.values ?? {};
          setValues(initial);
          setSource(json.source ?? null);
          setLastSavedHash(JSON.stringify(initial)); // ära kohe autosave’i käivita
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [projectId, code]);

  const update = (key: string, v: any) => {
    setValues(prev => ({ ...prev, [key]: v }));
  };

  async function saveTo(status: 'draft' | 'final', payload: Record<string, any>) {
    const resp = await fetch('/api/vsme/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, code, status, values: payload }),
    });
    const json = await resp.json();
    if (!json?.ok) throw new Error(json?.error || 'save failed');
    return true;
  }

  // Käsitsi salvestused
  async function saveDraft() {
    try {
      setAutoState('saving');
      await saveTo('draft', values);
      const h = JSON.stringify(values);
      setLastSavedHash(h);
      setAutoState('saved');
      setTimeout(() => setAutoState('idle'), 1200);
      setSource('draft');
    } catch {
      setAutoState('error');
    }
  }

  async function saveFinal() {
    try {
      setAutoState('saving');
      await saveTo('final', values);
      const h = JSON.stringify(values);
      setLastSavedHash(h);
      setAutoState('saved');
      setTimeout(() => setAutoState('idle'), 1200);
      setSource('final');
    } catch {
      setAutoState('error');
    }
  }

  // AUTOSAVE (draft) – debounce ~1000 ms, ainult kui on muudatus ja mitte laadimise ajal
  useEffect(() => {
    if (loading) return;
    const currentHash = JSON.stringify(values);
    if (currentHash === lastSavedHash) return; // pole muutunud

    setAutoState('saving');
    const t = setTimeout(async () => {
      try {
        await saveTo('draft', values);
        setLastSavedHash(currentHash);
        setAutoState('saved');
        setSource('draft');
        setTimeout(() => setAutoState('idle'), 1200);
      } catch {
        setAutoState('error');
      }
    }, 1000);

    return () => clearTimeout(t);
  }, [values, loading]); // intentionally not depending on lastSavedHash

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{section.title || section.code}</h2>
          <p className="text-xs text-gray-500">
            {loading
              ? 'Loading…'
              : source
              ? `Prefilled from ${source.toUpperCase()}`
              : 'No saved values yet'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500 min-w-[88px] text-right">
            {autoState === 'saving' && 'Saving…'}
            {autoState === 'saved' && 'Saved ✓'}
            {autoState === 'error' && <span className="text-red-600">Save failed</span>}
          </div>
          <button
            type="button"
            onClick={saveDraft}
            className="px-4 py-2 rounded-md border bg-white hover:bg-gray-50"
            disabled={loading || autoState === 'saving'}
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={saveFinal}
            className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            disabled={loading || autoState === 'saving'}
          >
            Save final
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {(items ?? []).map((it, idx) => {
          const key = it.code || it.id || `item_${idx}`;
          const label = it.title || it.label || key;
          const t = inferType(it);

          if (t === 'select') {
            const opts = readOptions(it);
            return (
              <div key={key} className="space-y-1">
                <label className="block text-sm font-medium">{label}</label>
                <select
                  className="block w-full rounded-md border px-3 py-2"
                  value={values[key] ?? ''}
                  onChange={(e) => update(key, e.target.value)}
                  disabled={loading}
                >
                  <option value="" disabled>Choose…</option>
                  {opts.map(o => (
                    <option key={String(o.value)} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            );
          }

          if (t === 'number') {
            return (
              <div key={key} className="space-y-1">
                <label className="block text-sm font-medium">{label}</label>
                <input
                  type="number"
                  className="block w-full rounded-md border px-3 py-2"
                  value={values[key] ?? ''}
                  onChange={(e) => update(key, e.target.value === '' ? '' : Number(e.target.value))}
                  disabled={loading}
                />
              </div>
            );
          }

          // default: text
          return (
            <div key={key} className="space-y-1">
              <label className="block text-sm font-medium">{label}</label>
              <input
                type="text"
                className="block w-full rounded-md border px-3 py-2"
                value={values[key] ?? ''}
                onChange={(e) => update(key, e.target.value)}
                disabled={loading}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
