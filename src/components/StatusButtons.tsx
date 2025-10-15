'use client';
import { useEffect, useMemo, useState } from 'react';
import { getItemSchema, type ItemSchema } from '@/lib/cdm/questions';

function missingRequired(schema: ItemSchema | null, value: any) {
  if (!schema) return [];
  return schema.fields
    .filter((f:any)=>f.required)
    .filter((f:any)=>{
      const v = value?.[f.key];
      return v === undefined || v === null || String(v).trim?.() === '' || (typeof v === 'number' && Number.isNaN(v));
    })
    .map((f:any)=>f.label);
}

export default function StatusButtons({ project, code }: { project: string; code: string }) {
  const schema = useMemo(()=>getItemSchema(code), [code]);
  const [answers, setAnswers] = useState<any>({});
  const [status, setStatus] = useState<'draft'|'final'>('draft');
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const missing = useMemo(()=>missingRequired(schema, answers), [schema, answers]);
  const canFinalize = missing.length === 0;

  async function loadAll() {
    setLoading(true);
    // answers
    const resA = await fetch(`/api/cdm/item/answers?project=${encodeURIComponent(project)}&code=${encodeURIComponent(code)}`);
    const jA = resA.ok ? await resA.json() : null;
    setAnswers(jA?.data ?? {});
    // status  (NB: /status — mitte /status2)
    const resS = await fetch(`/api/cdm/item/status?project=${encodeURIComponent(project)}&code=${encodeURIComponent(code)}`);
    const jS = resS.ok ? await resS.json() : null;
    setStatus(jS?.status === 'final' ? 'final' : 'draft');
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, [project, code]);

  async function mark(next: 'draft' | 'final') {
    setWorking(true);
    try {
      const res = await fetch('/api/cdm/item/status', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ project, code, status: next }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      const j = await res.json();
      setStatus(j?.status ?? next);
    } finally {
      setWorking(false);
    }
  }

  if (loading) return (
    <div style={{ display:'flex', gap:12 }}>
      <button className="btn" disabled>Save draft</button>
      <button className="btn" disabled>Mark final</button>
    </div>
  );

  return (
    <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
      <button
        className="btn"
        onClick={()=>mark('draft')}
        disabled={working || status==='draft'}
        title="Set status back to draft"
      >
        Save draft
      </button>

      <button
        className="btn"
        onClick={()=>mark('final')}
        disabled={working || !canFinalize || status==='final'}
        title={canFinalize ? 'Mark this item as final' : `Fill required: ${missing.join(', ')}`}
      >
        Mark final
      </button>

      <span className="text-sm">
        Status: <b>{status}</b>
        {missing.length>0 && (
          <span style={{ color:'#b45309' }}> &nbsp;• Missing: {missing.join(', ')}</span>
        )}
      </span>
    </div>
  );
}
