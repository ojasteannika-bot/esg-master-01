// src/app/questionnaires/esglite/nodes/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSections } from '@/lib/cdm/catalog';

type Row = { code: string; title: string; percent: number };

export default function NodesPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const sp = (searchParams as any) as { project?: string };
  const project = sp?.project ?? 'client-test1';

  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    const sections = getSections();
    Promise.all(
      sections.map(async s => {
        const r = await fetch(
          `/api/cdm/section-status?project=${encodeURIComponent(project)}&code=${encodeURIComponent(s.code)}`
        );
        const j = await r.json();
        return { code: s.code, title: s.title, percent: j?.percent ?? 0 };
      })
    ).then(setRows);
  }, [project]);

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h2>Disclosures by section</h2>
      <p>Project: <b>{project}</b></p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr><th>Code</th><th>Title</th><th>Progress</th><th /></tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.code}>
              <td><b>{r.code}</b></td>
              <td>{r.title}</td>
              <td>
                <div style={{ background:'#eee', height:8, borderRadius:4 }}>
                  <div style={{ height:8, width:`${r.percent}%`, borderRadius:4 }} />
                </div>
                <small>{r.percent}%</small>
              </td>
              <td>
                <Link href={`/esglite/${r.code}?project=${encodeURIComponent(project)}`}>Open</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
