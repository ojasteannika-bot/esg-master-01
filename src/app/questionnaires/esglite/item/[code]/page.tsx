'use client';

import * as React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import StatusPill from '@/components/StatusPill';

type ItemStatus = 'not_started' | 'partial' | 'ready';

type Field =
  | { id: string; label: string; type: 'text' | 'textarea'; required?: boolean; options?: string[] }
  | { id: string; label: string; type: 'number' | 'date'; required?: boolean }
  | { id: string; label: string; type: 'select'; required?: boolean; options?: string[] }
  | { id: string; label: string; type: 'file'; required?: boolean };

type Schema = {
  code: string;
  title: string;
  description?: string;
  fields: Field[];
  level?: 'basic' | 'comprehensive';
};

type LoadResponse = {
  ok: boolean;
  item: { code: string; status: ItemStatus; values?: Record<string, any> };
  schema: Schema;
  evidence: any[];
  audit: any[];
  sectionStats?: { completed: number; total: number };
  error?: string;
};

const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');

export default function ItemPage() {
  const params = useParams<{ code: string }>();
  const search = useSearchParams();
  const project = search.get('project') || 'client-test1';

  const [data, setData] = React.useState<LoadResponse | null>(null);
  const [values, setValues] = React.useState<Record<string, any>>({});
  const [status, setStatus] = React.useState<ItemStatus>('not_started');
  const [saving, setSaving] = React.useState<'idle' | 'draft' | 'final'>('idle');
  const [error, setError] = React.useState<string | null>(null);

  // LOAD
  React.useEffect(() => {
    let aborted = false;
    async function load() {
      try {
        setError(null);
        const res = await fetch(
          `/api/cdm/load?project=${encodeURIComponent(project)}&code=${encodeURIComponent(params.code)}`,
          { credentials: 'include' }
        );
        if (!res.ok) throw new Error(`Load failed: ${res.status}`);
        const json: LoadResponse = await res.json();
        if (aborted) return;
        if (!json.ok) throw new Error(json.error || 'Load error');
        setData(json);
        setValues(json.item.values || {});
        setStatus(json.item.status || 'not_started');
      } catch (e: any) {
        if (!aborted) setError(e.message || 'Load error');
      }
    }
    if (project && params.code) load();
    return () => { aborted = true; };
  }, [project, params.code]);

  // AUTOSAVE (draft)
  React.useEffect(() => {
    if (!data) return;
    const t = setTimeout(() => { void save('draft', false); }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, status, data?.item.code, project]);

  async function save(mode: 'draft' | 'final', showToast = true) {
    if (!data) return;
    try {
      setSaving(mode);
      const res = await fetch('/api/cdm/save', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project,
          code: data.item.code,
          patch: { values, status: mode === 'final' ? 'ready' : status },
          finalize: mode === 'final',
        }),
      });
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      const updated: { ok: boolean; status: ItemStatus } = await res.json();
      setStatus(updated.status);
      if (showToast) console.info(mode === 'final' ? 'Saved as final' : 'Draft saved');
    } catch (e: any) {
      setError(e.message || 'Save error');
    } finally {
      setSaving('idle');
    }
  }

  function onChange(id: string, v: any) {
    setValues((prev) => ({ ...prev, [id]: v }));
    if (status === 'not_started') setStatus('partial');
  }

  function FieldView({ f }: { f: Field }) {
    const base = 'block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10';
    const val = values?.[f.id] ?? '';

    switch (f.type) {
      case 'textarea':
        return (
          <textarea
            className={base}
            rows={6}
            placeholder={f.label}
            value={val}
            onChange={(e) => onChange(f.id, e.target.value)}
          />
        );
      case 'select':
        return (
          <select className={base} value={val} onChange={(e) => onChange(f.id, e.target.value)}>
            <option value="">— Select —</option>
            {(f.options || []).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case 'date':
        return (
          <input
            type="date"
            className={base}
            value={val}
            onChange={(e) => onChange(f.id, e.target.value)}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            className={base}
            value={val}
            onChange={(e) => onChange(f.id, e.target.valueAsNumber)}
          />
        );
      default:
        return (
          <input
            type="text"
            className={base}
            placeholder={f.label}
            value={val}
            onChange={(e) => onChange(f.id, e.target.value)}
          />
        );
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="rounded-md border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="h-6 w-48 animate-pulse rounded bg-gray-200 mb-4" />
        <div className="h-4 w-80 animate-pulse rounded bg-gray-200 mb-8" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  const { schema } = data;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-gray-500">
            Project: <code>{project}</code> · Code: <code>{schema.code}</code>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={saving !== 'idle'}
            onClick={() => save('draft')}
            className={cx(
              'inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium',
              'border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50'
            )}
          >
            {saving === 'draft' ? 'Saving…' : 'Save draft'}
          </button>
          <button
            disabled={saving !== 'idle'}
            onClick={() => save('final')}
            className={cx(
              'inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-white',
              'bg-gray-900 hover:bg-black disabled:opacity-50'
            )}
          >
            {saving === 'final' ? 'Finalizing…' : 'Save final'}
          </button>
        </div>
      </div>

      <h1 className="text-lg font-semibold tracking-tight">{schema.title}</h1>
      {schema.description && (
        <p className="mt-1 text-sm text-gray-600">{schema.description}</p>
      )}

      <div className="mt-5 space-y-5">
        {schema.fields.map((f) => (
          <div key={f.id}>
            <label className="mb-1 block text-sm font-medium text-gray-800">
              {f.label}{(f as any).required ? ' *' : ''}
            </label>
            <FieldView f={f as Field} />
            {f.type === 'file' && (
              <p className="mt-1 text-xs text-gray-500">Files will be handled in Evidence (WIP).</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <StatusPill status={status} />
      </div>
    </div>
  );
}
