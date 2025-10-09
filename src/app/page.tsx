'use client';

import Link from 'next/link';
import * as React from 'react';

export default function HomePage() {
  const [project, setProject] = React.useState('client-test1');

  React.useEffect(() => {
    try {
      const v = localStorage.getItem('project:id');
      if (v) setProject(v);
    } catch {/* ignore */}
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">ESG-MASTER-01</h1>
        <p className="mt-1 text-sm text-gray-600">
          ESGLITE-01 prototype. Choose a module to continue.
        </p>
        <div className="mt-2 text-xs text-gray-500">Active project: <span className="font-medium">{project}</span></div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href={`/esglite?project=${encodeURIComponent(project)}`}
          className="rounded-lg border p-4 hover:bg-gray-50"
        >
          <div className="text-sm font-medium">ESGLITE Dashboard</div>
          <div className="text-xs text-gray-600">Overall progress, filters, section cards</div>
        </Link>

        <Link
          href={`/questionnaires/esglite/nodes?project=${encodeURIComponent(project)}`}
          className="rounded-lg border p-4 hover:bg-gray-50"
        >
          <div className="text-sm font-medium">Disclosures</div>
          <div className="text-xs text-gray-600">All sections &amp; items</div>
        </Link>

        <Link
          href={`/audit?project=${encodeURIComponent(project)}`}
          className="rounded-lg border p-4 hover:bg-gray-50"
        >
          <div className="text-sm font-medium">Audit log</div>
          <div className="text-xs text-gray-600">Recent activity</div>
        </Link>

        <Link
          href={`/wizard`}
          className="rounded-lg border p-4 hover:bg-gray-50"
        >
          <div className="text-sm font-medium">Wizard</div>
          <div className="text-xs text-gray-600">Quick setup flow</div>
        </Link>
      </div>
    </div>
  );
}
