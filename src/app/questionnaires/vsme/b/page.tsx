'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import VsmeForm, { type VsmeSection } from '../../../../components/VsmeForm';
import LoadingButton from '../../../../components/LoadingButton';
import { getProjectId, onProjectChange } from '../../../../lib/project';
import { logAudit } from '../../../../lib/audit';
import { useDebouncedEffect } from '../../../../lib/useDebouncedEffect';
import { toast } from '../../../../lib/toast';

type BForm = {
  energy_kwh?: number | null;
  co2_t?: number | null;
  renewables_pct?: number | null;
  notes?: string | null;
};

const SECTION_DEF: VsmeSection = {
  code: 'b',
  fields: [
    { key: 'energy_kwh',     label: 'Energy use (kWh/year)', type: 'number', placeholder: 'e.g. 120000', colSpan: 6 },
    { key: 'co2_t',          label: 'CO₂ emissions (t/year)', type: 'number', placeholder: 'e.g. 45', colSpan: 6 },
    { key: 'renewables_pct', label: 'Renewables (%)', type: 'number', placeholder: 'e.g. 35', suffix: '%', colSpan: 6 },
    { key: 'notes',          label: 'Notes', type: 'textarea', placeholder: 'Optional…', colSpan: 12 },
  ],
};

export default function BPage() {
  const [project, setProject] = useState<string>(getProjectId());
  const [form, setForm] = useState<BForm>({});
  const [busy, setBusy] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [autosave, setAutosave] = useState(true);
  const dirtyRef = useRef(false);
  const initialRef = useRef<string>(JSON.stringify(form));

  useEffect(() => onProjectChange((id) => setProject(id)), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setBusy(true);
        const u = new URL('/api/cdm/get', window.location.origin);
        u.searchParams.set('projectId', project);
        u.searchParams.set('sectionCode', SECTION_DEF.code);
        const r = await fetch(u.toString(), { cache: 'no-store' });
        const j = await r.json();
        if (!cancelled && j?.ok) {
          const next = j.data ?? {};
          setForm(next);
          initialRef.current = JSON.stringify(next);
          dirtyRef.current = false;
        }
      } catch {} finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => { cancelled = true; };
  }, [project]);

  useEffect(() => {
    const onLeave = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', onLeave);
    return () => window.removeEventListener('beforeunload', onLeave);
  }, []);

  function onFormChange(next: BForm, key?: string, value?: any) {
    setForm(next);
    dirtyRef.current = JSON.stringify(next) !== initialRef.current;
    if (key) {
      logAudit({ project_id: project, type: 'field', ctx: 'vsme:b', data: { key, value } })
        .catch(() => {});
    }
  }

  useDebouncedEffect(() => {
    if (!autosave || !dirtyRef.current) return;
    (async () => {
      try {
        const r = await fetch('/api/cdm/upsert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId: project, sectionCode: 'b', draft: form }),
        });
        const j = await r.json();
        if (j?.ok) {
          initialRef.current = JSON.stringify(form);
          dirtyRef.current = false;
          setLastSavedAt(new Date().toISOString());
          toast('Autosaved ✔', 'success', 1200);
        }
      } catch {}
    })();
  }, [form, project, autosave], 1200);

  async function save(mode: 'draft' | 'final') {
    try {
      setBusy(true);
      await logAudit({ project_id: project, type: 'save', ctx: 'vsme:b', data: { mode } });
      const r = await fetch('/api/cdm/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project,
          sectionCode: 'b',
          draft: mode === 'draft' ? form : undefined,
          cdm: mode === 'final' ? form : undefined,
        }),
      });
      const j = await r.json();
      if (!j?.ok) throw new Error(j?.error || 'Save failed');
      initialRef.current = JSON.stringify(form);
      dirtyRef.current = false;
      setLastSavedAt(new Date().toISOString());
      toast(mode === 'final' ? 'Final saved ✔' : 'Draft saved ✔', 'success');
    } catch (e: any) {
      toast('Save failed: ' + (e?.message ?? 'error'), 'error');
      await logAudit({ project_id: project, type: 'error', ctx: 'vsme:b', data: { message: String(e?.message || e) } });
    } finally {
      setBusy(false);
    }
  }

  const savedInfo = useMemo(() => lastSavedAt ? `Saved · ${new Date(lastSavedAt).toLocaleTimeString()}` : 'Not saved yet', [lastSavedAt]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Section B</h1>
        <div className="flex items-center gap-4">
          <label className="text-sm inline-flex items-center gap-2">
            <input type="checkbox" checked={autosave} onChange={(e) => setAutosave(e.target.checked)} />
            Autosave
          </label>
          <span className="text-sm text-slate-600">{savedInfo}</span>
        </div>
      </div>

      <VsmeForm section={SECTION_DEF} value={form} onChange={onFormChange} disabled={busy} />

      <div className="mt-4 flex gap-3">
        <LoadingButton variant="ghost" loading={busy} onClick={() => save('draft')}>Save draft</LoadingButton>
        <LoadingButton variant="primary" loading={busy} onClick={() => save('final')}>Save final</LoadingButton>
      </div>
    </div>
  );
}
