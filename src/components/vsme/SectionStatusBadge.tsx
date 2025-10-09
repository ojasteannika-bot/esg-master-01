'use client';

import React from 'react';
import { getProjectId, onProjectChange } from '@/lib/project';

export default function SectionStatusBadge({ code }: { code: string }) {
  const [pct, setPct] = React.useState<number | null>(null);

  const load = React.useCallback(async () => {
    const projectId = getProjectId();
    try {
      const res = await fetch(
        `/api/vsme/section-stats?projectId=${encodeURIComponent(projectId)}`,
        { cache: 'no-store' }
      );
      const j = await res.json();
      setPct(j?.stats?.[code]?.percent ?? 0);
    } catch {
      setPct(null);
    }
  }, [code]);

  React.useEffect(() => {
    load();
    const off = onProjectChange(() => load());
    return () => off();
  }, [load]);

  if (pct == null) return null;

  const label = pct >= 100 ? 'FINAL' : pct > 0 ? `${pct}%` : 'EMPTY';
  const cls =
    pct >= 100
      ? 'bg-green-600 text-white'
      : pct > 0
      ? 'bg-amber-500 text-white'
      : 'bg-slate-200 text-slate-700';

  return <span className={`text-xs px-2 py-0.5 rounded ${cls}`}>{label}</span>;
}
