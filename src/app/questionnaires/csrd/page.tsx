'use client';

import Link from 'next/link';

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <h1>CSRD</h1>
      <p><Link href="/questionnaires">← Back</Link></p>
    </div>
  );
}
