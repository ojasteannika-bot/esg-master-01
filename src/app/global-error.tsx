'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    try {
      const project =
        typeof window !== 'undefined'
          ? localStorage.getItem('project:id') || 'demo-project-01'
          : 'demo-project-01';

      fetch('/api/audit/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: project,
          type: 'error',
          ctx: 'app:global-error',
          data: {
            message: error?.message ?? 'unknown',
            digest: (error as any)?.digest ?? null,
            name: error?.name ?? 'Error',
          },
        }),
      }).catch(() => {});
    } catch (_) {}
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-xl w-full rounded-2xl border bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">
              App crashed
            </h1>
            <p className="mt-2 text-slate-600">
              An unrecoverable error occurred. We’ve logged it to the audit
              trail.
            </p>

            <div className="mt-4 rounded-md bg-slate-50 p-4 text-sm text-slate-700">
              <div className="font-mono break-words">
                {(error && error.message) || 'Error'}
              </div>
              {(error as any)?.digest ? (
                <div className="mt-2 text-xs text-slate-500">
                  digest: {(error as any).digest}
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex gap-3">
              <Link
                href="/"
                className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
