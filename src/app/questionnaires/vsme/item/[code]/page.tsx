"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { debounce, saveItemJson } from "@/lib/cdm/client";

// NB! lihtne tüüp-mudel, sobib sinu VSME stubiga
type VsmeItem = {
  code: string;       // nt "B1-1"
  title: string;
  type: "select" | "boolean" | "number" | "text";
  options?: Array<{ value: string; label: string }>;
  sectionCode?: string; // nt "B1"
};

// Kui sul on serverist reaalne item loader, võid selle asendada.
// MVP: loeme koodist “mock” välja (või kasuta oma varasemat schema/items abi).
async function loadItem(code: string): Promise<VsmeItem> {
  // Minimock: oletame esimese B1-1 on select, B1-2 boolean, B1-3 text
  if (code === "B1-1") {
    return {
      code,
      title: "Which VSME modules are included?",
      type: "select",
      options: [
        { value: "A", label: "Module A" },
        { value: "B", label: "Module B" },
        { value: "A,B", label: "Both A and B" },
      ],
      sectionCode: "B1",
    };
  }
  if (code === "B1-2") {
    return {
      code,
      title: "Individual or consolidated?",
      type: "boolean",
      sectionCode: "B1",
    };
  }
  return {
    code,
    title: "Reporting perimeter notes",
    type: "text",
    sectionCode: "B1",
  };
}

export default function VsmeItemPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const params = useParams<{ code: string }>();

  const project = sp?.get("project") || "client-test1";
  const code = String(params?.code || "");

  const [item, setItem] = useState<VsmeItem | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [na, setNa] = useState<boolean>(false);
  const [saving, setSaving] = useState<"idle" | "saving" | "ok" | "err">("idle");

  // lae item meta
  useEffect(() => {
    let on = true;
    (async () => {
      const it = await loadItem(code);
      if (!on) return;
      setItem(it);
      // algväärtused (kui tahad, loe siit ka varasemaid vastuseid failist)
      setForm({});
      setNa(false);
    })().catch(() => {});
    return () => { on = false; };
  }, [code]);

  // debounced autosave
  const debouncedSave = useMemo(
    () =>
      debounce(async (payload: { project: string; code: string; answers: any }) => {
        try {
          setSaving("saving");
          await saveItemJson({ ...payload, status: "draft" });
          setSaving("ok");
        } catch {
          setSaving("err");
        }
      }, 600),
    []
  );

  // muutuste peale – autosave (draft)
  useEffect(() => {
    if (!item) return;
    const answers = { ...form, ...(na ? { _na: true } : {}) };
    debouncedSave({ project, code: item.code, answers });
  }, [project, item, form, na, debouncedSave]);

  // UI muutjad
  function setField(name: string, value: any) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSaveDraft() {
    if (!item) return;
    try {
      setSaving("saving");
      await saveItemJson({
        project,
        code: item.code,
        status: "draft",
        answers: { ...form, ...(na ? { _na: true } : {}) },
      });
      setSaving("ok");
    } catch {
      setSaving("err");
    }
  }

  async function onMarkFinal() {
    if (!item) return;
    try {
      setSaving("saving");
      await saveItemJson({
        project,
        code: item.code,
        status: "final",
        answers: { ...form, ...(na ? { _na: true } : {}) },
      });
      setSaving("ok");
      // kui naased sektsiooni, näeksid värsket progressi
      router.push(`/questionnaires/vsme/${item.sectionCode}?project=${encodeURIComponent(project)}`);
    } catch {
      setSaving("err");
    }
  }

  async function onReset() {
    if (!item) return;
    setForm({});
    setNa(false);
    try {
      setSaving("saving");
      await saveItemJson({
        project,
        code: item.code,
        status: "draft",
        answers: {},
      });
      setSaving("ok");
    } catch {
      setSaving("err");
    }
  }

  if (!item) {
    return (
      <main style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
        <h1 style={{ fontSize: 24, marginBottom: 16 }}>Loading…</h1>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>
          {item.code} — {item.title}
        </h1>
        <div style={{ fontSize: 12, color: "#666" }}>
          {saving === "saving" ? "Saving…" : saving === "ok" ? "Saved" : saving === "err" ? "Save failed" : ""}
        </div>
      </div>

      {/* Not applicable */}
      <label style={{ display: "inline-flex", gap: 8, alignItems: "center", margin: "8px 0 16px" }}>
        <input type="checkbox" checked={na} onChange={(e) => setNa(e.target.checked)} />
        Not applicable
      </label>

      {/* Vormi väli(d) – MVP: üks põhi-väli nimega q1 */}
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
        {item.type === "select" && (
          <div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Select one:</div>
            <select
              value={form.q1 ?? ""}
              onChange={(e) => setField("q1", e.target.value)}
              style={{ padding: 8, width: "100%", maxWidth: 420 }}
            >
              <option value="" />
              {(item.options ?? []).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {item.type === "boolean" && (
          <div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Choose:</div>
            <label style={{ display: "inline-flex", gap: 6, marginRight: 12 }}>
              <input
                type="radio"
                name="q1b"
                checked={form.q1 === true}
                onChange={() => setField("q1", true)}
              />
              Yes
            </label>
            <label style={{ display: "inline-flex", gap: 6 }}>
              <input
                type="radio"
                name="q1b"
                checked={form.q1 === false}
                onChange={() => setField("q1", false)}
              />
              No
            </label>
          </div>
        )}

        {item.type === "number" && (
          <div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Enter a number:</div>
            <input
              type="number"
              value={form.q1 ?? ""}
              onChange={(e) => setField("q1", e.target.value === "" ? "" : Number(e.target.value))}
              style={{ padding: 8, width: 200 }}
            />
          </div>
        )}

        {item.type === "text" && (
          <div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Notes:</div>
            <textarea
              rows={6}
              value={form.q1 ?? ""}
              onChange={(e) => setField("q1", e.target.value)}
              style={{ padding: 8, width: "100%", maxWidth: 680 }}
            />
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button onClick={onSaveDraft} style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8 }}>
          Save draft
        </button>
        <button
          onClick={onMarkFinal}
          style={{ padding: "8px 12px", border: "1px solid #111827", background: "#111827", color: "white", borderRadius: 8 }}
        >
          Mark final
        </button>
        <button
          onClick={onReset}
          style={{ padding: "8px 12px", border: "1px solid #ef4444", color: "#ef4444", borderRadius: 8 }}
        >
          Reset
        </button>
      </div>
    </main>
  );
}
