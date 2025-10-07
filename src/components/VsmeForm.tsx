'use client';

import { useEffect, useState } from 'react';
import type { VsmeSection, VsmeField } from '@/data/vsme';
import { loadJSON, saveJSON } from '@/lib/storage';
import { audit } from '@/lib/audit';

type Props = { section: VsmeSection };
type FormState = Record<string, string>;

export default function VsmeForm({ section }: Props) {
  const storageKey = `vsme:${section.code}`;
  const [form, setForm] = useState<FormState>(() => loadJSON<FormState>(storageKey, {}));

  useEffect(() => {
    saveJSON(storageKey, form);
  }, [form, storageKey]);

  const handle =
    (field: VsmeField) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [field.id]: value }));
      audit({
        ts: new Date().toISOString(),
        type: 'field',
        ctx: `vsme:${section.code}`,
        data: { key: field.id, value }
      });
    };

  const renderField = (f: VsmeField) => {
    const val = form[f.id] ?? '';
    const common = {
      id: f.id,
      name: f.id,
      value: val,
      onChange: handle(f),
      className: 'w-full border rounded-xl p-2'
    };
    switch (f.type) {
      case 'textarea':
        return <textarea {...common} rows={5} />;
      case 'number':
      case 'text':
      default:
        return <input {...common} type={f.type === 'number' ? 'number' : 'text'} />;
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{section.title}</h2>
      {section.fields.map((f) => (
        <label key={f.id} className="block">
          <div className="text-sm mb-1">{f.label}</div>
          {renderField(f)}
        </label>
      ))}
      <div className="text-xs text-slate-500">
        Autosaved: <code>{storageKey}</code>
      </div>
    </div>
  );
}
