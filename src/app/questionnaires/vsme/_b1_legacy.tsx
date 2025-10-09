'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import VsmeForm, { type VsmeSection } from '../../../../components/VsmeForm';
import LoadingButton from '../../../../components/LoadingButton';
import { getProjectId, onProjectChange } from '../../../../lib/project';
import { logAudit } from '../../../../lib/audit';
import { useDebouncedEffect } from '../../../../lib/useDebouncedEffect';
import { toast } from '../../../../lib/toast';

type B1Draft = {
  suppliers?: number | null;
  water_m3?: number | null;
  waste_t?: number | null;
  target_year?: number | null;
  notes?: string | null;
};

const SECTION_DEF: VsmeSection = {
  code: 'b1',
  fields: [
    { key: 'suppliers',   label: 'Suppliers (count)', type: 'number',  placeholder: 'e.g. 35',       colSpan: 6 },
    { key: 'water_m3',    label: 'Water (m³/year)',   type: 'number',  placeholder: 'e.g. 2000',     suffix: 'm³/yr', colSpan: 6 },
    { key: 'waste_t',     label: 'Waste (t/year)',    type: 'number',  placeholder: 'e.g. 35',       suffix: 't/yr',  colSpan: 6 },
    { key: 'target_year', label: 'ESG target year',   type: 'number',  placeholder: 'e.g. 2027',     colSpan: 6 },
    { key: 'notes',       label: 'Notes',             type: 'textarea', placeholder: 'Optional notes…', colSpan: 12 },
  ],
};

export default function B1Page() {
  const [project, setProject] = useState<string>(getProjectId());
  const [form, setForm] = useState<B1Draft>({});
  const [busy, setBusy] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [autosave, setAutosave] = useState(true);
  const dirtyRef = useRef(false);

  // hoia initial snapshot võrdluseks
  const initialRef = useRef<string>(JSON.stringify(form));

  // reageeri projektivahetusele
  useEffect(() => {
    const off = onProjectChange((id) => setProject(id));
    return () => off();
  }, []);

  // lae olemasolev draft
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setBusy(true);
        const u = new URL('/api/cdm/get', window.location.origin);
        u.searchParams.set('projectId', project);
        u.searchParams.set('sectionCode', SECTION_DEF.code);

        const res = await fetch(u.toString(), { cache: 'no-store' });
        const json = await res.json();
        if (!cancelled && json?.ok) {
          const next = json.data ?? {};
          setForm(next);
          initialRef.current = JSON.stringify(next);
          dirtyRef.current = false;
        }
      } catch {
        // no-op
      } finally {
        if (!cancelled) setBusy(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [project]);

  // enne lehelt lahkumist hoiata, kui dirty
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // field-change logi + state uuendus
  function onFormChange(next: B1Draft, key?: string, value?: any) {
    setForm(next);
    const nowStr = JSON.stringify(next);
    dirtyRef.current = nowStr !== initialRef.current;

    if (key) {
      logAudit({
        project_id: project,
        type: 'field',
        ctx: `vsme:${SECTION_DEF.code}`,
        data: { key, value },
      }).catch(() => {});
    }
  }

  // debounced autosave (draft)
  useDebouncedEffect(
    () => {
      if (!autosave) return;
      if (!dirtyRef.current) return;
      (async () => {
        try {
          const res = await fetch('/api/cdm/upsert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId: project,
              sectionCode: SECTION_DEF.code,
              draft: form, // ← salvestame drafti
            }),
          });
          const j = await res.json();
          if (j?.ok) {
            initialRef.current = JSON.stringify(form);
            dirtyRef.current = false;
            setLastSavedAt(new Date().toISOString());
            toast('Autosaved ✔', 'success', 1500);
          }
        } catch {
          // vaikne – ei spämmi kasutajat
        }
      })();
    },
    [form, project, autosave],
    1200
  );

  const save = async (mode: 'draft' | 'final') => {
    try {
      setBusy(true);

      await logAudit({
        project_id: project,
        type: 'save',
        ctx: `vsme:${SECTION_DEF.code}`,
        data: { mode },
      });

      const res = await fetch('/api/cdm/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project,
          sectionCode: SECTION_DEF.code,
          draft: mode === 'draft' ? form : undefined,
          cdm: mode === 'final' ? form : undefined,
        }),
      });

      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error || 'Save failed');

      initialRef.current = JSON.stringify(form);
      dirtyRef.current = false;
      setLastSavedAt(new Date().toISOString());
      toast(mode === 'final' ? 'Final saved ✔' : 'Draft saved ✔', 'success');
    } catch (err) {
      await logAudit({
        project_id: project,
        type: 'error',
        ctx: `vsme:${SECTION_DEF.code}`,
        data: { message: (err as Error)?.message ?? 'Save error' },
      });
      toast('Save failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  const savedInfo = useMemo(() => {
    if (!lastSavedAt) return 'Not saved yet';
    const d = new Date(lastSavedAt);
    return `Saved · ${d.toLocaleTimeString()}`;
  }, [lastSavedAt]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Section B1 (dynamic)</h1>
        <div className="flex items-center gap-4">
          <label className="text-sm inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={autosave}
              onChange={(e) => setAutosave(e.target.checked)}
            />
            Autosave
          </label>
          <span className="text-sm text-slate-600">{savedInfo}</span>
        </div>
      </div>

      <p className="text-slate-600">Core operational metrics for VSME reporting.</p>

      <VsmeForm
        section={SECTION_DEF}
        value={form}
        onChange={onFormChange}
        disabled={busy}
      />

      <div className="mt-4 flex gap-3">
        <LoadingButton
          variant="ghost"
          loading={busy}
          onClick={() => save('draft')}
        >
          Save draft
        </LoadingButton>

        <LoadingButton
          variant="primary"
          loading={busy}
          onClick={() => save('final')}
        >
          Save final
        </LoadingButton>
      </div>
    </div>
  );
}
