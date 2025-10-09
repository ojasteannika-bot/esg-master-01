// src/components/ProgressBar.tsx
'use client';
import * as React from 'react';

export default function ProgressBar(props: { final?: number; draft?: number; total?: number }) {
  const final = props.final ?? 0;
  const draft = props.draft ?? 0;
  const total = props.total ?? 0;
  const pct = total > 0 ? Math.round((final / total) * 100) : 0;

  return (
    <div className="w-full">
      <div className="h-2 w-full rounded bg-gray-200">
        <div
          className="h-2 rounded bg-gray-900 transition-all"
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-gray-600">
        {pct}% — Final {final} / Total {total} (Draft {draft})
      </div>
    </div>
  );
}
