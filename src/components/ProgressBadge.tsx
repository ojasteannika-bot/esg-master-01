'use client';
import { useEffect, useState } from 'react';

type Row = { code: string; percent: number };

export default function ProgressBadge({
  project,
  code,
}: {
  project: string;
  code: string;
}) {
  const [pct, setPct] = useState<number | null>(null);

  useEffect(() => {
    let off = false;
    const url = `/api/cdm/progress?project=${encodeURIComponent(project)}`;
    fetch(url)
      .then((r) => r.json())
      .then((j) => {
        if (off) return;
        const row = (j.sections as Row[]).find((r) => r.code === code);
        setPct(row ? Math.round(row.percent) : 0);
      })
      .catch(() => setPct(null));
    return () => {
      off = true;
    };
  }, [project, code]);

  if (pct === null) return null;
  return <span className="q-badge">{pct}%</span>;
}
