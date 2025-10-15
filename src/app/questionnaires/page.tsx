import { use } from 'react';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
type SP = { project?: string };

export default function Page({ searchParams }: { searchParams: Promise<SP> }) {
  const params = use(searchParams);
  const project = params?.project ?? 'client-XYZ';
  return (
    <main className="rx-page">
      <Container>
        <PageHeader title="Disclosures" subtitle={`Project: ${project}`} />
        <div className="rx-grid rx-grid-3">
          <Card title="Section A" subtitle="Company basics (demo)" footer={<Link className="rx-btn" href={`/questionnaires/esglite?project=${encodeURIComponent(project)}`}>Open</Link>} />
          <Card title="Section B" subtitle="Environmental (demo)" footer={<Link className="rx-btn" href={`/questionnaires/vsme?project=${encodeURIComponent(project)}`}>Open</Link>} />
          <Card title="Section B1" subtitle="Operational metrics (demo)" footer={<Link className="rx-btn" href={`/questionnaires/esglite/section?project=${encodeURIComponent(project)}`}>Open</Link>} />
        </div>
      </Container>
    </main>
  );
}
