// src/components/vsme/ProgressBadge.tsx
'use client';

import { useEffect, useState } from 'react';

type Props = { project: string; section: string };

export function ProgressBadge({ project, section }: Props) {
  const [completed, setCompleted] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const res = await fetch(
          `/api/vsme/progress?project=${encodeURIComponent(project)}&section=${encodeURIComponent(section)}`,
          { cache: 'no-store' }
        );
        if (!res.ok) return;
        const j = await res.json();
        if (!on) return;
        setCompleted(Number(j.completed ?? 0));
        setTotal(Number(j.total ?? 0));
      } catch {
        /* MVP: ignore */
      }
    })();
    return () => {
      on = false;
    };
  }, [project, section]);

  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        border: '1px solid #e5e7eb',
        borderRadius: 999,
        padding: '4px 10px',
        fontSize: 12,
      }}
    >
      <span style={{ fontWeight: 600 }}>{pct}%</span>
      <span style={{ color: '#64748b' }}>
        {completed}/{total}
      </span>
    </span>
  );
}

// Kui kuskil kasutad default-importi, siis eemalda see kommentaar ja hoia mõlemad ekspordid korraks koos:
// export default ProgressBadge;
