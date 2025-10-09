'use client';

import AiAssistCard from './AiAssistCard';
import EvidencePanel from './EvidencePanel';

type Props = { project: string; code: string };

export default function RightRail({ project, code }: Props) {
  return (
    <aside className="flex w-full flex-col gap-4 lg:sticky lg:top-4 lg:w-80">
      <AiAssistCard project={project} code={code} />
      <EvidencePanel project={project} code={code} />
    </aside>
  );
}
