'use client';

import React, {useEffect, useMemo, useState} from 'react';
import type { VsmeSection, VsmeField } from '@/lib/vsme/schema';
import { logAudit } from '@/lib/audit';
import { getProjectId } from '@/lib/project';

type Props = {
  section: VsmeSection;
  initial?: Record<string, any> | null;
};

function FieldControl({ f, value, onChange }: { f: VsmeField; value: any; onChange: (v:any)=>void }) {
  const id = `f_${f.key}`;
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium mb-1">
        {f.label}{' '}
        {f.help && <span title={f.help} className="cursor-help text-slate-400">?</span>}
      </label>

      {f.type === 'number' && (
        <div className="flex items-center gap-2">
          <input
            id={id}
            type="number"
            className="border rounded px-2 py-1 w-40"
            placeholder={f.placeholder}
            value={value ?? ''}
            onChange={(e)=>onChange(e.target.value === '' ? null : Number(e.target.value))}
          />
          {f.suffix && <span className="text-sm text-slate-500">{f.suffix}</span>}
        </div>
      )}

      {f.type === 'textarea' && (
        <textarea
          id={id}
          className="border rounded px-2 py-1 w-full h-28"
          placeholder={f.placeholder}
          value={value ?? ''}
          onChange={(e)=>onChange(e.target.value)}
        />
      )}

      {f.type === 'select' && (
        <select
          id={id}
          className="border rounded px-2 py-1"
          value={value ?? ''}
          onChange={(e)=>onChange(e.target.value)}
        >
          <option value="">— select —</option>
          {(f.options ?? []).map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      )}
    </div>
  );
}

export default function FormRenderer({ section, initial }: Props) {
  const [data, setData] = useState<Record<string, any>>(initial ?? {});
  const [busy, setBusy] = useState(false);
  const projectId = useMemo(() => getProjectId(), []);

  useEffect(() => {
    setData(initial ?? {});
  }, [section.code, initial]);

  const setField = (key: string, v:any) => setData(prev => ({ ...prev, [key]: v }));

  const save = async (kind: 'draft'|'final') => {
    setBusy(true);
    try {
      await fetch('/api/cdm/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          sectionCode: section.code,
          cdm: data,
          draft: (kind === 'draft'),
        }),
      });

      await logAudit({
        project_id: projectId,
        type: 'save',
        ctx: `vsme:${section.code}`,
        data: { mode: kind, keys: Object.keys(data) },
      });

      alert(kind === 'draft' ? 'Draft saved.' : 'Final saved.');
    } catch (e:any) {
      console.error(e);
      alert('Save failed: ' + (e?.message ?? e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="text-slate-600 mb-6">{section.description}</p>

      <div className="grid grid-cols-12 gap-4">
        {section.fields.map(f => (
          <div className={`col-span-${f.colSpan ?? 6}`} key={f.key}>
            <FieldControl
              f={f}
              value={data[f.key]}
              onChange={(v)=>setField(f.key, v)}
            />
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          disabled={busy}
          onClick={() => save('draft')}
          className="px-4 py-2 rounded bg-slate-800 text-white disabled:opacity-50"
        >
          Save draft
        </button>
        <button
          disabled={busy}
          onClick={() => save('final')}
          className="px-4 py-2 rounded bg-emerald-600 text-white disabled:opacity-50"
        >
          Save final
        </button>
      </div>
    </div>
  );
}
