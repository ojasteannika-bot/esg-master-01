import { use } from 'react';
import Link from 'next/link';

type SP = { project?: string; prev?: string; next?: string };

export default function Page({ searchParams }: { searchParams: Promise<SP> }) {
  const p = use(searchParams);
  const project = p.project ?? 'client-XYZ';
  const prevCode = p.prev;
  const nextCode = p.next;

  return (
    <div className="container">
      <p><b>Project:</b> {project}</p>
      {/* sinu olemasolev vorm/fields jääb siia */}
      <nav style={{display:'flex', gap:8, marginTop:12}}>
        {prevCode && <Link className="btn" href={`/esglite/item/${prevCode}?project=${encodeURIComponent(project)}`}>← Prev</Link>}
        {nextCode && <Link className="btn" href={`/esglite/item/${nextCode}?project=${encodeURIComponent(project)}`}>Next →</Link>}
        <Link href={`/questionnaires/esglite/nodes?project=${encodeURIComponent(project)}`}>&larr; Back</Link>
      </nav>
    </div>
  );
}
