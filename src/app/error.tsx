'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h2>Route error</h2>
      <pre style={{ whiteSpace: 'pre-wrap', background:'#f8fafc', padding:12, borderRadius:8 }}>
{String(error?.message || 'Unknown error')}
      </pre>
      <button onClick={() => reset()} style={{ marginTop: 12, padding: '8px 12px', borderRadius: 8 }}>
        Try again
      </button>
    </main>
  );
}
