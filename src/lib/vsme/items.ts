// src/lib/vsme/items.ts
import { readVsmeBundle } from "@/lib/vsme/schema";

/**
 * Ühtlustatud kuju vormi jaoks
 */
export type VsmeItem = {
  code: string;          // nt "B1-1"
  title: string;         // nt "Which VSME modules are included in the report?"
  type: "select" | "text" | "number" | "boolean";
  options?: Array<{ value: string; label: string }>;
  sectionCode?: string;  // nt "B1"
};

// püüame tuletada tüübi ja valikud resultx.ai-laadse JSONi põhjal
function normalizeType(node: any): VsmeItem["type"] {
  // heuristikad (vajadusel täpsustame hiljem):
  const t = node?.type || node?.attrs?.type || node?.inputType || node?.widget;
  const format = node?.format || node?.attrs?.format;

  if (t && typeof t === "string") {
    const s = t.toLowerCase();
    if (s.includes("select") || s.includes("options") || s.includes("choice")) return "select";
    if (s.includes("bool") || s.includes("checkbox") || s.includes("switch")) return "boolean";
    if (s.includes("number") || format === "number") return "number";
  }
  // kui on optionid olemas, eeldame select
  if (Array.isArray(node?.options) || Array.isArray(node?.attrs?.options)) return "select";
  return "text";
}

function normalizeOptions(node: any): Array<{ value: string; label: string }> | undefined {
  const opts = node?.options || node?.attrs?.options;
  if (!Array.isArray(opts)) return undefined;
  // lubame kujul ["A","B"] või [{value,label}]
  return opts.map((o: any) => {
    if (o && typeof o === "object") {
      return { value: String(o.value ?? o.id ?? o.code ?? o.key ?? o.label ?? ""), label: String(o.label ?? o.name ?? o.value ?? "") };
    }
    return { value: String(o), label: String(o) };
  });
}

/**
 * Leia üks item koodi järgi (nt "B1-1") ja normaliseeri vormi tarbeks.
 * Otsime bundle.nodes (sektsioonid) -> sektsiooni children -> itemid
 */
export function findItemByCode(code: string): VsmeItem | null {
  const bundle = readVsmeBundle();

  const root = Array.isArray(bundle?.nodes) ? bundle.nodes : [];
  for (const sec of root) {
    const sectionCode =
      sec?.code ?? sec?.id ?? sec?.key ?? sec?.attrs?.code ?? sec?.meta?.code;
    const items = Array.isArray(sec?.children) ? sec.children : [];

    for (const n of items) {
      const c =
        n?.code ?? n?.id ?? n?.key ?? n?.attrs?.code ?? n?.meta?.code;
      if (String(c).toLowerCase() === String(code).toLowerCase()) {
        const title =
          n?.title ?? n?.label ?? n?.name ?? n?.question ?? n?.text ?? String(c);
        const type = normalizeType(n);
        const options = normalizeOptions(n);
        return {
          code: String(c),
          title: String(title),
          type,
          options,
          sectionCode: String(sectionCode ?? ""),
        };
      }
    }
  }
  return null;
}
