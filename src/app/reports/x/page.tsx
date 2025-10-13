import Link from "next/link";
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { loadJSON } from '@/lib/storage';

type A = { company?: string; employees?: string; energy_kwh?: string; scope1?: string; ren_pct?: string; policy?: string; };
type B = { suppliers?: string; water_m3?: string; waste_t?: string; target_year?: string; notes?: string; };

function computeScore(a: Partial<A>, b: Partial<B>) {
  let s = 0;
  if (Number(a.employees) >= 1) s += 10;
  if (Number(a.energy_kwh) > 0) s += 20;
  if ((a.scope1 ?? '') !== '') s += 20;
  if ((a.ren_pct ?? '') !== '') s += 20;
  if (a.policy === 'yes') s += 30;
  return Math.min(100, s);
}

export default function Page() {
  const a = loadJSON<A>('wizard:A', {});
  const b = loadJSON<B>('wizard:B', {});
  const score = useMemo(() => computeScore(a, b), [a, b]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/reports" className="px-3 py-1 rounded border">&larr; Back</Link>
        <h1 className="text-2xl font-semibold">Report X (preview)</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-2xl p-5 space-y-3">
          <div className="font-medium">Governance / Company</div>
          <div className="text-sm text-slate-600">Company: {a.company ?? '—'}</div>
          <div className="text-sm text-slate-600">Employees: {a.employees ?? '—'}</div>
          <div className="text-sm text-slate-600">Policy: {a.policy ?? '—'}</div>
        </div>

        <div className="bg-white border rounded-2xl p-5 space-y-3">
          <div className="font-medium">Environment</div>
          <div className="text-sm text-slate-600">Energy (kWh): {a.energy_kwh ?? '—'}</div>
          <div className="text-sm text-slate-600">Scope 1 (tCO₂e): {a.scope1 ?? '—'}</div>
          <div className="text-sm text-slate-600">Renewables %: {a.ren_pct ?? '—'}</div>
        </div>

        <div className="bg-white border rounded-2xl p-5 space-y-3">
          <div className="font-medium">Supply chain</div>
          <div className="text-sm text-slate-600">Suppliers: {b.suppliers ?? '—'}</div>
          <div className="text-sm text-slate-600">Notes: {b.notes ?? '—'}</div>
        </div>

        <div className="bg-white border rounded-2xl p-5 space-y-3">
          <div className="font-medium">Summary</div>
          <div className="text-sm text-slate-600 mb-1">Score</div>
          <div className="h-2 bg-[#EEE] rounded-full overflow-hidden">
            <div className="h-2 bg-[#3CBCA3]" style={{ width: `${score}%` }} />
          </div>
          <div className="text-sm text-slate-600">{score}%</div>
        </div>
      </div>
    </div>
  );
}
