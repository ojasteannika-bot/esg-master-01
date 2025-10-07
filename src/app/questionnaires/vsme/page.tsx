import Link from 'next/link';

export default function VsmeIndex() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">VSME — prototype</h1>
      <p className="text-slate-600">Sections A/B + B1 (dynamic)</p>

      <Link
        href="/questionnaires/vsme/a"
        className="inline-block rounded-2xl bg-emerald-600 px-4 py-2 text-white"
      >
        Go to Section A
      </Link>
    </div>
  );
}
