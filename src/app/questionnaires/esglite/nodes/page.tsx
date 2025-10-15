'use client';
import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import SectionProgressRing from '@/components/SectionProgressRing';
import ProjectProgressRing from '@/components/ProjectProgressRing';
import ItemStatusChip from '@/components/ItemStatusChip';

type ItemRow = { code:string; title:string; status:'draft'|'final' };

export default function NodesPage() {
  const sp = useSearchParams();
  const project = sp.get('project') ?? 'client-test1';

  // STATE: section items + filter
  const [items, setItems] = React.useState<ItemRow[] | null>(null);
  const [filter, setFilter] = React.useState<'all'|'complete'|'incomplete'|'not'>('all');

  // Load A1 section statuses once
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/cdm/section-stats?project=${encodeURIComponent(project)}&section=A1`, { cache:'no-store' });
        const j = await res.json();
        if (!res.ok || !j?.ok) throw new Error();
        // map codes -> titles
        const titles: Record<string,string> = {
          'A1-1':'About the company — basics (A1-1)',
          'A1-2':'Headcount and locations (A1-2)',
          'A1-3':'Financial overview (A1-3)',
        };
        const rows: ItemRow[] = (j.items || []).map((it:any) => ({
          code: it.code,
          title: titles[it.code] ?? it.code,
          status: it.status === 'final' ? 'final' : 'draft'
        }));
        setItems(rows);
      } catch {
        setItems([]);
      }
    })();
  }, [project]);

  const filtered = React.useMemo(() => {
    if (!items) return null;
    if (filter === 'all') return items;
    if (filter === 'complete') return items.filter(i => i.status === 'final');
    if (filter === 'incomplete') return items.filter(i => i.status === 'draft'); // “incomplete”=draft (täidetud osaliselt/mitte lõpuni)
    if (filter === 'not') return items.filter(i => i.status === 'draft'); // meil pole eraldi “not started”, seepärast sama (soovi korral saad eristada kui answers on tühi).
    return items;
  }, [items, filter]);

  return (
    <main className="container">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <h2 style={{ margin:0 }}>Disclosures</h2>
        <ProjectProgressRing project={project} />
      </div>

      <section className="card">
        <div className="card-head">
          <h3>A1 — Company basics</h3>
          <SectionProgressRing project={project} section="A1" />
        </div>

        <div className="toolbar">
          <button className={`pill ${filter==='all'?'pill--active':''}`} onClick={()=>setFilter('all')}>All</button>
          <button className={`pill ${filter==='complete'?'pill--active':''}`} onClick={()=>setFilter('complete')}>Complete</button>
          <button className={`pill ${filter==='incomplete'?'pill--active':''}`} onClick={()=>setFilter('incomplete')}>Incomplete</button>
          <button className={`pill ${filter==='not'?'pill--active':''}`} onClick={()=>setFilter('not')}>Not started</button>
          <span style={{flex:1}} />
          <button className="btn">File upload</button>
        </div>

        <div className="card-body list">
          {!filtered ? (
            <div className="row"><div>Loading…</div><div></div><div></div></div>
          ) : filtered.length === 0 ? (
            <div className="row"><div>No items</div><div></div><div></div></div>
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
