'use client';

import Link from 'next/link';
import { useEffect } from 'react';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: Props) {
  // logi auditisse (best-effort)
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
          ctx: 'app:error',
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
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-xl w-full rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Something went wrong
        </h1>
        <p className="mt-2 text-slate-600">
          We hit an unexpected error while rendering this page.
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
          <button
            onClick={() => reset()}
            className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-lg border px-4 py-2 text-slate-700 hover:bg-slate-50"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
