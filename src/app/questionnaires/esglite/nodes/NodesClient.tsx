'use client';
import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ItemStatusChip from '@/components/ItemStatusChip';
import SectionProgressRing from '@/components/SectionProgressRing';

type ItemRow = { code:string; title:string; status:'draft'|'final'; state?:'not'|'incomplete'|'final' };
const TITLES: Record<string,string> = {
  'A1-1': 'About the company — basics (A1-1)',
  'A1-2': 'Headcount and locations (A1-2)',
  'A1-3': 'Financial overview (A1-3)',
};

export default function NodesClient() {
  const sp = useSearchParams();
  const project = sp.get('project') ?? 'client-test1';

  const [items, setItems] = React.useState<ItemRow[] | null>(null);
  const [progress, setProgress] = React.useState<{percent:number; completed:number; total:number} | null>(null);
  const [filter, setFilter] = React.useState<'all'|'complete'|'incomplete'|'not'>('all');

  React.useEffect(() => {
    (async () => {
      const res = await fetch(`/api/cdm/section-stats?section=A1&project=${encodeURIComponent(project)}`, { cache:'no-store' });
      const j = await res.json();
      const rows: ItemRow[] = (j.items || []).map((it:any) => ({
        code: it.code,
        title: TITLES[it.code] ?? it.code,
        status: it.status === 'final' ? 'final' : 'draft',
        state: it.state,
      }));
      setItems(rows);
      setProgress({ percent: j.percent ?? 0, completed: j.completed ?? 0, total: j.total ?? rows.length });
    })().catch(() => {
      setItems([]);
      setProgress({ percent: 0, completed: 0, total: 0 });
    });
  }, [project]);

  const filtered = React.useMemo(() => {
    if (!items) return null;
    switch (filter) {
      case 'complete':   return items.filter(i => (i.state ?? (i.status==='final'?'final':'incomplete')) === 'final');
      case 'incomplete': return items.filter(i => (i.state ?? (i.status==='final'?'final':'incomplete')) === 'incomplete');
      case 'not':        return items.filter(i => (i.state ?? 'incomplete') === 'not');
      default:           return items;
    }
  }, [items, filter]);

  return (
    <main className="container">
      <h2>Disclosures</h2>

      <section className="card">
        <div className="card-head" style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div>
            <div style={{fontWeight:600}}>A1 — Company basics</div>
            {progress && (<div className="progressText">{progress.completed}/{progress.total} completed</div>)}
          </div>
          {progress ? <SectionProgressRing percent={progress.percent} /> : null}
        </div>

        <div className="card-body">
          <div style={{display:'flex', gap:8, marginBottom:12}}>
            <button className={`pill ${filter==='all'?'pill--active':''}`} onClick={()=>setFilter('all')}>All</button>
            <button className={`pill ${filter==='complete'?'pill--active':''}`} onClick={()=>setFilter('complete')}>Complete</button>
            <button className={`pill ${filter==='incomplete'?'pill--active':''}`} onClick={()=>setFilter('incomplete')}>Incomplete</button>
            <button className={`pill ${filter==='not'?'pill--active':''}`} onClick={()=>setFilter('not')}>Not started</button>
          </div>

          {!filtered ? (
            <div className="row"><div>Loading…</div><div/></div>
          ) : filtered.length === 0 ? (
            <div className="row"><div>No items</div><div/></div>
          ) : (
            filtered.map(it => (
              <div className="row" key={it.code}>
                <div>{it.title}</div>
                <div><ItemStatusChip project={project} code={it.code} statusPrefetched={it.status} /></div>
                <div style={{textAlign:'right'}}>
                  <Link className="btn btn-outline" href={`/esglite/item/${it.code}?project=${encodeURIComponent(project)}`}>Open</Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
