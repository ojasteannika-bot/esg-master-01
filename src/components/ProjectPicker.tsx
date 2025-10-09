'use client';

import React, { useEffect, useState } from 'react';
import { getProjectId, setProjectId, onProjectChange } from '../lib/project';

export default function ProjectPicker() {
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue(getProjectId());
    return onProjectChange((id) => setValue(id));
  }, []);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setValue(v);
    setProjectId(v);
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="projectInput" className="text-sm text-slate-500">
        Project:
      </label>
      <input
        id="projectInput"
        className="border rounded px-2 py-1 min-w-[14rem]"
        placeholder="demo-project-01"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
