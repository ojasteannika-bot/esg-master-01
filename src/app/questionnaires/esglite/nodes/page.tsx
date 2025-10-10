'use client';

// Next 15: unwrap searchParams React.use()'ga
import { use, useEffect, useState } from 'react';

type SectionRow = {
  code: string;
  title: string;
  percent?: number;
};

type SP = { project?: string };

export default function NodesPage({
  searchParams,
}: {
  searchParams: Promise<SP> | SP;
}) {
  const sp = use(searchParams as Promise<SP>);
  const project = sp.project ?? 'client-test1';

  const [rows, setRows] = useState<SectionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const sRes = await fetch('/api/cdm/sections');
        const sJson = await sRes.json();

        const sections: SectionRow[] = (sJson?.sections ?? []).map((s: any) => ({
          code: s.code,
          title: s.title,
        }));

        // võta progress igale sektsioonile paralleelselt
        const withPct = await Promise.all(
          sections.map(async (s) => {
            const pRes = await fetch(
              `/api/cdm/section-status?project=${encodeURIComponent(project)}&code=${encodeURIComponent(s.code)}`
            );
            const pJson = await pRes.json();
            return { ...s, percent: pJson?.percent ?? 0 };
          })
        );

        if (!cancelled) setRows(withPct);
      } catch {
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [project]);

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
      <h2>Disclosures by section</h2>
      <div style={{ fontSize: 13, color: '#667' }}>
        Project: <b>{project}</b>
      </div>

      <div style={{ height: 12 }} />

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
            <th style={{ padding: '8px 0' }}>Code</th>
            <th style={{ padding: '8px 0' }}>Title</th>
            <th style={{ padding: '8px 0' }}>Progress</th>
            <th style={{ padding: '8px 0' }} />
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={4} style={{ padding: '16px 0', color: '#667' }}>
                Loading…
              </td>
            </tr>
          )}

          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={4} style={{ padding: '16px 0', color: '#667' }}>
                No sections.
              </td>
            </tr>
          )}

          {rows.map((s) => (
            <tr key={s.code} style={{ borderBottom: '1px solid #f3f3f3' }}>
              <td style={{ padding: '10px 0', fontWeight: 600 }}>{s.code}</td>
              <td style={{ padding: '10px 0' }}>{s.title}</td>
              <td style={{ padding: '10px 0', width: 280 }}>
                <div style={{ height: 6, background: '#eee', borderRadius: 4 }}>
                  <div
                    style={{
                      width: `${s.percent ?? 0}%`,
                      height: 6,
                      borderRadius: 4,
                      background: '#0b1a2b',
                    }}
                  />
                </div>
                <div style={{ fontSize: 12, color: '#667', marginTop: 6 }}>
                  {s.percent ?? 0}%
                </div>
              </td>
              <td style={{ padding: '10px 0', textAlign: 'right' }}>
                <a
                  href={`/esglite/${encodeURIComponent(s.code)}?project=${encodeURIComponent(project)}`}
                  style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    background: '#0b1a2b',
                    color: 'white',
                    borderRadius: 8,
                    textDecoration: 'none',
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
