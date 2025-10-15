import { ESGLITE_ITEMS, ESGLITE_SECTIONS } from '@/lib/esglite';
import Link from 'next/link';
import { use } from 'react';
type SP = { s?: string; project?: string };
export default function Page({ searchParams }:{ searchParams: Promise<SP> }) {
  const p = use(searchParams);
  const project = p.project ?? 'client-XYZ';
  const sc = (p.s ?? 'A1') as any;
  const items = ESGLITE_ITEMS[sc] ?? [];
  const sec = ESGLITE_SECTIONS.find(x=>x.code===sc);
  return (
    <div className="section">
      <p><b>Project:</b> {project}</p>
      <h2>Section {sec?.code ?? sc}</h2>
      <table className="table">
        <thead><tr><th>Code</th><th>Title</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {items.map(it=>(
            <tr key={it.code}>
              <td>{it.code}</td>
              <td>{it.title}</td>
              <td>Not started</td>
              <td><Link className="btn btn-outline" href={`/esglite/item/${it.code}?project=${encodeURIComponent(project)}`}>Open</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p><Link href="/questionnaires/esglite/nodes">&larr; Back</Link></p>
    </div>
  );
}
