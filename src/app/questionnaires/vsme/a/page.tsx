'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { loadJSON, saveJSON } from '@/lib/storage';

type FormA = {
  company: string;
  employees: string;
  energy_kwh: string;
  scope1: string;
  ren_pct: string;
  policy: '' | 'yes' | 'no';
};

const KEY = 'vsme:A';

export default function Page() {
  const [form, setForm] = useState<FormA>(
    loadJSON<FormA>(KEY, {
      company: '',
      employees: '',
      energy_kwh: '',
      scope1: '',
      ren_pct: '',
      policy: '',
    })
  );

  useEffect(() => {
    saveJSON(KEY, form);
  }, [form]);

  const handle =
    (key: keyof FormA) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const score = useMemo(() => {
    let s = 0;
    if (Number(form.employees) >= 1) s += 10;
    if (Number(form.energy_kwh) > 0) s += 20;
    if (Number(form.scope1) >= 0) s += 20;
    if (Number(form.ren_pct) > 0) s += 20;
    if (form.policy === 'yes') s += 30;
    return Math.min(100, s);
  }, [form]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Section A</h1>

      <label className="block">Company name
        <input className="w-full border rounded-xl p-2"
               value={form.company} onChange={handle('company')} />
      </label>

      <label className="block">Employees
        <input className="w-full border rounded-xl p-2"
               value={form.employees} onChange={handle('employees')} />
      </label>

      <label className="block">Energy (kWh)
        <input className="w-full border rounded-xl p-2"
               value={form.energy_kwh} onChange={handle('energy_kwh')} />
      </label>

      <label className="block">Scope 1 (tCO₂e)
        <input className="w-full border rounded-xl p-2"
               value={form.scope1} onChange={handle('scope1')} />
      </label>

      <label className="block">Renewables %
        <input className="w-full border rounded-xl p-2"
               value={form.ren_pct} onChange={handle('ren_pct')} />
      </label>

      <label className="block">ESG policy in place?
        <select className="w-full border rounded-xl p-2"
                value={form.policy} onChange={handle('policy')}>
          <option value="">—</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </label>

      <div className="mt-4">
        <div className="h-2 bg-[#EEE] rounded-full overflow-hidden">
          <div className="h-2 bg-[#3CBCA3]" style={{ width: `${score}%` }} />
        </div>
        <div className="text-sm mt-1">Score: {score}%</div>
      </div>

      <div className="flex gap-2">
        <Link href="/questionnaires"
              className="px-3 py-2 rounded-xl border">← Back</Link>
        <div className="flex-1" />
        <Link href="/questionnaires/vsme/b"
              className="px-3 py-2 rounded-xl bg-emerald-600 text-white">Next →</Link>
      </div>
    </div>
  );
}
