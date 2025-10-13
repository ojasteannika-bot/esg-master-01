'use client';
import Link from 'next/link';
import { use } from 'react';
import { getSection, listItems } from '@/lib/cdm/catalog';

type SP = { project?: string };

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<SP>;
}) {
  const pr = use(params);
  const sp = use(searchParams);
  const project = sp?.project ?? 'client-test1';
  const section = pr.section;

  const set = getSection(section);
  const items = listItems(section);

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <p><Link href={`/questionnaires/esglite/nodes?project=${encodeURIComponent(project)}`}>&larr; Back</Link></p>
      <h3>{section} <small style={{ opacity: 0.6 }}>{set?.title ?? ''}</small></h3>
      <p>Project: <b>{project}</b></p>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th>Code</th><th>Title</th><th>Status</th><th /></tr></thead>
        <tbody>
          {(items ?? []).map(it => (
            <tr key={it.code}>
              <td><b>{it.code}</b></td>
              <td>{it.title}</td>
              <td><i>Open</i></td>
              <td><Link href={`/esglite/item/${it.code}?project=${encodeURIComponent(project)}`}>Open</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
