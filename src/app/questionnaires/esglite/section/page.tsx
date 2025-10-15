import { Suspense } from 'react';
import SectionClient from './SectionClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function Page() {
  return (
    <Suspense fallback={<main className="container"><div className="card"><div className="card-body">Loading…</div></div></main>}>
      <SectionClient />
    </Suspense>
  );
}
