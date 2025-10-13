import { readVsmeBundle } from "@/lib/vsme/schema";
import { toVsmeItem } from "@/lib/vsme/items";

/** Tagasta sektsiooni items lihtkujul; `sec` võib olla objekt või "B1"/"C2" jne */
export async function listSectionItems(sec: any): Promise<ReturnType<typeof toVsmeItem>[]> {
  let section: any = sec;

  if (!section || typeof section !== "object") {
    const code = String(sec ?? "").toUpperCase();
    const b = await readVsmeBundle();
    section = (b.sections ?? []).find((s: any) => String(s.code).toUpperCase() === code);
  }

  const rawItems: any[] =
    section?.items ?? section?.fields ?? section?.nodes ?? section?.children ?? [];

  return (rawItems ?? [])
    .map(toVsmeItem)
    .filter(Boolean) as ReturnType<typeof toVsmeItem>[];
}
