'use client';

import { useEffect, useMemo, useState } from 'react';
import { addAudit } from '@/lib/audit';
import { getProjectId, onProjectChange } from '@/lib/project';

type B1 = {
  suppliers?: number | string;
  water_m3?: number | string;
  waste_t?: number | string;
  target_year?: number | string;
  notes?: string;
};

export default function VsmeB1Page() {
  const [form, setForm] = useState<B1>({});
  const [busy, setBusy] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const projectId = useMemo(() => getProjectId(), []);

  // laadime esmane draft/cdm
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const url = `/api/cdm/get?projectId=${encodeURIComponent(projectId)}&sectionCode=b1`;
        const res = await fetch(url);
        const json = await res.json();
        if (!alive) return;
        if (json?.ok && json?.data) {
          const initial = json.data.draft ?? json.data.cdm ?? {};
          setForm(initial);
        }
      } catch (e) {
        // no-op
      }
    })();
    return () => {
      alive = false;
    };
  }, [projectId]);

  // projekti valiku muutus → reload
  useEffect(() => {
    const dispose = onProjectChange(() => location.reload());
    return dispose;
  }, []);

  const onChange =
    (key: keyof B1) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      // audit: välja muutus (väike, kuid kasulik)
      addAudit('field', 'vsme:b1', { key, value: (e.target as HTMLInputElement).value });
    };

  async function save(kind: 'draft' | 'final') {
    if (busy) return;
    setBusy(true);
    try {
      const body: any = { projectId, sectionCode: 'b1' };
      if (kind === 'draft') body.draft = form;
      else body.cdm = form;

      const res = await fetch('/api/cdm/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || `Save ${kind} failed`);
      }
      setLastSaved(new Date().toLocaleTimeString());
      addAudit('save', 'vsme:b1', { kind });
    } catch (e) {
      alert((e as Error).message);
      addAudit('error', 'vsme:b1', { at: 'save', message: String(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Section B1 (dynamic)</h1>
        <div className="text-sm text-slate-500">
          {lastSaved ? <>Saved · {lastSaved}</> : 'Not saved yet'}
        </div>
      </div>

      {/* suppliers */}
      <label htmlFor="suppliers" className="block">
        <span className="text-sm text-slate-600">Suppliers (count)</span>
        <input
          id="suppliers"
          name="suppliers"
          type="number"
          inputMode="numeric"
          className="w-full rounded-xl border p-2"
          placeholder="e.g. 35"
          value={form.suppliers ?? ''}
          onChange={onChange('suppliers')}
        />
      </label>

      {/* water */}
      <label htmlFor="water_m3" className="block">
        <span className="text-sm text-slate-600">Water (m³/year)</span>
        <div className="relative">
          <input
            id="water_m3"
            name="water_m3"
            type="number"
            inputMode="numeric"
            className="w-full rounded-xl border p-2 pr-12"
            placeholder="e.g. 2000"
            value={form.water_m3 ?? ''}
            onChange={onChange('water_m3')}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
            m³/yr
          </span>
        </div>
      </label>

      {/* waste */}
      <label htmlFor="waste_t" className="block">
        <span className="text-sm text-slate-600">Waste (t/year)</span>
        <div className="relative">
          <input
            id="waste_t"
            name="waste_t"
            type="number"
            inputMode="numeric"
            className="w-full rounded-xl border p-2 pr-10"
            placeholder="e.g. 35"
            value={form.waste_t ?? ''}
            onChange={onChange('waste_t')}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
            t/yr
          </span>
        </div>
      </label>

      {/* target year */}
      <label htmlFor="target_year" className="block">
        <span className="text-sm text-slate-600">ESG target year</span>
        <input
          id="target_year"
          name="target_year"
          type="number"
          inputMode="numeric"
          className="w-full rounded-xl border p-2"
          placeholder="e.g. 2027"
          value={form.target_year ?? ''}
          onChange={onChange('target_year')}
        />
      </label>

      {/* notes */}
      <label htmlFor="notes" className="block space-y-1">
        <span className="text-sm text-slate-600">Notes</span>
        <textarea
          id="notes"
          name="notes"
          className="w-full rounded-xl border p-2"
          rows={4}
          placeholder="Optional notes…"
          value={form.notes ?? ''}
          onChange={onChange('notes')}
        />
      </label>

      <div className="flex gap-3">
        <button
          onClick={() => save('draft')}
          disabled={busy}
          className="px-4 py-2 rounded-lg bg-slate-900 text-white disabled:opacity-50"
        >
          Save draft
        </button>
        <button
          onClick={() => save('final')}
          disabled={busy}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-50"
        >
          Save final
        </button>
      </div>
    </div>
  );
}
