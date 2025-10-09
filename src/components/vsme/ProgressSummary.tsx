// src/components/vsme/ProgressSummary.tsx
import { headers } from "next/headers";
import ProgressRing from "@/components/vsme/ProgressRing";

type Props = { project: string };

async function fetchProgress(project: string) {
  const host = (await headers()).get("host") ?? "localhost:3000";
  const protocol = process.env.VERCEL ? "https" : "http";
  const url = `${protocol}://${host}/api/vsme/progress?project=${encodeURIComponent(project)}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Progress API failed: ${res.status}`);
  const json = await res.json();
  return json as { ok: boolean; total: number; completed: number; draft: number; final: number; empty: number };
}

export default async function ProgressSummary({ project }: Props) {
  let total = 0, completed = 0, draft = 0, final = 0, empty = 0;
  try {
    const data = await fetchProgress(project);
    if (data?.ok) ({ total, completed, draft, final, empty } = data);
  } catch {
    // swallow – kuvame lihtsalt 0d
  }

  return (
    <div className="flex items-center gap-6 rounded-xl border border-gray-200 px-4 py-3 bg-white">
      <ProgressRing total={total} done={completed} label="Overall progress" />
      <div className="flex items-center gap-3 text-sm">
        <span className="text-gray-600">Complete:</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">
          {final} final
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">
          {draft} draft
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
          {empty} not started
        </span>
      </div>
    </div>
  );
}
