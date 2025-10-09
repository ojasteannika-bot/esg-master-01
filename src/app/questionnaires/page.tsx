'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import { getProjectId, onProjectChange } from '../../lib/project';

type StatusRow = {
  section_code: string;
  has_final: boolean;
  has_draft: boolean;
  created_at: string;
  updated_at: string;
};

const SECTIONS = [
  { code: 'a',  title: 'Section A',  desc: 'Company basics (demo)' },
  { code: 'b',  title: 'Section B',  desc: 'Environmental (demo)' },
  { code: 'b1', title: 'Section B1', desc: 'Operational metrics (demo)' },
];

export default function QuestionnairesIndex() {
  const [project, setProject] = useState<string>(getProjectId());
  const [rows, setRows] = useState<StatusRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => onProjectChange((id) => setProject(id)), []);

  const map = useMemo(() => {
    const m = new Map<string, StatusRow>();
    for (const r of rows) m.set(r.section_code, r);
    return m;
  }, [rows]);

  async function load() {
    if (!project) return;
    setLoading(true);
    try {
      const u = new URL('/api/cdm/status', window.location.origin);
      u.searchParams.set('projectId', project);
      const res = await fetch(u.toString(), { cache: 'no-store' });
      const json = await res.json();
      setRows(json?.data ?? []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [project]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Questionnaires</h1>
        <button
          onClick={load}
          className="px-4 py-2 rounded-lg bg-slate-900 text-white disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SECTIONS.map((s) => {
          const st = map.get(s.code);
          const ok = st?.has_final;
          const draft = !ok && st?.has_draft;
          const badge = ok ? 'FINAL' : draft ? 'DRAFT' : 'EMPTY';
          const badgeClass = ok
            ? 'bg-emerald-600 text-white'
            : draft
            ? 'bg-amber-500 text-black'
            : 'bg-slate-200 text-slate-700';

          return (
            <Link
              key={s.code}
              href={`/questionnaires/vsme/${s.code}`}
              className="block rounded-xl border shadow-card hover:shadow-card-hover transition-shadow p-4"
            >
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">{s.title}</div>
                <span className={`text-xs px-2 py-1 rounded ${badgeClass}`}>{badge}</span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{s.desc}</p>
              <div className="mt-3 text-xs text-slate-500">
                {st?.updated_at ? (
                  <>Updated: {new Date(st.updated_at).toLocaleString()}</>
                ) : (
                  <>No data yet</>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
