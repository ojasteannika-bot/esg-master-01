'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getProjectId, setProjectId, onProjectChange } from '@/lib/project';

export default function Nav() {
  const [pid, setPid] = useState<string>(getProjectId());

  useEffect(() => onProjectChange(setPid), []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.trim();
    setPid(v);
    setProjectId(v || 'demo-project-01');
  }

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto p-3 flex items-center gap-4">
        <Link href="/" className="font-semibold">ESG-MASTER-01</Link>
        <nav className="flex gap-3 text-sm">
          <Link href="/wizard">Wizard</Link>
          <Link href="/questionnaires">Questionnaires</Link>
          <Link href="/preview">Preview</Link>
          <Link href="/audit">Audit</Link>
          <Link href="/integrations">Integrations</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <label className="text-xs text-slate-500">Project:</label>
          <input
            className="border rounded px-2 py-1 text-sm"
            value={pid}
            onChange={handleChange}
            placeholder="demo-project-01"
          />
        </div>
      </div>
    </header>
  );
}
