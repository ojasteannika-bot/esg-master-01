'use client';
import { useEffect, useState } from 'react';

export default function ItemStatusChip({
  project, code, statusPrefetched
}: { project: string; code: string; statusPrefetched?: 'draft'|'final' }) {
  const [status, setStatus] = useState<'draft' | 'final'>(statusPrefetched ?? 'draft');

  useEffect(() => {
    if (statusPrefetched) return; // juba teada
    (async () => {
      try {
        const res = await fetch(
          `/api/cdm/item/status?project=${encodeURIComponent(project)}&code=${encodeURIComponent(code)}`,
          { cache: 'no-store' }
        );
        const j = await res.json();
        if (!res.ok || !j?.ok) throw new Error();
        setStatus(j.status === 'final' ? 'final' : 'draft');
      } catch {
        setStatus('draft');
      }
    })();
  }, [project, code, statusPrefetched]);

  const isFinal = status === 'final';
  return (
    <span className={`chip ${isFinal ? 'chip--ok' : ''}`}>
      <span className={`dot ${isFinal ? 'dot--ok' : ''}`} />
      {isFinal ? 'Final' : 'Draft'}
    </span>
  );
}
