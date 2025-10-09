'use client';

import React, { useEffect, useMemo, useState } from 'react';
import ProgressRing from '../../../components/vsme/ProgressRing';
import { getProjectId } from '../../../lib/project';

type Scope = 'all'|'basic'|'comp';

type ProgressItem = {
  code: string;
  title: string;
  total: number;
  answered: number;
  percent: number;
};

type ProgressResp = {
  ok: true;
  scope: Scope;
  totals: { totalQuestions: number; answeredQuestions: number; percent: number };
  items: ProgressItem[];
} | { ok: false; error: string };

function Seg({ active, onClick, children }: any) {
  return (
    <button
      onClick={onClick}
      className={
        'px-3 py-1.5 rounded-md text-sm border ' +
        (active ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50')
      }
    >
      {children}
    </button>
  );
}

export default function VsmeIndexPage() {
  const [project, setProject] = useState<string>('');
  const [scope, setScope] = useState<Scope>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ProgressItem[]>([]);
  const [overall, setOverall] = useState<number>(0);

  useEffect(() => {
    setProject(getProjectId());
  }, []);

  useEffect(() => {
    if (!project) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const u = new URL('/api/vsme/progress', window.location.origin);
        u.searchParams.set('projectId', project);
        u.searchParams.set('scope', scope);
        const r = await fetch(u.toString(), { cache: 'no-store' });
        const j: ProgressResp = await r.json();
        if (cancelled) return;
        if (!j.ok) throw new Error((j as any).error || 'Failed to load progress');
        setItems(j.items);
        setOverall(j.totals.percent);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [project, scope]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">VSME report</h1>
          <p className="text-slate-600 mt-1">
            Track overall completion and open each disclosure to fill answers.
          </p>
        </div>
        <ProgressRing value={overall} size={72} stroke={8} />
      </div>

      {/* Segmented filter */}
      <div className="flex items-center gap-2">
        <Seg active={scope === 'all'} onClick={() => setScope('all')}>All</Seg>
        <Seg active={scope === 'basic'} onClick={() => setScope('basic')}>Basic module</Seg>
        <Seg active={scope === 'comp'} onClick={() => setScope('comp')}>Comprehensive module</Seg>

        <div className="ml-auto flex items-center gap-2">
          <a
            href={`/api/vsme/progress?projectId=${encodeURIComponent(project)}&scope=${scope}`}
            target="_blank"
            className="text-sm px-3 py-1.5 border rounded-md text-slate-700 hover:bg-slate-50"
          >
            Open JSON
          </a>
        </div>
      </div>

      {error && (
        <div className="border border-rose-200 bg-rose-50 text-rose-700 rounded-md p-3 text-sm">
          {error}
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(it => (
          <a
            key={it.code}
            href={`/questionnaires/vsme/${it.code}`}
            className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
          >
            <div>
              <div className="text-sm text-gray-500">{it.code.toUpperCase()}</div>
              <div className="text-base font-medium">{it.title}</div>
              <div className="text-slate-600 text-sm mt-1">
                {it.percent}% — {it.answered}/{it.total} answered
              </div>
            </div>
            <ProgressRing value={it.percent} size={56} stroke={6} />
          </a>
        ))}
      </div>

      {!loading && items.length === 0 && (
        <div className="text-slate-500">No sections in this filter.</div>
      )}
    </div>
  );
}
