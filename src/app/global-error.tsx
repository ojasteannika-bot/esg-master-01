'use client';

/** Global error boundary for App Router (root). */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html>
      <body style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <h2>Something went wrong</h2>
        <pre style={{ whiteSpace: 'pre-wrap', background:'#f8fafc', padding:12, borderRadius:8 }}>
{String(error?.message || 'Unknown error')}
{error?.digest ? `\nDigest: ${error.digest}` : ''}
        </pre>
        <a href="/" style={{ display: 'inline-block', marginTop: 12 }}>Back to home</a>
      </body>
    </html>
  );
}
