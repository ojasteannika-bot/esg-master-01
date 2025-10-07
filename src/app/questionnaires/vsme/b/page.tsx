'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadJSON, saveJSON } from '@/lib/storage';

type FormB = {
  suppliers: string;
  water_m3: string;
  waste_t: string;
  target_year: string;
  notes: string;
};

const KEY = 'vsme:B';

export default function Page() {
  const [form, setForm] = useState<FormB>(
    loadJSON<FormB>(KEY, {
      suppliers: '',
      water_m3: '',
      waste_t: '',
      target_year: '',
      notes: '',
    })
  );

  useEffect(() => {
    saveJSON(KEY, form);
  }, [form]);

  const handle =
    (key: keyof FormB) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Section B</h1>

      <label className="block">Suppliers (count)
        <input className="w-full border rounded-xl p-2"
               value={form.suppliers} onChange={handle('suppliers')} />
      </label>

      <label className="block">Water (m³/year)
        <input className="w-full border rounded-xl p-2"
               value={form.water_m3} onChange={handle('water_m3')} />
      </label>

      <label className="block">Waste (t/year)
        <input className="w-full border rounded-xl p-2"
               value={form.waste_t} onChange={handle('waste_t')} />
      </label>

      <label className="block">ESG target year
        <input className="w-full border rounded-xl p-2"
               value={form.target_year} onChange={handle('target_year')} />
      </label>

      <label className="block">Notes
        <textarea className="w-full border rounded-xl p-2"
                  rows={4} value={form.notes} onChange={handle('notes')} />
      </label>

      <div className="flex gap-2">
        <Link href="/questionnaires/vsme/a"
              className="px-3 py-2 rounded-xl border">← Prev</Link>
        <div className="flex-1" />
        <Link href="/questionnaires"
              className="px-3 py-2 rounded-xl bg-emerald-600 text-white">Finish</Link>
      </div>
    </div>
  );
}
