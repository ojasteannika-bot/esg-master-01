// src/lib/vsme/items.ts

/** Lihtsustatud VSME kirje, millega UI töötab */
export type VsmeItem = {
  code: string;                                        // nt "B1-2"
  title: string;                                       // inimesele loetav pealkiri
  type: "select" | "text" | "number" | "boolean";      // sisenditüüp
  options?: Array<{ value: string; label: string }>;   // valikute korral
  sectionCode?: string;                                // nt "B1"
};

/** Püüa järeldada tüüp stringi/attrs heuristikaga */
function guessType(node: any): VsmeItem["type"] {
  const t = String(
    node?.type ??
      node?.attrs?.type ??
      node?.inputType ??
      node?.widget ??
      ""
  ).toLowerCase();

  const fmt = String(node?.format ?? node?.attrs?.format ?? "").toLowerCase();

  if (t.includes("select") || t.includes("options") || t.includes("choice")) {
    return "select";
  }
  if (t.includes("bool") || t.includes("checkbox") || t.includes("switch")) {
    return "boolean";
  }
  if (t.includes("number") || fmt === "number") {
    return "number";
  }
  return "text";
}

/** Normalizeeri võimalikud "options" väärtused ühtsesse kuju */
function normalizeOptions(node: any): Array<{ value: string; label: string }> | undefined {
  const raw =
    node?.options ??
    node?.attrs?.options ??
    node?.choices ??
    node?.vals ??
    node?.opts;

  if (!Array.isArray(raw)) return undefined;

  return raw.map((o: any) => {
    if (o && typeof o === "object") {
      return {
        value: String(o.value ?? o.id ?? o.code ?? o.key ?? o.label ?? ""),
        label: String(o.label ?? o.name ?? o.title ?? o.value ?? ""),
      };
    }
    // string/number – tee {value,label} paar
    return { value: String(o), label: String(o) };
  });
}

/** Kaardista suvaline VSME “node” -> meie lihtsustatud VsmeItem */
export function toVsmeItem(node: any): VsmeItem | undefined {
  if (!node) return undefined;

  const code = String(node.code ?? node.key ?? node.id ?? "").trim();
  if (!code) return undefined;

  const title = String(
    node.title ?? node.label ?? node.name ?? node.question ?? node.text ?? code
  ).trim();

  const options = normalizeOptions(node);
  const type = guessType(node);
  const sectionCode = inferSectionCode(code); // normaalne (võib olla undefined)

  return { code, title, type, options, sectionCode };
}

/** Ekspordi ka sektsioonikoodi infer; normaliseeri null -> undefined */
export function inferSectionCode(itemCode: string | undefined): string | undefined {
  if (!itemCode) return undefined;
  const v = _infer(itemCode);        // _infer: tagastab string või null
  return v == null ? undefined : v;  // ära kunagi väljasta nulli
}

/** Sisemine heuristika: proovi koodist tuletada sektsiooni kood (nt "B1-2" -> "B1") */
function _infer(s: string): string | null {
  const src = String(s).trim();
  if (!src) return null;

  // Näited, mida tahame püüda:
  //  "B1-2" -> "B1"
  //  "B4_1" -> "B4"
  //  "A-3"  -> "A"
  //  "B1"   -> "B1"
  //  "INTRO_01" -> "INTRO"
  let m = src.match(/^([A-Za-z]+[0-9]+)(?:[-_].*)?$/);
  if (m) return m[1].toUpperCase();

  m = src.match(/^([A-Za-z]+)(?:[-_].*)?$/);
  if (m) return m[1].toUpperCase();

  return null;
}
