"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { VsmeQuestion } from "@/lib/vsme/schema";

type Props = {
  project: string;
  code: string;
  title: string;
  questions: VsmeQuestion[];
};

type RecordResp = {
  ok: boolean;
  record?: { data?: any; status?: string } | null;
  error?: string;
};

function Field({
  q,
  value,
  onChange,
}: {
  q: VsmeQuestion;
  value: any;
  onChange: (val: any) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-700">{q.label}</label>
      {q.type === "number" ? (
        <input
          type="number"
          className="w-full rounded-md border px-3 py-2"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        />
      ) : q.type === "select" ? (
        <select
          className="w-full rounded-md border px-3 py-2"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
        >
          <option value="">— select —</option>
          {(q.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          className="w-full rounded-md border px-3 py-2"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
        />
      )}
      {q.help && <p className="text-xs text-slate-500">{q.help}</p>}
    </div>
  );
}

export default function SectionGenericClient({ project, code, title, questions }: Props) {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"empty" | "draft" | "final">("empty");
  const [data, setData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState<"idle" | "draft" | "final">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const keys = useMemo(() => questions.map((q) => q.key), [questions]);

  // init load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const url = `/api/vsme/records?project=${encodeURIComponent(project)}&code=${encodeURIComponent(code)}`;
        const res = await fetch(url, { cache: "no-store" });
        const json: RecordResp = await res.json();
        if (!cancelled && json.ok) {
          const r = json.record ?? null;
          setData(r?.data ?? {});
          setStatus((r?.status as any) || "empty");
        }
      } catch (e) {
        // noop
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [project, code]);

  const onSave = async (kind: "draft" | "final") => {
    setSaving(kind);
    setMessage(null);
    try {
      const res = await fetch("/api/vsme/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: project,
          section_code: code,
          status: kind,
          data,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setStatus(kind);
        setMessage(kind === "final" ? "Saved as FINAL." : "Draft saved.");
      } else {
        setMessage(json.error || "Save failed.");
      }
    } catch (e: any) {
      setMessage(e.message || "Save failed.");
    } finally {
      setSaving("idle");
    }
  };

  if (loading) {
    return <p className="text-slate-600">Loading...</p>;
  }

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <span
          className={`rounded-full px-3 py-1 text-xs ${
            status === "final"
              ? "bg-emerald-100 text-emerald-800"
              : status === "draft"
              ? "bg-amber-100 text-amber-800"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {status.toUpperCase()}
        </span>
      </div>

      {questions.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-slate-600">
          No auto-discovered fields for this section in bundle. (Generic renderer WIP)
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {questions.map((q) => (
            <Field
              key={q.key}
              q={q}
              value={data[q.key]}
              onChange={(val) => setData((d) => ({ ...d, [q.key]: val }))}
            />
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          className="rounded-md border px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
          onClick={() => onSave("draft")}
          disabled={saving !== "idle"}
        >
          {saving === "draft" ? "Saving…" : "Save draft"}
        </button>
        <button
          className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-60"
          onClick={() => onSave("final")}
          disabled={saving !== "idle"}
        >
          {saving === "final" ? "Saving…" : "Save final"}
        </button>
        {message && <span className="text-sm text-slate-600">{message}</span>}
      </div>
    </div>
  );
}
