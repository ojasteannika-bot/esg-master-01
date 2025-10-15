'use client';
import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function SectionPage() {
  const sp = useSearchParams();
  const project = sp.get('project') ?? 'client-test1';

  const items = [
    { code: 'A1-1', title: 'About the company — basics (A1-1)' },
    { code: 'A1-2', title: 'Headcount and locations (A1-2)' },
    { code: 'A1-3', title: 'Financial overview (A1-3)' },
  ];

  return (
    <main className="container">
      <h2>VSME — Section A</h2>
      <section className="card">
        <div className="card-head">
          <h3>Company basics</h3>
        </div>
        <div className="card-body list">
          {items.map(it => (
            <div className="row" key={it.code}>
              <div>{it.title}</div>
              <div />
              <div style={{ textAlign: 'right' }}>
                <Link
                  className="btn btn-outline"
                  href={`/esglite/item/${it.code}?project=${encodeURIComponent(project)}`}
                >
                  Open
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
