"use client";

import React, { useCallback, useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type Counts = { empty: number; draft: number; final: number };

const pills: Array<{ key: "all" | "empty" | "draft" | "final"; label: string }> = [
  { key: "all", label: "All" },
  { key: "empty", label: "EMPTY" },
  { key: "draft", label: "Draft" },
  { key: "final", label: "Final" },
];

export default function FilterBar({
  counts,
  project,
}: {
  counts: Counts;
  project: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const active = (searchParams.get("status") || "all") as "all" | "empty" | "draft" | "final";

  const totalsText = useMemo(() => {
    return `Empty ${counts.empty} · Draft ${counts.draft} · Final ${counts.final}`;
  }, [counts]);

  const onClick = useCallback(
    (key: "all" | "empty" | "draft" | "final") => {
      const sp = new URLSearchParams(searchParams.toString());
      if (key === "all") sp.delete("status");
      else sp.set("status", key);
      sp.set("project", project);
      startTransition(() => router.replace(`${pathname}?${sp.toString()}`, { scroll: false }));
    },
    [pathname, project, router, searchParams]
  );

  const base =
    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs border transition-colors";
  const activeCls = "bg-slate-900 text-white border-slate-900";
  const idleCls = "bg-white text-slate-700 border-slate-300 hover:bg-slate-50";

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div className="text-sm text-slate-600">{totalsText}</div>
      <div className="flex items-center gap-2">
        {pills.map((p) => (
          <button
            key={p.key}
            onClick={() => onClick(p.key)}
            disabled={isPending}
            className={`${base} ${active === p.key ? activeCls : idleCls}`}
          >
            {p.label}
            {p.key !== "all" && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                  p.key === "final"
                    ? "bg-emerald-100 text-emerald-800"
                    : p.key === "draft"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {p.key === "final"
                  ? counts.final
                  : p.key === "draft"
                  ? counts.draft
                  : counts.empty}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
