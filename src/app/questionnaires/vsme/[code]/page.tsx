import Link from 'next/link';
import { getSectionMeta, getItems } from '@/lib/cdm/catalog';

type Params = { code: string };
type Search = { project?: string };

export default async function Page({
  params, searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { code } = await params;
  const { project: projectParam } = await searchParams;

  const section = getSectionMeta(code);
  if (!section) return <main className="max-w-5xl mx-auto p-6"><h1>Section not found</h1></main>;

  const project = projectParam ?? 'client-test1';
  const items = getItems(section.code);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <Link href="/questionnaires">&lt; Back</Link>
        <div>Project: <b>{project}</b></div>
      </div>

      <h1 style={{fontSize:28,fontWeight:800,letterSpacing:'-0.02em'}}>VSME – Section {section.code.toUpperCase()}</h1>
      <p className="text-[--color-text-muted]" style={{marginTop:8}}>{section.title}</p>

      <div className="mt-6 space-y-3">
        {items.map(it => (
          <div key={it.code} className="border border-[--color-border] rounded p-4">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div className="font-semibold">{it.title}</div>
              <Link className="btn" href={`/esglite/item/${it.code}?project=${encodeURIComponent(project)}`}>Open</Link>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-[--color-text-muted]">No items yet for this section.</div>}
      </div>
    </main>
  );
}
