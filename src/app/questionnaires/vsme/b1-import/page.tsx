import Link from "next/link";
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { saveJSON, loadJSON } from '@/lib/storage';

type Row = { key: string; type: 'text' | 'number' | 'select'; };

export default function Page() {
  const [json, setJson] = useState<any | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [answers, setAnswers] = useState<Record<string,string>>(() => loadJSON('vsme:B1', {}));

  function onFile(ev: React.ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0];
    if (!f) return;
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const data = JSON.parse(String(fr.result || '{}'));
        setJson(data);
        const keys = Object.keys(data).slice(0, 30); // piirame 30ga (vajadusel suurenda)
        const inferred: Row[] = keys.map(k => {
          const v = (data as any)[k];
          const isNum = typeof v === 'number';
          return { key: k, type: isNum ? 'number' : 'text' };
        });
        setRows(inferred);
      } catch {
        alert('Invalid JSON');
      }
    };
    fr.readAsText(f);
  }

  function onSave() {
    saveJSON('vsme:B1', answers);
    alert('Saved under vsme:B1. Open /questionnaires/vsme/b1 to continue.');
  }

  const hasData = rows.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/questionnaires/vsme" className="px-3 py-1 rounded border">&larr; Back</Link>
        <h1 className="text-2xl font-semibold">B1 — Import from JSON</h1>
      </div>

      <div className="space-y-3 bg-white border rounded-2xl p-5">
        <input type="file" accept="application/json" onChange={onFile} />
        {!hasData && <p className="text-sm text-slate-600">Pick your <code>.json</code> (nt b1__data.json). We’ll turn top-level keys into fields.</p>}
        {hasData && (
          <div className="space-y-4">
            {rows.map(r => (
              <label key={r.key} className="block">
                <div className="text-sm text-slate-700">{r.key}</div>
                <input
                  className="w-full border rounded-xl p-2"
                  inputMode={r.type === 'number' ? 'numeric' : undefined}
                  value={answers[r.key] ?? ''}
                  onChange={e => setAnswers(a => ({ ...a, [r.key]: e.target.value }))}
                />
              </label>
            ))}
            <div className="pt-2">
              <button onClick={onSave} className="px-3 py-2 rounded-xl bg-emerald-600 text-white">
                Save as B1
              </button>
            </div>
          </div>
        )}
      </div>

      {json && (
        <details className="bg-slate-50 border rounded-2xl p-3 text-xs">
          <summary className="cursor-pointer">Preview raw JSON</summary>
          <pre className="overflow-auto">{JSON.stringify(json, null, 2)}</pre>
        </details>
      )}
    </div>
  );
}
