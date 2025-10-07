import Link from 'next/link';
import { listSections } from '@/data/vsme';
import React from 'react';

export default function VsmeLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { code?: string };
}) {
  const sections = listSections(); // ['a','b','b1'] koos tiitlitega
  const active = params?.code;     // Parent-layout saab alamsegmendi parameetri

  return (
    <div className="grid grid-cols-[220px_1fr] gap-6">
      <aside className="space-y-2">
        <div className="mb-3 text-sm font-semibold text-slate-500">Sections</div>
        <nav className="space-y-1">
          {sections.map((s) => (
            <Link
              key={s.code}
              href={`/questionnaires/vsme/${s.code}`}
              className={[
                'block rounded-xl border px-3 py-2',
                active === s.code ? 'bg-emerald-50 border-emerald-200' : 'bg-white hover:bg-slate-50',
              ].join(' ')}
            >
              <div className="font-medium">{s.title}</div>
              {s.subtitle && <div className="text-xs text-slate-500">{s.subtitle}</div>}
            </Link>
          ))}
        </nav>
      </aside>

      <main>{children}</main>
    </div>
  );
}
