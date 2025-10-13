// src/app/questionnaires/vsme/a/page.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

type AForm = {
  legal_name?: string;
  country?: string;
  employees?: number | null;
  sector?: string;
  notes?: string;
};

const SECTION_CODE = 'A';

function lsKey(project: string) {
  return `vsme:${SECTION_CODE}:${project}`;
}

export default function VsmeASectionPage() {
  const sp = useSearchParams();
  const project = sp.get('project') ?? 'client-test1';

  const [form, setForm] = useState<AForm>({});
  const [busy, setBusy] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [msg, setMsg] = useState<string>('');
  const [autosave, setAutosave] = useState<boolean>(true);

  const initialLoadRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Lae esmane sisu localStorage'ist (MVP)
  useEffect(() => {
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(lsKey(project)) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as { form: AForm; savedAt?: string };
        setForm(parsed?.form ?? {});
        setLastSavedAt(parsed?.savedAt ?? null);
      }
    } catch {
      // ignore
    }
  }, [project]);

  // Debounce autosave
  useEffect(() => {
    if (!autosave) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void saveLocal('draft', false);
    }, 800);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, autosave, project]);

  async function saveLocal(status: 'draft' | 'final', withAudit = true) {
    setBusy(true);
    setMsg('');
    try {
      const savedAt = new Date().toISOString();
      if (typeof window !== 'undefined') {
        localStorage.setItem(lsKey(project), JSON.stringify({ form, savedAt, status }));
      }
      setLastSavedAt(savedAt);

      // logi auditisse (MVP: /api/audit/add)
      if (withAudit) {
        await fetch('/api/audit/add', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            project,
            action: 'vsme.save',
            details: { section: SECTION_CODE, status, savedAt, keys: Object.keys(form ?? {}) },
          }),
        }).catch(() => {});
      }
    } catch (e: any) {
      setMsg(e?.message ?? 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  function clearForm() {
    setForm({});
    setMsg('');
    setLastSavedAt(null);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(lsKey(project));
      }
    } catch {
      // ignore
    }
  }

  const savedInfo = useMemo(() => {
    if (!lastSavedAt) return 'Not saved yet';
    try {
      const d = new Date(lastSavedAt);
      return `Saved: ${d.toLocaleString()}`;
    } catch {
      return `Saved: ${lastSavedAt}`;
    }
  }, [lastSavedAt]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">VSME — Section {SECTION_CODE}</h1>
          <p className="text-sm text-[--color-text-muted]">
            Project: <span className="font-mono">{project}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-[--color-text-muted]">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[--color-border] text-brand-600 focus:ring-brand-200"
              checked={autosave}
              onChange={(e) => setAutosave(e.target.checked)}
            />
            Autosave
          </label>
          <span className="opacity-80">{savedInfo}</span>
        </div>
      </header>

      {msg && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {msg}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label>Legal name</Label>
          <Input
            placeholder="e.g. Annika OÜ"
            value={form.legal_name ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, legal_name: e.target.value }))}
          />
        </div>

        <div>
          <Label>Country</Label>
          <Input
            placeholder="e.g. EE"
            value={form.country ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
          />
        </div>

        <div>
          <Label>Employees (FTE)</Label>
          <Input
            type="number"
            placeholder="e.g. 12"
            value={typeof form.employees === 'number' ? String(form.employees) : ''}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                employees: e.target.value ? Number(e.target.value) : null,
              }))
            }
          />
        </div>

        <div>
          <Label>Sector</Label>
          <Input
            placeholder="e.g. Retail"
            value={form.sector ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))}
          />
        </div>

        <div className="sm:col-span-2">
          <Label>Notes</Label>
          <Textarea
            placeholder="Optional…"
            value={form.notes ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => saveLocal('draft') } className="min-w-[120px]" variant="primary">
          {busy ? 'Saving…' : 'Save draft'}
        </Button>
        <Button onClick={() => saveLocal('final')} className="min-w-[120px]" variant="primary">
          {busy ? 'Saving…' : 'Save final'}
        </Button>
        <Button onClick={clearForm} variant="secondary">
          Clear
        </Button>
      </div>
    </div>
  );
}
