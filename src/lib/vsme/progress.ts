// src/lib/vsme/progress.ts
// Arvutab sektsiooni progressi, kasutades cdm_records tabelit (anon RLS lubatud).

import { createClient } from "@supabase/supabase-js";
import { listSectionItems } from "./schema";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Stat = {
  total: number;
  final: number;
  draft: number;
  not_started: number;
  pct: number; // final/total * 100
};

export async function getSectionStats(project: string, sectionCode: string): Promise<Stat> {
  const sec = sectionCode.toUpperCase();
  const items = listSectionItems(sec);
  const total = items.length;

  if (total === 0) {
    return { total: 0, final: 0, draft: 0, not_started: 0, pct: 0 };
  }

  // loeme kõik kirjed sellest sektsioonist projekti kaupa
  const { data, error } = await supabase
    .from("cdm_records")
    .select("code,status,updated_at,section_code")
    .eq("project_id", project)
    .eq("section_code", sec);

  if (error) {
    // ohutu fallback
    return { total, final: 0, draft: 0, not_started: total, pct: 0 };
  }

  // Võtame iga koodi kohta viimase staatuse (final > draft)
  const byCode = new Map<
    string,
    { status: "final" | "draft"; updated_at: string }
  >();

  for (const row of data || []) {
    const code = String(row.code).toUpperCase();
    const s = (row.status as "final" | "draft") || "draft";
    const ts = row.updated_at || "1970-01-01T00:00:00Z";

    const prev = byCode.get(code);
    if (!prev) {
      byCode.set(code, { status: s, updated_at: ts });
    } else {
      // eelis: 'final' > 'draft', või hilisem timestamp
      if (prev.status === "draft" && s === "final") {
        byCode.set(code, { status: s, updated_at: ts });
      } else if (prev.status === s && ts > prev.updated_at) {
        byCode.set(code, { status: s, updated_at: ts });
      }
    }
  }

  let final = 0;
  let draft = 0;
  for (const item of items) {
    const code = String(item.code).toUpperCase();
    const rec = byCode.get(code);
    if (!rec) continue;
    if (rec.status === "final") final++;
    else draft++;
  }
  const not_started = total - (final + draft);
  const pct = Math.round((final / Math.max(total, 1)) * 100);

  return { total, final, draft, not_started, pct };
}
