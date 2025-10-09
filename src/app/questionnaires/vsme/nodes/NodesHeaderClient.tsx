"use client";

import * as React from "react";
// Kui sinu ProjectPicker on teises asukohas, muuda rada vastavaks.
import ProjectPicker from "@/components/ProjectPicker";
// Need utiliidid PEAVAD jooksma kliendis; kui sul on teised nimed, kohanda:
import { getProjectId, onProjectChange } from "@/lib/project";

export default function NodesHeaderClient({
  initialProjectId,
}: {
  initialProjectId: string;
}) {
  const [projectId, setProjectId] = React.useState(initialProjectId);

  // Sünkrooni valik brauseri “project store’iga”
  React.useEffect(() => {
    try {
      const current = typeof getProjectId === "function"
        ? getProjectId()
        : initialProjectId;
      if (current && current !== projectId) setProjectId(current);
    } catch {
      /* ignore */
    }

    const off =
      typeof onProjectChange === "function"
        ? onProjectChange((id: string) => setProjectId(id))
        : undefined;

    return () => {
      if (typeof off === "function") off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProjectId]);

  return (
    <div className="min-w-[240px]">
      <ProjectPicker value={projectId} onChange={setProjectId} />
    </div>
  );
}
