import { use } from 'react';
import Link from 'next/link';

type SP = { project?: string };

export default function Page({ searchParams }: { searchParams: Promise<SP> }) {
  const params = use(searchParams);
  const project = params?.project ?? 'client-XYZ';

  return (
    <div className="section">
      <h1 className="h2" style={{marginBottom: 16}}>Questionnaires</h1>
      <p style={{marginBottom: 8}}>Project: <b>{project}</b></p>

      <div style={{display:'flex', gap:12}}>
        <Link href={`/get-report?project=${encodeURIComponent(project)}`} className="btn btn-primary">
          Generate report
        </Link>
        <Link href={`/questionnaires/vsme?project=${encodeURIComponent(project)}`} className="btn btn-ghost">
          Open VSME
        </Link>
        <Link href={`/questionnaires/esglite?project=${encodeURIComponent(project)}`} className="btn btn-ghost">
          Open ESGLite
        </Link>
      </div>
    </div>
  );
}
