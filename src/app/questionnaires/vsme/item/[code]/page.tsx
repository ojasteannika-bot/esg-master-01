'use client';

import * as React from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import StatusPill from '@/components/StatusPill';

type ItemStatus = 'not_started' | 'partial' | 'ready';

type VsmeItem = {
  code: string;
  title: string;
  description?: string;
  level?: 'basic' | 'comprehensive';
  fields: Array<{
    id: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'date' | 'file' | 'textarea';
    required?: boolean;
    options?: string[];
  }>;
};

type LoadResponse = {
  item: {
    code: string;
    status: ItemStatus;
    draft_text?: string;
    owner_id?: string | null;
    due_date?: string | null;
    level?: 'basic' | 'comprehensive';
    values?: Record<string, any>;
  };
  schema: VsmeItem;
  evidence: Array<{
    id: string;
    kind: 'file' | 'url';
    path_or_url: string;
    tags?: string[];
  }>;
  audit: Array<{
    id: string;
    action: string;
    actor_id: string;
    ts: string;
  }>;
  sectionStats?: {
    completed: number;
    total: number;
  };
};

const cx = (...cls: (string | false | null | undefined)[]) =>
  cls.filter(Boolean).join(' ');

function ProgressMini({ stats }: { stats?: LoadResponse['sectionStats'] }) {
  const c = stats?.completed ?? 0;
  const t = stats?.total ?? 0;
  return <span className="text-xs text-gray-500">{c}/{t} completed</span>;
}

export default function VsmeItemPage() {
  const params = useParams<{ code: string }>();
  const search = useSearchParams();
  const router = useRouter();

  const project = search.get('project') || '';

  const [data, setData] = React.useState<LoadResponse | null>(null);
  const [values, setValues] = React.useState<Record<string, any>>({});
  const [status, setStatus] = React.useState<ItemStatus>('not_started');
  const [saving, setSaving] = React.useState<'idle' | 'draft' | 'final'>('idle');
  const [error, setError] = React.useState<string | null>(null);
  const [debounceKey, setDebounceKey] = React.useState<number>(0);

  // ---- LOAD -----------------------------------------------------------------
  React.useEffect(() => {
    let aborted = false;
    async function load() {
      setError(null);
      try {
        const url = `/api/vsme/load?project=${encodeURIComponent(
          project
        )}&code=${encodeURIComponent(params.code)}`;
        const res = await fetch(url, { method: 'GET', credentials: 'include' });
        if (!res.ok) throw new Error(`Load failed: ${res.status}`);
        const json: LoadResponse = await res.json();
        if (aborted) return;
        setData(json);
        setValues(json.item.values || {});
        setStatus(json.item.status || 'not_started');
      } catch (e: any) {
        if (!aborted) setError(e.message || 'Load error');
      }
    }
    if (project && params.code) load();
    return () => {
      aborted = true;
    };
  }, [project, params.code]);

  // ---- AUTOSAVE (DRAFT) -----------------------------------------------------
  React.useEffect(() => {
    if (!data) return;
    const handle = setTimeout(() => {
      if (saving === 'final') return;
      void savePatch('draft', false);
    }, 800);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, status, debounceKey, data?.item.code, project]);

  async function savePatch(mode: 'draft' | 'final', toast = true) {
    if (!data) return;
    try {
      setSaving(mode);
      const res = await fetch('/api/vsme/save', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project,
          code: data.item.code,
          patch: {
            values,
            status: mode === 'final' ? 'ready' : status,
          },
          finalize: mode === 'final',
        }),
      });
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      const updated: { status: ItemStatus } = await res.json();
      setStatus(updated.status);
      if (toast) console.info(mode === 'final' ? 'Saved as final' : 'Draft saved');
    } catch (e: any) {
      setError(e.message || 'Save error');
    } finally {
      setSaving('idle');
    }
  }

  function onChangeField(id: string, v: any) {
    setValues((prev) => ({ ...prev, [id]: v }));
    setDebounceKey((k) => k + 1);
    if (status === 'not_started') setStatus('partial');
  }

  function Field({ f }: { f: VsmeItem['fields'][number] }) {
    const common =
      'block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10';
    const val = values?.[f.id] ?? '';

    if (f.type === 'textarea') {
      return (
        <textarea
          className={common}
          rows={6}
          placeholder={f.label}
          value={val}
          onChange={(e) => onChangeField(f.id, e.target.value)}
        />
      );
    }
    if (f.type === 'select') {
      return (
        <select
          className={common}
          value={val}
          onChange={(e) => onChangeField(f.id, e.target.value)}
        >
          <option value="">— Select —</option>
          {(f.options || []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }
    if (f.type === 'date') {
      return (
        <input
          type="date"
          className={common}
          value={val}
          onChange={(e) => onChangeField(f.id, e.target.value)}
        />
      );
    }
    if (f.type === 'number') {
      return (
        <input
          type="number"
          className={common}
          value={val}
          onChange={(e) =>
            onChangeField(f.id, e.target.value === '' ? '' : e.target.valueAsNumber)
          }
        />
      );
    }
    // 'text' | 'file' (file sisuhaldus on eraldi Evidence paneelis)
    return (
      <input
        type="text"
        className={common}
        placeholder={f.label}
        value={val}
        onChange={(e) => onChangeField(f.id, e.target.value)}
      />
    );
  }

  // ---- RENDER ---------------------------------------------------------------
  if (!project) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            Puudub <code>project</code> query param. Ava leht näiteks:
            <br />
            <code>/questionnaires/vsme/item/{params.code}?project=client-test1</code>
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="rounded-md border border-rose-300 bg-rose-50 p-4">
          <p className="text-sm text-rose-800">Error: {error}</p>
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

  const { schema, evidence, audit, sectionStats } = data;

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold tracking-tight">
              {schema.code} — {schema.title}
            </h1>
            <StatusPill status={status} />
          </div>
          <div className="mt-1 flex items-center gap-3">
            <span
              className={cx(
                'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                schema.level === 'basic'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-purple-50 text-purple-700'
              )}
            >
              {schema.level === 'basic' ? 'Basic' : 'Comprehensive'}
            </span>
            <ProgressMini stats={sectionStats} />
          </div>
          {schema.description && (
            <p className="mt-2 text-sm text-gray-600">{schema.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={saving !== 'idle'}
            onClick={() => savePatch('draft')}
            className={cx(
              'inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium',
              'border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50'
            )}
          >
            {saving === 'draft' ? 'Saving…' : 'Save draft'}
          </button>
          <button
            disabled={saving !== 'idle'}
            onClick={() => savePatch('final')}
            className={cx(
              'inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-white',
              'bg-gray-900 hover:bg-black disabled:opacity-50'
            )}
          >
            {saving === 'final' ? 'Finalizing…' : 'Save final'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2 space-y-5">
          {schema.fields.map((f) => (
            <div key={f.id}>
              <label className="mb-1 block text-sm font-medium text-gray-800">
                {f.label}
                {f.required ? ' *' : ''}
              </label>
              <Field f={f} />
              {f.type === 'file' && (
                <p className="mt-1 text-xs text-gray-500">
                  Failid on hallatavad parempoolses Evidence paneelis.
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Right panel */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="mb-2 text-sm font-semibold">Help (“?”)</div>
            <p className="text-sm text-gray-600">
              Kureeritud abi + AI assist (no-fabricate): selgitused, checklist ja
              näidissõnastus.
            </p>
            <button
              onClick={() => console.info('Open HelpPopover')}
              className="mt-2 text-xs underline underline-offset-2 text-gray-700"
            >
              Open helper
            </button>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <div className="mb-2 text-sm font-semibold">Evidence</div>
            <ul className="space-y-2">
              {evidence.length === 0 && (
                <li className="text-sm text-gray-500">No evidence yet.</li>
              )}
              {evidence.map((ev) => (
                <li key={ev.id} className="text-sm">
                  • {ev.kind.toUpperCase()} – {ev.path_or_url}
                </li>
              ))}
            </ul>
            <button
              onClick={() =>
                router.push(
                  `/evidence/upload?project=${encodeURIComponent(
                    project
                  )}&code=${encodeURIComponent(schema.code)}`
                )
              }
              className="mt-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs hover:bg-gray-50"
            >
              Upload / link evidence
            </button>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <div className="mb-2 text-sm font-semibold">Recent activity</div>
            <ul className="space-y-1">
              {audit.slice(0, 5).map((a) => (
                <li key={a.id} className="text-xs text-gray-600">
                  {new Date(a.ts).toLocaleString()} — {a.action}
                </li>
              ))}
              {audit.length === 0 && (
                <li className="text-xs text-gray-500">No changes yet.</li>
              )}
            </ul>
            <button
              onClick={() =>
                router.push(
                  `/audit?project=${encodeURIComponent(
                    project
                  )}&code=${encodeURIComponent(schema.code)}`
                )
              }
              className="mt-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs hover:bg-gray-50"
            >
              Open audit log
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
