'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Props = { project: string };

// Demo-andmed; asenda hiljem päris andmetega
const SECTIONS = [{ code: 'A1', title: 'Company basics' }, { code: 'B3', title: 'Energy & GHG' }, { code: 'B4', title: 'Pollution' }];

export default function NodesClient({ project }: Props) {
  const [filter, setFilter] = useState<'all' | 'complete' | 'incomplete' | 'not-started'>('all');

  // ❗ ära tee setState renderi ajal; kui on vaja initsialiseerida, tee seda effectis
  useEffect(() => {
    // nt. loe localStorage'ist
    // const saved = localStorage.getItem('nodesFilter') as any;
    // if (saved) setFilter(saved);
  }, []);

  const items = useMemo(() => {
    // rakenda filter siit (praegu passthrough)
    return SECTIONS;
  }, [filter]);

  return (
    <div className="section">
      <p style={{ marginBottom: 12 }}>Project: <b>{project}</b></p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button className="btn" onClick={() => setFilter('all')}>All</button>
        <button className="btn" onClick={() => setFilter('complete')}>Complete</button>
        <button className="btn" onClick={() => setFilter('incomplete')}>Incomplete</button>
        <button className="btn" onClick={() => setFilter('not-started')}>Not started</button>
      </div>

      <table className="table">
        <thead><tr><th>Code</th><th>Title</th><th>Progress</th><th/></tr></thead>
        <tbody>
          {items.map(it => (
            <tr key={it.code}>
              <td>{it.code}</td>
              <td>{it.title}</td>
              <td>0%</td>
              <td>
                <Link className="btn btn-outline" href={`/esglite/item/${it.code}?project=${encodeURIComponent(project)}`}>Open</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
