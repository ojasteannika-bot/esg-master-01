// src/app/esglite/page.tsx
import { Suspense } from 'react';
import Client from './page.client';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
      <Client />
    </Suspense>
  );
}
