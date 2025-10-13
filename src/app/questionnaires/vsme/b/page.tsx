'use client';
import Link from 'next/link';

export default function Page() {
  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
      <p><Link href="/questionnaires" style={{ textDecoration:'underline' }}>← Back</Link></p>
      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 8 }}>
        VSME — Section B
      </h1>
      <p style={{ marginTop: 8, color: 'var(--color-text-muted)' }}>
        Environmental (demo placeholder).
      </p>
      <div style={{
        marginTop: 24, border:'1px solid var(--color-border)', borderRadius: 8, padding: 16, background: 'white'
      }}>
        <p style={{ margin: 0 }}>Coming soon: questions list for Section B.</p>
      </div>
    </main>
  );
}
