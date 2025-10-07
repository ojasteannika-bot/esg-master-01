'use client';

import { useEffect, useMemo, useState } from 'react';
import { loadJSON, saveJSON } from '@/lib/storage';
import { logAudit } from '@/lib/audit';

type Step = 'A' | 'B';

type Form = {
  // Section A
  company: string;
  employees: string;        // number-as-string on lihtsam sisendites
  energy_kwh: string;       // number-as-string
  scope1: string;           // number-as-string (tCO2e)
  renewables: string;       // number-as-string (%)
  policy: 'Yes' | 'No' | '';

  // Section B
  suppliers: string;        // number-as-string
  water_m3: string;         // number-as-string
  waste_t: string;          // number-as-string
  esg_target_year: string;  // year-as-string
  notes: string;
};

const STORAGE_KEY = 'wizard:form:v1';
const PROJECT_ID = 'demo-project-01';

const A_DEFAULTS: Form = {
  company: '',
  employees: '',
  energy_kwh: '',
  scope1: '',
  renewables: '',
  policy: '',
  suppliers: '',
  water_m3: '',
  waste_t: '',
  esg_target_year: '',
  notes: '',
};

export default function WizardPage() {
  const [step, setStep] = useState<Step>('A');
  const [form, setForm] = useState<Form>(A_DEFAULTS);

  // laadime / salvestame lokaalselt
  useEffect(() => {
    const initial = loadJSON<Form>(STORAGE_KEY, A_DEFAULTS);
    setForm(initial);
  }, []);

  useEffect(() => {
    // salvestame igal muudatusel
    saveJSON(STORAGE_KEY, form);
  }, [form]);

  // esmane audit “view open”
  useEffect(() => {
    logAudit('nav', 'wizard', { from: 'init', to: 'A', project: PROJECT_ID });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setStepWithAudit(next: Step) {
    const prev = step;
    setStep(next);
    logAudit('nav', 'wizard', { from: prev, to: next, project: PROJECT_ID });
  }

  // väljade muutmine + audit
  const handle =
    (key: keyof Form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setForm((prev) => {
        const next = { ...prev, [key]: value };
        return next;
      });
      const ctx = step === 'A' ? 'wizard:A' : 'wizard:B';
      logAudit('field', ctx, { key, value, project: PROJECT_ID });
    };

  // lihtne "skoor" demo (samamoodi nagu enne sul protos)
  const scorePct = useMemo(() => {
    const filled = [
      form.company,
      form.employees,
      form.energy_kwh,
      form.scope1,
      form.renewables,
      form.policy,
      form.suppliers,
      form.water_m3,
      form.waste_t,
      form.esg_target_year,
      // notes ei mõjuta
    ].filter((v) => (v ?? '').toString().trim() !== '').length;

    const total = 10;
    const pct = Math.round((filled / total) * 100);
    return Math.max(0, Math.min(100, pct));
  }, [form]);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">ESG-MASTER-01 — VS​ME wizard</h1>
        <nav className="flex gap-3">
          <button
            className={`px-3 py-1 rounded-lg border ${step === 'A' ? 'bg-emerald-600 text-white' : 'bg-white'}`}
            onClick={() => setStepWithAudit('A')}
          >
            Section A
          </button>
          <button
            className={`px-3 py-1 rounded-lg border ${step === 'B' ? 'bg-emerald-600 text-white' : 'bg-white'}`}
            onClick={() => setStepWithAudit('B')}
          >
            Section B
          </button>
        </nav>

        {/* progress */}
        <div className="mt-4">
          <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-2 bg-emerald-600 transition-all"
              style={{ width: `${scorePct}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-slate-600">Score: {scorePct}%</div>
        </div>
      </header>

      {/* SECTION A */}
      {step === 'A' && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Section A</h2>

          <label className="block space-y-1">
            <span className="text-sm text-slate-600">Company name</span>
            <input
              className="w-full rounded-xl border p-2"
              value={form.company}
              onChange={handle('company')}
              placeholder="Annika OÜ"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm text-slate-600">Employees</span>
            <input
              className="w-full rounded-xl border p-2"
              value={form.employees}
              onChange={handle('employees')}
              inputMode="numeric"
              placeholder="35"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm text-slate-600">Energy (kWh)</span>
            <input
              className="w-full rounded-xl border p-2"
              value={form.energy_kwh}
              onChange={handle('energy_kwh')}
              inputMode="numeric"
              placeholder="12000"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm text-slate-600">Scope 1 (tCO₂e)</span>
            <input
              className="w-full rounded-xl border p-2"
              value={form.scope1}
              onChange={handle('scope1')}
              inputMode="numeric"
              placeholder="45"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm text-slate-600">Renewables %</span>
            <input
              className="w-full rounded-xl border p-2"
              value={form.renewables}
              onChange={handle('renewables')}
              inputMode="numeric"
              placeholder="35"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm text-slate-600">ESG policy in place?</span>
            <select
              className="w-full rounded-xl border p-2"
              value={form.policy}
              onChange={handle('policy')}
            >
              <option value="">—</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </label>

          <div className="pt-2 flex items-center justify-between">
            <button
              className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800"
              onClick={() => setStepWithAudit('A')}
              disabled
            >
              ← Prev
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white"
              onClick={() => setStepWithAudit('B')}
            >
              Next →
            </button>
          </div>
        </section>
      )}

      {/* SECTION B */}
      {step === 'B' && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Section B</h2>

          <label className="block space-y-1">
            <span className="text-sm text-slate-600">Suppliers (count)</span>
            <input
              className="w-full rounded-xl border p-2"
              value={form.suppliers}
              onChange={handle('suppliers')}
              inputMode="numeric"
              placeholder="12"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm text-slate-600">Water (m³/year)</span>
            <input
              className="w-full rounded-xl border p-2"
              value={form.water_m3}
              onChange={handle('water_m3')}
              inputMode="numeric"
              placeholder="2000"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm text-slate-600">Waste (t/year)</span>
            <input
              className="w-full rounded-xl border p-2"
              value={form.waste_t}
              onChange={handle('waste_t')}
              inputMode="numeric"
              placeholder="35"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm text-slate-600">ESG target year</span>
            <input
              className="w-full rounded-xl border p-2"
              value={form.esg_target_year}
              onChange={handle('esg_target_year')}
              inputMode="numeric"
              placeholder="2027"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm text-slate-600">Notes</span>
            <textarea
              className="w-full rounded-xl border p-2"
              rows={4}
              value={form.notes}
              onChange={handle('notes')}
              placeholder="Optional notes…"
            />
          </label>

          <div className="pt-2 flex items-center justify-between">
            <button
              className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800"
              onClick={() => setStepWithAudit('A')}
            >
              ← Prev
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white"
              onClick={() => {
                // siia võiks lisada ka submit -> järgmine vaade
                logAudit('nav', 'wizard', { from: 'B', to: 'end', project: PROJECT_ID });
              }}
            >
              Finish
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
