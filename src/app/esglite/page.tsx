'use client';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { Suspense } from 'react';

function PageInner() {
  // siia võib jääda sinu olemasolev kood (useSearchParams jne)
  return (
    <main style={{ padding: 24 }}>
      <h1>ESGLITE – dashboard</h1>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PageInner />
    </Suspense>
  );
}
