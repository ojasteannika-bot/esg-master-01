'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getItems, getSection } from '@/lib/cdm/catalog';

export default function SectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ project?: string }>;
}) {
  const p = (params as any) as { section: string };
  const sp = (searchParams as any) as { project?: string };
  const project = sp?.project ?? 'client-test1';
  const section = p?.section;

  const sect = getSection(section);
  const items = getItems(section);

  return (
    <main style={{ maxWidth: 900, margin:'0 auto', padding:24 }}>
      <p><Link href={`/questionnaires/esglite/nodes?project=${encodeURIComponent(project)}`}>← Back to sections</Link></p>
      <h3>{section} — {sect?.title ?? ''}</h3>
      <p>Project: <b>{project}</b></p>

      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr><th>Code</th><th>Title</th><th>Status</th><th /></tr>
        </thead>
        <tbody>
          {items.map(it => (
            <tr key={it.code}>
              <td><b>{it.code}</b></td>
              <td>{it.title}</td>
              <td>
                {/* Statusi näitame item-lehel; siin hoidsime lihtsana */}
                <i>Open</i>
              </td>
              <td>
                <Link href={`/esglite/item/${it.code}?project=${encodeURIComponent(project)}`}>Open</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
