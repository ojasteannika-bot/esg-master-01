/* src/components/vsme/SectionStatsClient.tsx */
"use client";

import React from "react";

export function SectionStatsClient({ project }: { project: string }) {
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [totals, setTotals] = React.useState<{ empty: number; draft: number; final: number }>({
    empty: 0,
    draft: 0,
    final: 0,
  });

  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const r = await fetch(`/api/vsme/section-stats?project=${encodeURIComponent(project)}`, {
          cache: "no-store",
        });
        const j = await r.json();
        if (!r.ok || !j?.ok) throw new Error(j?.error ?? `HTTP ${r.status}`);
        const empty = j?.totals?.empty ?? 0;
        const draft = j?.totals?.draft ?? 0;
        const final = j?.totals?.final ?? 0;
        if (alive) setTotals({ empty, draft, final });
      } catch (e: any) {
        if (alive) setErr(e?.message ?? "Failed to load stats");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [project]);

  const Chip = ({ label, n, tone }: { label: string; n: number; tone: "gray" | "yellow" | "green" }) => {
    const colors =
      tone === "green"
        ? "bg-emerald-50 text-emerald-700"
        : tone === "yellow"
        ? "bg-amber-50 text-amber-700"
        : "bg-gray-100 text-gray-700";
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${colors}`}>
        {label} <b>{n}</b>
      </span>
    );
  };

  if (err) {
    return <span className="text-sm text-red-600">{err}</span>;
  }
  if (loading) {
    return <span className="text-sm text-gray-400">Loading…</span>;
  }
  return (
    <div className="flex items-center gap-3">
      <Chip label="Empty" n={totals.empty} tone="gray" />
      <Chip label="Draft" n={totals.draft} tone="yellow" />
      <Chip label="Final" n={totals.final} tone="green" />
    </div>
  );
}
