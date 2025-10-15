'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import StatusButtons from '@/components/StatusButtons';
import FormRenderer from '@/components/forms/FormRenderer';
import { getItemSchema, type ItemSchema, getNextCode, getPrevCode } from '@/lib/cdm/questions';

function missingRequired(schema: ItemSchema | null, value: any) {
  if (!schema) return [];
  return schema.fields
    .filter((f:any)=>f.required)
    .filter((f:any)=>{
      const v = value?.[f.key];
      return v === undefined || v === null || String(v).trim() === '';
    })
    .map((f:any)=>f.label);
}

function QuestionsBox({ project, code }: { project: string; code: string }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});
  const [lastSaved, setLastSaved] = useState<number|undefined>();
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const schema = getItemSchema(code);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/cdm/item/answers?project=${encodeURIComponent(project)}&code=${encodeURIComponent(code)}`);
    const j = res.ok ? await res.json() : null;
    setData(j?.data ?? {});
    setLoading(false);
  }

  useEffect(() => { load(); }, [project, code]);

  // AUTOSAVE (debounce 800ms)
  useEffect(() => {
    if (loading) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      await fetch('/api/cdm/item/answers', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ project, code, data }),
      });
      setSaving(false);
      setLastSaved(Date.now());
    }, 800);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [data, project, code, loading]);

  const saveNow = async () => {
    setSaving(true);
    await fetch('/api/cdm/item/answers', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ project, code, data }),
    });
    setSaving(false);
    setLastSaved(Date.now());
  };

  if (loading) return <p>Loading…</p>;

  const missing = missingRequired(schema, data);
  const prevCode = getPrevCode(code);
  const nextCode = getNextCode(code);

  return (
    <div style={{ border: '1px solid #eee', padding: 16, borderRadius: 8 }}>
      <h4 style={{ marginBottom: 12 }}>{schema?.title ?? 'Questions'}</h4>
      {schema
        ? <FormRenderer schema={schema} value={data} onChange={setData} />
        : <p>No schema for {code}</p>}

      <div className="mt-3" style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
        <button className="btn" onClick={saveNow}>Save draft</button>
        <span className="text-sm">
          {saving ? 'Saving…' : lastSaved ? `Saved ${new Date(lastSaved).toLocaleTimeString()}` : 'Not saved yet'}
        </span>
        {missing.length > 0 && (
          <span className="text-sm" style={{ color:'#b45309' }}>
            Missing required: {missing.join(', ')}
          </span>
        )}
        <span style={{ flex:1 }} />
        {prevCode && <Link className="btn" href={`/esglite/item/${prevCode}?project=${encodeURIComponent(project)}`}>← Prev</Link>}
        {nextCode && <Link className="btn" href={`/esglite/item/${nextCode}?project=${encodeURIComponent(project)}`}>Next →</Link>}
      </div>
    </div>
  );
}

export default function Page({ params, searchParams }: { params: { code: string }, searchParams?: { project?: string } }) {
  const project = searchParams?.project ?? 'client-test1';
  const code = params.code;

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <p>
        <Link href={`/questionnaires/esglite/nodes?project=${encodeURIComponent(project)}`}>&larr; Back</Link>
      </p>
      <h3>Section item {code}</h3>
      <p>Project: <b>{project}</b></p>
      <QuestionsBox project={project} code={code} />
      <div className="mt-3">
        <StatusButtons project={project} code={code} />
      </div>
    </main>
  );
}
