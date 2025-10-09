'use client';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { Suspense } from 'react';

function NodesInner() {
  return (
    <main style={{ padding: 24 }}>
      <h1>ESGLITE – sections</h1>
    </main>
  );
}

export default function NodesPage() {
  return (
    <Suspense fallback={null}>
      <NodesInner />
    </Suspense>
  );
}
