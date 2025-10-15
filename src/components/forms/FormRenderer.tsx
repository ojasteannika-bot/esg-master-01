'use client';
import type { ItemSchema, Field } from '@/lib/cdm/questions';
import { useState } from 'react';

export default function FormRenderer({
  schema, value, onChange
}: { schema: ItemSchema; value: any; onChange: (next:any)=>void }) {
  const [uploading, setUploading] = useState<string | null>(null);
  const set = (k:string, v:any) => onChange({ ...(value||{}), [k]: v });
  const reqMark = (f: Field) => (f as any).required ? ' *' : '';

  async function handleUpload(fld: Extract<Field,{type:'file'}>, file: File) {
    const fd = new FormData();
    fd.set('file', file);
    setUploading(fld.key);
    try {
      const res = await fetch('/api/uploads', { method:'POST', body: fd });
      const j = await res.json();
      if (!res.ok || !j?.ok) throw new Error(j?.error || 'Upload failed');
      const prev = value?.[fld.key];

      // salvestame väärtuseks objekti {name, url, size, type, stored}
      const val = j.file;
      if (fld.multiple) {
        const arr = Array.isArray(prev) ? prev : (prev ? [prev] : []);
        set(fld.key, [...arr, val]);
      } else {
        set(fld.key, val);
      }
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="space-y-3">
      {schema.fields.map((f: Field) => {
        const v = value?.[f.key] ?? '';

        if (f.type === 'select') {
          return (
            <div key={f.key}>
              <label className="block text-sm mb-1">{f.label}{reqMark(f)}</label>
              <select className="input" value={v} onChange={e=>set(f.key, e.target.value)}>
                <option value="">— select —</option>
                {(f.options||[]).map(o=><option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          );
        }

        if (f.type === 'number') {
          const num = v === '' ? '' : Number(v);
          return (
            <div key={f.key}>
              <label className="block text-sm mb-1">{f.label}{reqMark(f)}</label>
              <input
                className="input"
                type="number"
                value={num}
                onChange={e=>set(f.key, e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
          );
        }

        if (f.type === 'file') {
          const show = (fileVal:any) => {
            if (!fileVal) return null;
            const list = Array.isArray(fileVal) ? fileVal : [fileVal];
            return (
              <ul className="text-sm" style={{marginTop:6}}>
                {list.map((it:any,i:number)=>(
                  <li key={i}>
                    <a href={it.url} target="_blank" rel="noreferrer">{it.name ?? it.stored}</a>
                    {typeof it.size==='number' ? ` (${Math.round(it.size/1024)} kB)` : ''}
                  </li>
                ))}
              </ul>
            );
          };

          return (
            <div key={f.key}>
              <label className="block text-sm mb-1">{f.label}{reqMark(f)}</label>
              <input
                className="input"
                type="file"
                accept={(f.accept as any) || undefined}
                multiple={Boolean((f as any).multiple)}
                onChange={async e=>{
                  const files = e.currentTarget.files;
                  if (!files || files.length===0) return;
                  if ((f as any).multiple) {
                    for (const file of Array.from(files)) {
                      await handleUpload(f as any, file);
                    }
                  } else {
                    await handleUpload(f as any, files[0]);
                  }
                  e.currentTarget.value = ''; // reset
                }}
                disabled={uploading===f.key}
              />
              {uploading===f.key && <p className="text-sm text-muted">Uploading…</p>}
              {show(value?.[f.key])}
            </div>
          );
        }

        // default: text
        return (
          <div key={f.key}>
            <label className="block text-sm mb-1">{f.label}{reqMark(f)}</label>
            <input className="input" value={v} onChange={e=>set(f.key, e.target.value)} />
          </div>
        );
      })}
      <p className="text-xs text-muted">* required</p>
    </div>
  );
}
