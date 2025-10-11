// src/app/esglite/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import PageClient from './page.client';

export default function Page() {
  return <PageClient />;
}
