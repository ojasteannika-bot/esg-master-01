"use client";

import React from "react";
import type { SectionStatus } from "@/lib/vsme/stats";

export default function ProgressBadge({ status }: { status?: SectionStatus }) {
  const s = status || "empty";

  const style: Record<SectionStatus, string> = {
    empty: "bg-slate-100 text-slate-600",
    draft: "bg-amber-100 text-amber-800",
    final: "bg-emerald-100 text-emerald-800",
  };

  const label: Record<SectionStatus, string> = {
    empty: "EMPTY",
    draft: "Draft",
    final: "Final",
  };

  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${style[s]}`}>
      {label[s]}
    </span>
  );
}
