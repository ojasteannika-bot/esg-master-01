// src/app/questionnaires/vsme/nodes/page.tsx
// Server Component (Next.js 15): ei kasuta kliendi hooke.
// Loeb VSME bundle'i, kuvab sektsioonide kaardid ning progressi rõnga.

import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import ProgressSummary from "@/components/vsme/ProgressSummary";

/** Väga tolerantne koodi-otsija */
const CODE_RE = /^[A-Z][0-9]+(?:-\d+)?$/i;
const SECTION_RE = /^[A-Z][0-9]+$/i;

type AnyNode = any;

function readBundle(): AnyNode {
  const p = path.join(process.cwd(), "src/data/vsme/bundle.json");
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw);
}

function nodeCode(n: AnyNode): string | null {
  const c =
    n?.code ??
    n?.id ??
    n?.key ??
    n?.attrs?.code ??
    n?.attrs?.id ??
    n?.attrs?.key ??
    n?.meta?.code;
  if (typeof c === "string" && CODE_RE.test(c)) return c.toUpperCase();
  return null;
}

function nodeTitle(n: AnyNode): string {
  return (
    n?.title ??
    n?.name ??
    n?.label ??
    n?.text ??
    n?.heading ??
    n?.attrs?.title ??
    n?.attrs?.label ??
    ""
  );
}

function childrenOf(n: AnyNode): AnyNode[] {
  const kids = n?.nodes ?? n?.children ?? n?.items ?? [];
  return Array.isArray(kids) ? kids : [];
}

/** Kogu sektsioonid (B1, B2, B3...) – igaüks minimaalse infoga. */
function collectSections(root: AnyNode) {
  const sections: { code: string; title: string }[] = [];
  const stack: AnyNode[] = [root];

  while (stack.length) {
    const cur = stack.pop();
    if (!cur || typeof cur !== "object") continue;

    const code = nodeCode(cur);
    if (code && SECTION_RE.test(code)) {
      sections.push({ code, title: nodeTitle(cur) || `Section ${code}` });
    }
    childrenOf(cur).forEach((k) => stack.push(k));
  }

  // dedupe by code, keep first title
  const seen = new Set<string>();
  return sections.filter((s) => {
    if (seen.has(s.code)) return false;
    seen.add(s.code);
    return true;
  }).sort((a, b) => a.code.localeCompare(b.code, "en", { numeric: true }));
}

export default async function VsmeNodesPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const sp = await searchParams;
  const project = sp?.project || "client-test1";

  const bundle = readBundle();
  const sections = collectSections(bundle);

  return (
    <main className="container mx-auto px-6 py-6">
      {/* Breadcrumbs */}
      <div className="text-sm text-gray-500 mb-2">
        <Link href="/" className="hover:underline">ESG-MASTER-01</Link> /{" "}
        <span>Questionnaires</span> / <span className="text-gray-900">VSME sections</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">VSME sections</h1>
          <div className="text-xs text-gray-500">
            Source: <code>src/data/vsme/bundle.json</code>
          </div>
        </div>

        {/* Project valik GET päringuna (server-sõbralik) */}
        <form method="get" className="flex items-center gap-2">
          <label className="text-sm text-gray-600" htmlFor="project">Project:</label>
          <input
            id="project"
            name="project"
            defaultValue={project}
            className="w-48 rounded-md border border-gray-300 px-2 py-1 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Apply
          </button>
        </form>
      </div>

      {/* Progress ring */}
      <div className="mb-6 flex justify-end">
        <ProgressSummary project={project} />
      </div>

      {/* Sektsioonide kaardid */}
      {sections.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-600">
          No sections found in bundle. Double-check that
          {" "}
          <code>src/data/vsme/bundle.json</code> sisaldab puu <code>nodes/children</code>
          ja et elementidel on <code>code/id/key</code> (nt B1, B1-1, C3).
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sections.map((s) => (
            <section
              key={s.code}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    {s.title || `Section ${s.code}`}
                  </h2>
                  <div className="mt-1 text-xs text-gray-500">
                    Code: <span className="inline-block rounded bg-gray-100 px-1.5 py-0.5">{s.code}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Link
                  href={`/questionnaires/vsme/${encodeURIComponent(s.code)}?project=${encodeURIComponent(project)}`}
                  className="inline-flex items-center rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Open
                </Link>
                <span className="text-xs text-gray-500">generic view WIP</span>
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
