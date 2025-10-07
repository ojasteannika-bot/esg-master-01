'use client';

import { useEffect, useState } from 'react';
import { getProjectId, setProjectId, onProjectChange } from '@/lib/project';

const presets = ['demo-project-01', 'client-XYZ', 'client-ABC'];

export default function ProjectPicker() {
  const [value, setValue] = useState(getProjectId());

  useEffect(() => {
    // Kui projekt muutus mujalt, uuenda inputit
    return onProjectChange((id) => setValue(id));
  }, []);

  function apply(v: string) {
    setValue(v);
    setProjectId(v);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-600">Project:</span>
      <input
        className="rounded-lg border px-2 py-1"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => apply(value.trim() || 'demo-project-01')}
        placeholder="client-XYZ"
        aria-label="Project id"
      />
      <select
        className="rounded-lg border px-2 py-1"
        value=""
        onChange={(e) => apply(e.target.value)}
        aria-label="Pick preset"
      >
        <option value="" disabled>
          presets…
        </option>
        {presets.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </div>
  );
}
