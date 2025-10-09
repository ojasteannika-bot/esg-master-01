'use client';

import React from 'react';

type Props = {
  code: string;
};

export default function StatsBadge({ code }: Props) {
  const [label, setLabel] = React.useState<'EMPTY' | 'FINAL' | '…'>('…');

  React.useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const projectId =
          typeof window !== 'undefined'
            ? window.localStorage.getItem('projectId') || 'client-test1'
            : 'client-test1';

        const res = await fetch(
          `/api/vsme/section-stats?code=${encodeURIComponent(code)}&projectId=${encodeURIComponent(
            projectId,
          )}`,
          { cache: 'no-store' },
        );
        const json = await res.json();
        if (cancelled) return;

        if (json?.ok) {
          setLabel(json.status === 'final' ? 'FINAL' : 'EMPTY');
        } else {
          setLabel('EMPTY');
        }
      } catch {
        if (!cancelled) setLabel('EMPTY');
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [code]);

  const cls =
    label === 'FINAL'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : label === 'EMPTY'
      ? 'bg-slate-100 text-slate-700 border-slate-200'
      : 'bg-slate-50 text-slate-500 border-slate-200';

  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs ${cls}`}>
      {label}
    </span>
  );
}
