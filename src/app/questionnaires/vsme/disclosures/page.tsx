'use client';

// VSME Disclosures – lihtne stub, null väliseid impordeid.
// Turvaline Next 15 jaoks: kogu leht on client-component.

import { useSearchParams } from 'next/navigation';

export default function VsmeDisclosuresPage() {
  const sp = useSearchParams();
  const project = sp.get('project') ?? 'client-test1';

  // Väike demo-sisu – real UI tuleb hiljem
  const rows = [
    { code: 'S1', title: 'Strategy & Governance', progress: 0 },
    { code: 'S2', title: 'Impacts & Risks',       progress: 0 },
    { code: 'S3', title: 'Metrics',               progress: 0 },
    { code: 'S4', title: 'Targets',               progress: 0 },
  ];

  return (
    <main style={{ maxWidth: 920, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>
        VSME · Disclosures
      </h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Project: <strong>{project}</strong>
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
            <th style={{ padding: '10px 6px', width: 90 }}>Code</th>
            <th style={{ padding: '10px 6px' }}>Title</th>
            <th style={{ padding: '10px 6px', width: 160 }}>Progress</th>
            <th style={{ padding: '10px 6px', width: 100 }} />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.code} style={{ borderBottom: '1px solid #f2f2f2' }}>
              <td style={{ padding: '10px 6px', fontWeight: 600 }}>{r.code}</td>
              <td style={{ padding: '10px 6px' }}>{r.title}</td>
              <td style={{ padding: '10px 6px' }}>
                <div style={{ background: '#f2f2f2', height: 8, borderRadius: 4 }}>
                  <div style={{
                    width: `${r.progress}%`,
                    height: '100%',
                    borderRadius: 4,
                    background: '#111827'
                  }} />
                </div>
                <span style={{ fontSize: 12, color: '#666' }}>{r.progress}%</span>
              </td>
              <td style={{ padding: '10px 6px' }}>
                <a
                  href={`/questionnaires/vsme/disclosures/${r.code.toLowerCase()}?project=${encodeURIComponent(project)}`}
                  style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    background: '#0f172a',
                    color: 'white',
                    borderRadius: 8,
                    textDecoration: 'none'
                  }}
                >
                  Open
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
