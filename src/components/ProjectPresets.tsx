'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { getProjectId, setProjectId } from '../lib/project';

const KEY = 'project:presets';

function loadPresets(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function savePresets(presets: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify([...new Set(presets)].filter(Boolean)));
}

export default function ProjectPresets() {
  const [presets, setPresets] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>('');

  // init: lae presetid ja vali aktiivne projekt, kui on olemas
  useEffect(() => {
    const ps = loadPresets();
    setPresets(ps);
    const cur = getProjectId();
    if (ps.includes(cur)) setSelected(cur);
  }, []);

  useEffect(() => {
    savePresets(presets);
  }, [presets]);

  const options = useMemo(() => presets.slice().sort((a, b) => a.localeCompare(b)), [presets]);

  function addCurrent() {
    const cur = getProjectId();
    if (!cur) return;
    if (!presets.includes(cur)) setPresets((p) => [...p, cur]);
    setSelected(cur);
  }

  function removeSelected() {
    if (!selected) return;
    setPresets((p) => p.filter((x) => x !== selected));
    setSelected('');
  }

  function onPick(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    setSelected(id);
    if (id) setProjectId(id);
  }

  return (
    <div className="flex items-center gap-2">
      <select
        className="border rounded px-2 py-1 min-w-[12rem]"
        value={selected}
        onChange={onPick}
        title="Choose from saved projects"
      >
        <option value="">presets...</option>
        {options.map((id) => (
          <option key={id} value={id}>
            {id}
          </option>
        ))}
      </select>

      <button
        onClick={addCurrent}
        className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-xs"
        title="Save current project as preset"
      >
        Save
      </button>

      <button
        onClick={removeSelected}
        className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-xs disabled:opacity-50"
        disabled={!selected}
        title="Remove selected preset"
      >
        Remove
      </button>
    </div>
  );
}
