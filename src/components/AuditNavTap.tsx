'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getProjectId, onProjectChange } from '../lib/project';
import { logAudit } from '../lib/audit';

export default function AuditNavTap() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [project, setProject] = useState<string>(getProjectId());
  const lastKey = useRef<string>('');

  // kuula projektivahetust
  useEffect(() => onProjectChange(setProject), []);

  // logi, kui path/query/projekt muutub (ja väldi topeltlogi)
  useEffect(() => {
    const key = `${project}|${pathname}?${search?.toString() ?? ''}`;
    if (!pathname) return;

    if (key !== lastKey.current) {
      lastKey.current = key;
      // logi "nav" (ei tohi UX-i katkestada – logAudit juba püüab vead kinni)
      logAudit({
        project_id: project,
        type: 'nav',
        ctx: 'ui',
        data: { path: pathname, query: search?.toString() ?? '' },
      });
    }
  }, [pathname, search, project]);

  return null;
}
