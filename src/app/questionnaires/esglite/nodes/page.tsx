import { use } from 'react';
import NodesClient from './NodesClient';

type SP = { project?: string };

export default function NodesPage({ searchParams }: { searchParams: Promise<SP> }) {
  // Next 15: unwrap searchParams Promise
  const params = use(searchParams);
  const project = params?.project ?? 'client-XYZ';

  return <NodesClient project={project} />;
}
