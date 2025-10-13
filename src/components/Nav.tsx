// src/components/Nav.tsx
import Link from "next/link";

export default function Nav() {
  return (
    <nav className="border-b border-gray-200">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold">ESG-MASTER-01</Link>
        {/* parempoolne ala, nt project input */}
      </div>
    </nav>
  );
}
