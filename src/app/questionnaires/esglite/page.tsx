import { redirect } from 'next/navigation';

export default function Page({ searchParams }: { searchParams: { project?: string }}) {
  const project = searchParams.project ?? 'client-test1';
  redirect(`/questionnaires/esglite/nodes?project=${encodeURIComponent(project)}`);
}
