"use client";

import { useEffect, useMemo, useState } from "react";

type ItemMeta = {
  title?: string;
  type?: string;
  options?: Array<string | { value: string; label?: string }>;
};

type Props = { project: string; code: string; sectionCode: string; itemMeta: ItemMeta };

type LoadResp = {
  ok: boolean;
  item?: {
    project_id: string;
    code: string;
    section_code: string;
    status: "draft" | "final";
    value?: Record<string, any>;
    notes?: string | null;
  };
};

export default function ItemForm({ project, code, sectionCode, itemMeta }: Props) {
  const [answer, setAnswer] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const options = useMemo(() => {
    const raw = itemMeta?.options || [];
    return raw.map((opt) =>
      typeof opt === "string" ? { value: opt, label: opt } : { value: opt.value, label: opt.label || opt.value }
    );
  }, [itemMeta?.options]);

  const isSelect = options.length > 0 || itemMeta?.type === "select";

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/vsme/item?project=${encodeURIComponent(project)}&code=${encodeURIComponent(code)}`, { cache: "no-store" });
        const data: LoadResp = await res.json();
        if (data?.ok && data.item) {
          setAnswer(String(data.item.value?.answer ?? ""));
          setNotes(String(data.item.notes ?? ""));
        }
      } catch {}
    })();
  }, [project, code]);

  async function save(next: "draft" | "final") {
    setStatus("saving");
    try {
      const res = await fetch("/api/vsme/item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project,
          code,
          section_code: sectionCode,
          status: next,
          value: { answer },
          notes: notes || null,
        }),
      });
      const data = await res.json();
      setStatus(data?.ok ? "saved" : "error");
    } catch {
      setStatus("error");
    } finally {
      setTimeout(() => setStatus("idle"), 1200);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm mb-1">Project</label>
        <input value={project} readOnly className="w-full border rounded px-3 py-2" />
      </div>

      <div>
        <label className="block text-sm mb-1">Answer</label>
        {isSelect ? (
          <select className="w-full border rounded px-3 py-2" value={answer} onChange={(e) => setAnswer(e.target.value)}>
            <option value="" disabled>Select...</option>
            {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : (
          <textarea className="w-full border rounded px-3 py-2 min-h-[160px]" placeholder="Type your answer..." value={answer} onChange={(e) => setAnswer(e.target.value)} />
        )}
      </div>

      <div>
        <label className="block text-sm mb-1">Notes (optional)</label>
        <textarea className="w-full border rounded px-3 py-2 min-h-[100px]" placeholder="Optional notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => save("draft")} className="px-3 py-2 rounded bg-gray-900 text-white">Save draft</button>
        <button onClick={() => save("final")} className="px-3 py-2 rounded bg-emerald-600 text-white">Save final</button>
        <span className="text-sm opacity-70">{status === "saving" && "Saving..."}{status === "saved" && "Saved ✓"}{status === "error" && "Save failed"}</span>
      </div>
    </div>
  );
}
