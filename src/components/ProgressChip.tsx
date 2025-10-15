'use client';
import { useEffect, useState } from 'react';

type Stats = { total:number; completed:number; percent:number };

export default function ProgressChip({ project, section }: { project: string; section: string }) {
  const [stats, setStats] = useState<Stats|null>(null);
  const [err, setErr] = useState<string| null>(null);

  async function load() {
    setErr(null);
    try {
      const res = await fetch(`/api/cdm/section-stats?project=${encodeURIComponent(project)}&section=${encodeURIComponent(section)}`, { cache: 'no-store' });
      const j = await res.json();
      if (!res.ok || !j?.ok) throw new Error(j?.error || 'Load failed');
      setStats({ total: j.total, completed: j.completed, percent: j.percent });
    } catch (e:any) {
      setErr(e?.message || 'Load failed');
    }
  }

  useEffect(()=>{ load(); }, [project, section]);

  const bg = stats?.percent === 100 ? '#16a34a' : '#e5e7eb';
  const fg = stats?.percent === 100 ? '#fff' : '#111827';

  return (
    <span title={err ?? (stats ? `${stats.completed}/${stats.total} completed` : 'Loading…')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 10px',
            borderRadius: 999,
            fontSize: 12,
            background: bg,
            color: fg,
            border: '1px solid #d1d5db',
            minWidth: 88,
            justifyContent: 'center'
          }}>
      {stats ? `${stats.percent}%` : '…'}
    </span>
  );
}
