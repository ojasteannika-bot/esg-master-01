import { createClient } from "@/lib/supabase/client";

export type SectionStats = {
  totals: { empty: number; draft: number; final: number };
  byCode: Record<string, "empty" | "draft" | "final">;
};

export async function fetchSectionStats(project: string): Promise<SectionStats> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("cdm_records")
    .select("section_code,status")
    .eq("project_id", project);

  if (error) {
    // Return empty stats on error (keeps UI working)
    return { totals: { empty: 0, draft: 0, final: 0 }, byCode: {} };
  }

  const byCode: Record<string, "empty" | "draft" | "final"> = {};
  for (const r of data || []) {
    const st =
      (r as any)?.status === "final"
        ? "final"
        : (r as any)?.status === "draft"
        ? "draft"
        : "empty";
    byCode[(r as any).section_code] = st;
  }

  // Totals are computed later in the page by comparing to bundle; for convenience
  // we’ll count only rows present:
  const totals = {
    empty: 0,
    draft: (data || []).filter((x) => (x as any)?.status === "draft").length,
    final: (data || []).filter((x) => (x as any)?.status === "final").length,
  };
  return { totals, byCode };
}
