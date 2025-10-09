import Link from "next/link";
import ProgressRing from "@/components/vsme/ProgressRing";
import MiniProgress from "@/components/vsme/MiniProgress";
import StatusPill from "@/components/vsme/StatusPill";
import { readVsmeBundle } from "@/lib/vsme/schema";

type VsmeNode = any;

function codeOf(n: VsmeNode): string | undefined {
  return n?.code ?? n?.id ?? n?.key ?? n?.attrs?.code ?? n?.meta?.code;
}
function titleOf(n: VsmeNode): string {
  return (
    n?.title ??
    n?.label ??
    n?.name ??
    n?.question ??
    n?.text ??
    String(codeOf(n) ?? "")
  );
}
function kids(n: VsmeNode): VsmeNode[] {
  return (n?.children || n?.items || n?.nodes || []) as VsmeNode[];
}
function isTopLevelSection(n: VsmeNode): boolean {
  // tõlgime top-level sektsiooniks: tal on code ning tal on lapsi
  return Boolean(codeOf(n)) && kids(n).length > 0;
}
function moduleOf(n: VsmeNode): "basic" | "comprehensive" | "other" {
  const c = (codeOf(n) || "").toUpperCase();
  if (c.startsWith("B")) return "basic";
  if (c.startsWith("C")) return "comprehensive";
  return "other";
}
function normalizeCode(x?: string): string {
  return (x || "").replace(/[–—−]/g, "-").toUpperCase().trim();
}

type SectionStat = {
  code: string;
  status: "empty" | "incomplete" | "complete";
  completed?: number;
  total?: number;
};

function statusToItemScore(stat?: SectionStat) {
  // kui API annab completed/total, kasuta seda (täpsem)
  if (
    stat &&
    typeof stat.completed === "number" &&
    typeof stat.total === "number" &&
    stat.total > 0
  ) {
    return { completed: stat.completed, total: stat.total };
  }
  // muidu: COMPLETE=1, muud=0 (MVP)
  return { completed: stat?.status === "complete" ? 1 : 0, total: 1 };
}

export default async function VsmeDashboard({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const bundle = await readVsmeBundle();
  const projectId =
    (typeof searchParams?.project === "string" && searchParams!.project) ||
    "client-test1";
  const activeFilter =
    (typeof searchParams?.module === "string" && searchParams!.module) ||
    "all"; // 'all' | 'basic' | 'comprehensive'

  const roots: VsmeNode[] = Array.isArray((bundle as any)?.nodes)
    ? (bundle as any).nodes
    : [];

  // võta top-level sektsioonid
  let sections = roots.filter(isTopLevelSection);
  if (activeFilter === "basic") {
    sections = sections.filter((s) => moduleOf(s) === "basic");
  } else if (activeFilter === "comprehensive") {
    sections = sections.filter((s) => moduleOf(s) === "comprehensive");
  }

  // küsi serveri poolelt statsid (sama API, mida juba kasutasime)
  let statusByCode = new Map<string, SectionStat>();
  try {
    const res = await fetch(
      `/api/vsme/section-stats?project=${encodeURIComponent(projectId)}`,
      { cache: "no-store" }
    );
    const json = await res.json();
    const list: SectionStat[] = json?.sections ?? [];
    for (const it of list) {
      statusByCode.set(normalizeCode(it.code), it);
    }
  } catch {
    // ignore – näitame 0% / EMPTY
  }

  // arvuta üldprogress: sum(leaf scores) / sum(leaf totals)
  let globalCompleted = 0;
  let globalTotal = 0;

  // iga top-level sektsiooni jaoks arvuta tema leafide progress
  const sectionProgress = sections.map((sec) => {
    const k = kids(sec);
    let completed = 0;
    let total = 0;

    // meie bundle’i korral on leafid tavaliselt top-level sektsiooni children
    for (const leaf of k) {
      const leafCode = normalizeCode(codeOf(leaf));
      const stat = statusByCode.get(leafCode);
      const s = statusToItemScore(stat);
      completed += s.completed;
      total += s.total;
    }

    globalCompleted += completed;
    globalTotal += Math.max(total, 1); // vältida /0 (kui mõnes sektsioonis pole lehte)

    const pct =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    // derive status sektsiooni jaoks
    let status: "empty" | "incomplete" | "complete" = "empty";
    if (pct >= 100) status = "complete";
    else if (pct > 0) status = "incomplete";

    return {
      code: codeOf(sec) as string,
      title: titleOf(sec),
      module: moduleOf(sec),
      completed,
      total,
      pct,
      status,
    };
  });

  const overallPct =
    globalTotal > 0 ? Math.round((globalCompleted / globalTotal) * 100) : 0;

  return (
    <main className="container mx-auto max-w-6xl p-6">
      {/* breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/questionnaires" className="hover:underline">
          Questionnaires
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">VSME Dashboard</span>
      </nav>

      {/* header: ring + filtrid */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
        <div className="flex items-center gap-6">
          <ProgressRing value={overallPct} size={96} stroke={10} />
          <div>
            <div className="text-2xl font-semibold">Overall progress</div>
            <div className="text-sm text-gray-500">
              Project:{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded">
                {projectId}
              </code>
            </div>
          </div>
        </div>

        <div className="inline-flex rounded-lg border overflow-hidden">
          <Link
            href={`/vsme?project=${encodeURIComponent(projectId)}&module=all`}
            className={`px-3 py-2 text-sm ${activeFilter === "all" ? "bg-black text-white" : "hover:bg-gray-50"}`}
          >
            All
          </Link>
          <Link
            href={`/vsme?project=${encodeURIComponent(projectId)}&module=basic`}
            className={`px-3 py-2 text-sm border-l ${activeFilter === "basic" ? "bg-black text-white" : "hover:bg-gray-50"}`}
          >
            Basic module
          </Link>
          <Link
            href={`/vsme?project=${encodeURIComponent(projectId)}&module=comprehensive`}
            className={`px-3 py-2 text-sm border-l ${activeFilter === "comprehensive" ? "bg-black text-white" : "hover:bg-gray-50"}`}
          >
            Comprehensive module
          </Link>
        </div>
      </div>

      {/* sektsioonide kaardid */}
      {sectionProgress.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-gray-500">
          No sections available in this bundle/filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {sectionProgress.map((s) => (
            <div key={s.code} className="rounded-xl border p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-gray-500">
                  Code:{" "}
                  <code className="bg-gray-100 px-1 py-0.5 rounded">
                    {s.code}
                  </code>
                </div>
                <StatusPill status={s.status} />
              </div>

              <div className="font-medium text-lg mb-3">{s.title}</div>

              <div className="mb-4">
                <MiniProgress value={s.pct} label="Progress" />
              </div>

              <div className="flex items-center justify-between">
                <Link
                  href={`/questionnaires/vsme/${encodeURIComponent(
                    s.code
                  )}?project=${encodeURIComponent(projectId)}`}
                  className="px-4 py-2 rounded-md bg-black text-white hover:bg-gray-800"
                >
                  Open
                </Link>
                <span className="text-xs text-gray-400">
                  {s.completed}/{s.total} answered
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
