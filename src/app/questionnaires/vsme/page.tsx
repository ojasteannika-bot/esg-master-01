'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VsmeRootPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const project = sp.get('project') ?? 'client-test1';

  useEffect(() => {
    router.replace(`/questionnaires/vsme/disclosures?project=${encodeURIComponent(project)}`);
  }, [router, project]);

  // kerge fallback (ei renderda SSR-is midagi keerukat)
  return null;
}
