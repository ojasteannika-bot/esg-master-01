// src/app/esglite/page.client.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PageClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const project = sp.get('project') ?? 'client-test1';

  useEffect(() => {
    router.replace(
      `/questionnaires/esglite/nodes?project=${encodeURIComponent(project)}`
    );
  }, [router, project]);

  return null;
}
