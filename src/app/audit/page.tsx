import { use } from 'react';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/ui/PageHeader';
type SP = { project?: string };

export default function Page({ searchParams }: { searchParams: Promise<SP> }) {
  const p = use(searchParams); const project = p?.project ?? 'client-XYZ';
  return (
    <main className="rx-page">
      <Container>
        <PageHeader title="Audit log (demo)" subtitle={`Project: ${project}`} />
        <div className="rx-card">
          <div className="rx-sub" style={{marginBottom:12}}>No entries.</div>
          <form method="get" action="/api/audit" style={{display:'flex',gap:12}}>
            <input type="hidden" name="project" value={project}/>
            <button className="rx-btn">Open JSON</button>
          </form>
        </div>
      </Container>
    </main>
  );
}
