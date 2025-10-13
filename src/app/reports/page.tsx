import Link from "next/link";
'use client';

import Link from 'next/link';

const MOCK = [
  { id: 'R-2025-001', name: 'Acme OÜ — ESG 2025', updated: '2025-10-02' },
  { id: 'R-2025-002', name: 'Annika Test OÜ — ESG 2025', updated: '2025-10-06' },
];

export default function Page() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <Link
          href="/questionnaires/vsme"
          className="px-3 py-2 rounded-xl bg-emerald-600 text-white"
        >
          New VSME report
        </Link>
      </div>

      <div className="space-y-3">
        {MOCK.map(r => (
          <div key={r.id} className="border rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{r.name}</div>
              <div className="text-sm text-slate-600">Last edited: {r.updated}</div>
            </div>
            <Link className="px-3 py-1 rounded border" href={`/reports/${r.id}`}>
              Open
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
