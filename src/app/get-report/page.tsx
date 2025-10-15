import { use } from 'react';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/ui/PageHeader';
type SP = { project?: string };

export default async function Page({ searchParams }: { searchParams: Promise<SP> }) {
  const params = await searchParams;
  const project = params?.project ?? 'client-XYZ';
  return (
    <main className="rx-page">
      <Container>
        <PageHeader title="Preview / PDF" subtitle={`Project: ${project}`} />
        <div className="rx-card">
          <form method="post" action="/api/pdf" style={{display:'flex',gap:12}}>
            <input type="hidden" name="project" value={project}/>
            <button className="rx-btn rx-btn-primary" type="submit">Test PDF API (empty)</button>
          </form>
          <form method="post" action="/api/pdf" style={{display:'flex',gap:12,marginTop:12}}>
            <input type="hidden" name="project" value={project}/>
            <input type="hidden" name="mode" value="full"/>
            <button className="rx-btn" type="submit">Send full payload (A+B)</button>
          </form>
        </div>
      </Container>
    </main>
  );
}
