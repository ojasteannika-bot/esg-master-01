'use client';
import { useEffect, useState } from 'react';
import ProgressRing from './ProgressRing';

type Stats = { total:number; completed:number; percent:number };

export default function SectionProgressRing({ project, section }: { project:string; section:string }) {
  const [stats, setStats] = useState<Stats|null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/cdm/section-stats?project=${encodeURIComponent(project)}&section=${encodeURIComponent(section)}`, { cache:'no-store' });
        const j = await res.json();
        if (!res.ok || !j?.ok) throw new Error();
        setStats({ total: j.total, completed: j.completed, percent: j.percent });
      } catch { setStats({ total:0, completed:0, percent:0 }); }
    })();
  }, [project, section]);

  if (!stats) return <span className="progressText">…</span>;

  return (
    <div className="progressBox">
      <ProgressRing percent={stats.percent} />
      <span className="progressText">{stats.completed}/{stats.total} completed</span>
    </div>
  );
}
