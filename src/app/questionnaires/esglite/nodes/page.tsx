'use client';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { Suspense } from 'react';

function NodesInner() {
  // NB! Kui vajad hiljem useSearchParams/useRouter/usePathname, tee seda siin sees.
  return (
    <main style={{ padding: 24 }}>
      <h1>Disclosures by section</h1>
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
