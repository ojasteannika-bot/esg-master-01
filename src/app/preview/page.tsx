'use client';

import { useState } from 'react';
import { loadJSON } from '@/lib/storage';

type A = {
  company?: string; employees?: string; energy_kwh?: string;
  scope1?: string; ren_pct?: string; policy?: string;
};
type B = {
  suppliers?: string; water_m3?: string; waste_t?: string;
  target_year?: string; notes?: string;
};

export default function Page() {
  const [busy, setBusy] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

  async function testStub() {
    setBusy(true); setOutput(null);
    try {
      const res = await fetch('/api/pdf', { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setOutput(JSON.stringify(json, null, 2));
    } catch (err: any) {
      setOutput(`Error: ${err?.message ?? String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  async function sendFullPayload() {
    setBusy(true); setOutput(null);
    try {
      const a = loadJSON<A>('wizard:A', {});
      const b = loadJSON<B>('wizard:B', {});
      const reportId = 'adhoc'; // vajadusel võime tulevikus võtta /reports/[id] lehelt

      const res = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reportId, a, b }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setOutput(JSON.stringify(json, null, 2));
    } catch (err: any) {
      setOutput(`Error: ${err?.message ?? String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-2xl p-5">Preview / PDF — placeholder</div>

      <div className="flex gap-3">
        <button
          onClick={testStub}
          disabled={busy}
          className="px-3 py-2 rounded-xl bg-emerald-600 text-white disabled:opacity-50"
        >
          {busy ? 'Calling /api/pdf…' : 'Test PDF API (empty)'}
        </button>

        <button
          onClick={sendFullPayload}
          disabled={busy}
          className="px-3 py-2 rounded-xl border disabled:opacity-50"
        >
          {busy ? 'Sending payload…' : 'Send full payload (A+B)'}
        </button>
      </div>

      {output && (
        <pre className="bg-slate-100 text-xs p-3 rounded-lg overflow-auto">{output}</pre>
      )}
    </div>
  );
}
