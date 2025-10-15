import { use } from 'react';
import SectionClient from './SectionClient';

type SP = { project?: string };

export default function Page({ searchParams }: { searchParams: Promise<SP> }) {
  const params = use(searchParams);
  const project = params?.project ?? 'client-XYZ';
  return <SectionClient project={project} />;
}
