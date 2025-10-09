import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-xl w-full rounded-2xl border bg-white p-6 shadow-sm text-center">
        <div className="text-6xl font-extrabold text-slate-900">404</div>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">
          Page not found
        </h1>
        <p className="mt-2 text-slate-600">
          We couldn’t find the page you were looking for.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
