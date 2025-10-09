'use client';

import * as React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import RightRail from '@/components/esglite/RightRail';

type Field = {
  id: string;
  label: string;
  type: 'select' | 'textarea' | 'text';
  options?: string[];
};

type Schema = {
  code: string;
  title: string;
  fields: Field[];
};

type LoadResponse = {
  ok: boolean;
  project: string;
  schema: Schema;
  item?: {
    code: string;
    status: 'not_started' | 'draft' | 'final';
    values?: Record<string, any>;
    updated_at?: string;
    section_code?: string;
  };
  evidence?: any[];
  audit?: any[];
};

export default function EsItemPage() {
  const params = useParams<{ code: string }>();
  const search = useSearchParams();
  const project = search.get('project') ?? '';
  const code = params.code;

  const [schema, setSchema] = React.useState<Schema | null>(null);
  const [values, setValues] = React.useState<Record<string, any>>({});
  const [status, setStatus] = React.useState<'not_started' | 'draft' | 'final'>('not_started');
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState<'draft' | 'final' | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);

  React.useEffect(() => {
    let aborted = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/cdm/item?project=${encodeURIComponent(project)}&code=${encodeURIComponent(code)}`
        );
        if (!res.ok) throw new Error(`Load failed: ${res.status}`);
        const json: LoadResponse = await res.json();
        if (aborted) return;

        setSchema(json.schema);
        setValues(json.item?.values || {});
        setStatus((json.item?.status as any) || 'not_started');
      } catch (e: any) {
        if (!aborted) setError(e.message || 'Load error');
      } finally {
        if (!aborted) setLoading(false);
      }
    }

    if (project && code) void load();
    return () => {
      aborted = true;
    };
  }, [project, code]);

  function onChangeField(id: string, v: any) {
    setValues(prev => ({ ...prev, [id]: v }));
    if (status === 'not_started') setStatus('draft'); // esimene muutus → draft
  }

  async function save(mode: 'draft' | 'final') {
    setSaving(mode);
    setToast(null);
    try {
      const res = await fetch(`/api/cdm/item/save`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project,
          code,
          status: mode,
          values,
        }),
      });
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      setStatus(mode);
      setToast(mode === 'final' ? 'Saved as final' : 'Draft saved');
    } catch (e: any) {
      setToast(e.message || 'Save error');
    } finally {
      setSaving(null);
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* breadcrumb + pealkiri */}
      <div className="mb-4 text-sm text-gray-500">
        <a href={`/questionnaires/esglite/${encodeURIComponent(code.slice(0, 2))}?project=${encodeURIComponent(project)}`} className="underline underline-offset-2">
          Back to section
        </a>
      </div>

      <h1 className="mb-1 text-2xl font-semibold">
        {schema ? `${schema.code} — ${schema.title}` : 'Loading…'}
      </h1>
      <div className="mb-6 text-xs text-gray-500">
        Project: <span className="font-medium">{project}</span> · Status:{' '}
        <span className="font-medium capitalize">{status.replace('_', ' ')}</span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr,20rem]">
        {/* VASAK: vorm */}
        <section>
          {loading && <div className="text-sm text-gray-500">Loading…</div>}
          {schema && (
            <div className="space-y-5">
              {schema.fields.map(f => {
                if (f.type === 'select') {
                  return (
                    <div key={f.id} className="space-y-1">
                      <label className="block text-sm font-medium">{f.label}</label>
                      <select
                        className="w-full rounded border px-3 py-2 text-sm"
                        value={values[f.id] ?? ''}
                        onChange={e => onChangeField(f.id, e.target.value)}
                      >
                        <option value="">— Select —</option>
                        {(f.options || []).map(opt => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }
                if (f.type === 'textarea') {
                  return (
                    <div key={f.id} className="space-y-1">
                      <label className="block text-sm font-medium">{f.label}</label>
                      <textarea
                        className="min-h-[160px] w-full rounded border px-3 py-2 text-sm"
                        value={values[f.id] ?? ''}
                        onChange={e => onChangeField(f.id, e.target.value)}
                      />
                    </div>
                  );
                }
                return (
                  <div key={f.id} className="space-y-1">
                    <label className="block text-sm font-medium">{f.label}</label>
                    <input
                      className="w-full rounded border px-3 py-2 text-sm"
                      value={values[f.id] ?? ''}
                      onChange={e => onChangeField(f.id, e.target.value)}
                    />
                  </div>
                );
              })}

              <div className="flex gap-3 pt-2">
                <button
                  disabled={!!saving}
                  onClick={() => void save('draft')}
                  className="rounded bg-gray-800 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                >
                  {saving === 'draft' ? 'Saving…' : 'Save draft'}
                </button>
                <button
                  disabled={!!saving}
                  onClick={() => void save('final')}
                  className="rounded bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {saving === 'final' ? 'Saving…' : 'Save final'}
                </button>
              </div>

              {toast && (
                <div className="text-sm text-gray-600" role="status">
                  {toast}
                </div>
              )}
            </div>
          )}
        </section>

        {/* PAREM: ühine veerg (AI + evidence) */}
        <RightRail project={project} code={params.code} />
      </div>
    </div>
  );
}
