'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Client() {
  const router = useRouter();
  const sp = useSearchParams();
  const project = sp.get('project') ?? 'client-test1';

  useEffect(() => {
    // suuname turvaliselt alalehele (nt disclosures)
    router.replace(`/questionnaires/vsme/disclosures?project=${encodeURIComponent(project)}`);
  }, [router, project]);

  return null;
}
