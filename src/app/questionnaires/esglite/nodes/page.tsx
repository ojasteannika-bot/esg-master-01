import { ESGLITE_SECTIONS } from '@/lib/esglite-sections';
import ProgressBadge from '@/components/ProgressBadge';

type SP = { project?: string };

export default async function Page({ searchParams }: { searchParams: Promise<SP> }) {
  const params = await searchParams;
  const project = params?.project ?? 'client-XYZ';

  const rows = await Promise.all(ESGLITE_SECTIONS.map(async (s) => {
    const r = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/cdm/progress?project=${encodeURIComponent(project)}&section=${s.code}`, { cache: 'no-store' })
      .then(r => r.json()).catch(() => ({ completed: 0, total: 0 }));
    return { ...s, done: r.completed ?? 0, total: r.total ?? 0 };
  }));

  return (
    <div className="section">
      <h1 className="h2" style={{marginBottom:16}}>Disclosures</h1>
      <p style={{marginBottom:8}}><b>Project:</b> {project}</p>
      <table className="table">
        <thead><tr><th>Code</th><th>Title</th><th>Progress</th><th /></tr></thead>
        <tbody>
          {rows.map(s => (
            <tr key={s.code}>
              <td>{s.code}</td>
              <td>{s.title}</td>
              <td><ProgressBadge done={s.done} total={s.total} /></td>
              <td>
                <a className="btn btn-outline" href={`/questionnaires/esglite/section?project=${encodeURIComponent(project)}&s=${encodeURIComponent(s.code)}`}>Open</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
