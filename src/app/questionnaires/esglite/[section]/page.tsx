'use client';

import { use } from 'react';
import Link from 'next/link';
import { getSection, listItems } from '@/lib/cdm/catalog';

type SP = { project?: string };
type PP = { section: string };

export default function SectionPage({
  searchParams,
  params,
}: {
  searchParams: Promise<SP>;
  params: Promise<PP>;
}) {
  const sp = use(searchParams);
  const pm = use(params);

  const project = sp.project ?? 'client-test1';
  const section = pm.section;

  const sec = getSection(section);
  const items = listItems(section);

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <Link href={`/questionnaires/esglite/nodes?project=${encodeURIComponent(project)}`} prefetch={false}>
        &larr; Back to sections
      </Link>

      <h1 style={{ marginTop: 16 }}>
        {section} — {sec?.title ?? 'Unknown section'}
      </h1>

      <div style={{ marginTop: 12, fontSize: 12, color: '#64748b' }}>
        Project: <b>{project}</b>
      </div>

      <table style={{ width: '100%', marginTop: 24 }}>
        <thead>
          <tr style={{ textAlign: 'left' }}>
            <th style={{ padding: '8px 0' }}>Code</th>
            <th style={{ padding: '8px 0' }}>Title</th>
            <th style={{ padding: '8px 0' }}>Open</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.code}>
              <td style={{ padding: '8px 0' }}>{it.code}</td>
              <td style={{ padding: '8px 0' }}>{it.title}</td>
              <td style={{ padding: '8px 0' }}>
                <Link
                  href={`/esglite/item/${encodeURIComponent(it.code)}?project=${encodeURIComponent(project)}`}
                  prefetch={false}
                >
                  Open
                </Link>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={3} style={{ padding: '8px 0', color: '#64748b' }}>
                No items.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
