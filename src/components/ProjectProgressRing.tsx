'use client';
import { useEffect, useState } from 'react';
import ProgressRing from './ProgressRing';

type Stats = { total:number; completed:number; percent:number };

export default function ProjectProgressRing({ project }: { project:string }) {
  const [stats, setStats] = useState<Stats|null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/cdm/project-stats?project=${encodeURIComponent(project)}`, { cache:'no-store' });
        const j = await res.json();
        if (!res.ok || !j?.ok) throw new Error();
        setStats({ total: j.total, completed: j.completed, percent: j.percent });
      } catch { setStats({ total:0, completed:0, percent:0 }); }
    })();
  }, [project]);

  if (!stats) return <span className="progressText">…</span>;

  return (
    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
      <ProgressRing percent={stats.percent} />
      <div style={{ display:'flex', flexDirection:'column', lineHeight:1.2 }}>
        <b style={{ fontSize:12, color:'#111827' }}>Overall</b>
        <span className="progressText">{stats.completed}/{stats.total} completed</span>
      </div>
    </div>
  );
}
