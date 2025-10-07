'use client';

export type QuestionDef = {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'radio';
  help?: string;
  options?: { value: string; label: string }[]; // select/radio
};

export default function Question({
  q,
  value,
  onChange,
}: {
  q: QuestionDef;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <label className="block">
      <div className="text-sm text-slate-600">{q.label}</div>
      {q.help && <div className="text-xs text-slate-500 mb-1">{q.help}</div>}

      {q.type === 'text' && (
        <input
          className="w-full border rounded-xl p-2"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {q.type === 'number' && (
        <input
          className="w-full border rounded-xl p-2"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {q.type === 'select' && (
        <select
          className="w-full border rounded-xl p-2"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">—</option>
          {q.options?.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      )}

      {q.type === 'radio' && (
        <div className="flex gap-4 mt-1">
          {q.options?.map((o) => (
            <label key={o.value} className="flex items-center gap-2">
              <input
                type="radio"
                name={q.id}
                value={o.value}
                checked={value === o.value}
                onChange={() => onChange(o.value)}
              />
              {o.label}
            </label>
          ))}
        </div>
      )}
    </label>
  );
}
