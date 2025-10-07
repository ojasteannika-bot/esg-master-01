'use client';
import { useEffect, useMemo, useState } from 'react';

type B1 = {
  suppliers?: number | string;
  water?: number | string;
  waste?: number | string;
  target_year?: number | string;
  notes?: string;
};

const PROJECT_ID = 'demo-project-01';
const SECTION_CODE = 'b1';

export default function VsmeB1Page() {
  const [form, setForm] = useState<B1>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<'draft' | 'final' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // kui see leht on dünaamilise route’iga, näitame pealkirja koodist
  const title = useMemo(() => `Section ${SECTION_CODE.toUpperCase()} (dynamic)`, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const url = `/api/cdm/get?projectId=${encodeURIComponent(PROJECT_ID)}&sectionCode=${encodeURIComponent(SECTION_CODE)}`;
        const res = await fetch(url, { cache: 'no-store' });
        // kui server vastab mitte-JSON-iga (nt HTML vealeht), väldi .json() crash’i
        const text = await res.text();
        try {
          const json = JSON.parse(text);
          if (json?.ok && json?.data) {
            const initial = json.data.draft ?? json.data.cdm ?? {};
            setForm(initial);
          }
        } catch {
          console.warn('Non-JSON response from /api/cdm/get:', text.slice(0, 200));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChange =
    (key: keyof B1) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  async function logAudit(kind: 'save_draft' | 'save_final') {
    try {
      await fetch('/api/audit/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: PROJECT_ID,
          type: kind,
          ctx: `questionnaires:${SECTION_CODE}`,
          data: form,
          ts: new Date().toISOString(),
        }),
      });
    } catch (e) {
      console.warn('audit log failed', e);
    }
  }

  async function save(kind: 'draft' | 'final') {
    try {
      setSaving(kind);
      setMessage(null);
      const body =
        kind === 'draft'
          ? { projectId: PROJECT_ID, sectionCode: SECTION_CODE, draft: form }
          : { projectId: PROJECT_ID, sectionCode: SECTION_CODE, cdm: form };

      const res = await fetch('/api/cdm/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const text = await res.text();
      let ok = false;
      try {
        const json = JSON.parse(text);
        ok = !!json?.ok;
      } catch {
        console.warn('Non-JSON response from /api/cdm/upsert:', text.slice(0, 200));
      }

      if (ok) {
        setMessage(kind === 'draft' ? 'Draft saved' : 'Final saved');
        await logAudit(kind === 'draft' ? 'save_draft' : 'save_final');
      } else {
        setMessage('Save failed');
      }
    } catch (e) {
      console.error(e);
      setMessage('Save failed');
    } finally {
      setSaving(null);
      setTimeout(() => setMessage(null), 3000);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{title}</h1>

      {loading && <div className="text-slate-500">Loading…</div>}
      {message && <div className="rounded-lg bg-emerald-50 text-emerald-700 px-3 py-2 w-fit">{message}</div>}

      <label className="block">
        <span>Suppliers (count)</span>
        <input
          className="w-full border rounded-xl p-2"
          inputMode="numeric"
          value={form.suppliers ?? ''}
          onChange={onChange('suppliers')}
        />
      </label>

      <label className="block">
        <span>Water (m³/year)</span>
        <input
          className="w-full border rounded-xl p-2"
          inputMode="numeric"
          value={form.water ?? ''}
          onChange={onChange('water')}
        />
      </label>

      <label className="block">
        <span>Waste (t/year)</span>
        <input
          className="w-full border rounded-xl p-2"
          inputMode="numeric"
          value={form.waste ?? ''}
          onChange={onChange('waste')}
        />
      </label>

      <label className="block">
        <span>ESG target year</span>
        <input
          className="w-full border rounded-xl p-2"
          inputMode="numeric"
          value={form.target_year ?? ''}
          onChange={onChange('target_year')}
        />
      </label>

      <label className="block">
        <span>Notes</span>
        <textarea
          className="w-full border rounded-xl p-2"
          rows={4}
          value={form.notes ?? ''}
          onChange={onChange('notes')}
        />
      </label>

      <div className="flex gap-3">
        <button
          onClick={() => save('draft')}
          disabled={saving !== null}
          className="px-4 py-2 rounded-lg bg-slate-900 text-white disabled:opacity-50"
        >
          {saving === 'draft' ? 'Saving…' : 'Save draft'}
        </button>
        <button
          onClick={() => save('final')}
          disabled={saving !== null}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-50"
        >
          {saving === 'final' ? 'Saving…' : 'Save final'}
        </button>
      </div>
    </div>
  );
}
