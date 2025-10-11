import { Suspense } from 'react';
import Client from './page.client';

export default function Page() {
  // Server-komponent; ei kasuta ühtegi client hook’i
  return (
    <Suspense fallback={null}>
      <Client />
    </Suspense>
  );
}
