'use client';

import Link from 'next/link';

export default function Page() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/questionnaires" className="px-3 py-1 rounded border">&larr; Back</Link>
        <h1 className="text-2xl font-semibold">CSRD (placeholder)</h1>
      </div>

      <div className="bg-white border rounded-2xl p-5">
        This is a placeholder for the CSRD questionnaire. Coming soon.
      </div>
    </div>
  );
}
