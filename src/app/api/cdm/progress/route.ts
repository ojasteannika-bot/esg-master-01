// src/app/api/cdm/progress/route.ts
import 'server-only';
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

type BundleItem = { code: string; title?: string };
type BundleSection = { code: string; title?: string; items: BundleItem[] };
type Bundle = { sections: BundleSection[] };

function json(body: any, init?: number | ResponseInit) {
  const initObj: ResponseInit = typeof init === 'number' ? { status: init } : init ?? {};
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    ...initObj,
  });
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function makeAdmin() {
  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = requireEnv('SUPABASE_SERVICE_ROLE_KEY'); // server-only
  return createClient(url, key, { auth: { persistSession: false } });
}

function deriveSection(code: string): string {
  // "B1-1" -> "B1"; "b3-7" -> "B3"
  const m = code?.match?.(/^([A-Za-z]+[0-9]+)/);
  return (m?.[1] ?? code ?? '').toUpperCase();
}

async function loadBundle(): Promise<Bundle> {
  // loeme sinu VSME/ESGLite bundle’i (kohanda vajadusel teele)
  const p = path.join(process.cwd(), 'src', 'data', 'vsme', 'bundle.json');
  try {
    const raw = await fs.readFile(p, 'utf8');
    const parsed = JSON.parse(raw);
    // ootame struktuuri { sections: [ { code, items:[{code}...] } ] }
    if (parsed && Array.isArray(parsed.sections)) return parsed as Bundle;
  } catch {
    // ignore
  }
  // fallback tühi bundle — ei viska viga, lihtsalt total=0
  return { sections: [] };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const project = (url.searchParams.get('project') || '').trim();
    if (!project) return json({ ok: false, error: 'Missing project' }, 400);

    const supabase = makeAdmin();
    const bundle = await loadBundle();

    // 1) Eeldatav itemite kogus sektsiooni kohta (bundle põhjal)
    const expectedPerSection = new Map<string, number>();
    for (const sec of bundle.sections || []) {
      const s = (sec.code || '').toUpperCase();
      const items = Array.isArray(sec.items) ? sec.items : [];
      expectedPerSection.set(s, items.length);
    }

    // 2) Loeme DB-st kõik kirjed projekti kohta ja normaliseerime sektsiooni
    const { data, error } = await supabase
      .from('cdm_records')
      .select('code,status,section_code,updated_at')
      .eq('project_id', project);

    if (error) return json({ ok: false, error: error.message }, 500);

    type SecAgg = {
      final: number;
      draft: number;
      total: number; // bundle’ist
      updated_at: string | null;
    };
    const sections = new Map<string, SecAgg>();

    // init sektsioonid bundle’i põhjal (et ka 0-progress sektsioonid oleksid vastuses)
    for (const [sec, cnt] of expectedPerSection.entries()) {
      sections.set(sec, { final: 0, draft: 0, total: cnt, updated_at: null });
    }

    // 3) Agregeeri DB andmed
    for (const row of data || []) {
      const sec = (row.section_code ? String(row.section_code) : deriveSection(String(row.code))).toUpperCase();
      if (!/^[A-Z]+[0-9]+$/.test(sec)) continue; // filtreeri müra: peab olema nt B1, C3 jne

      // veendu, et sektsioon olemas kaardis (kui mitte, lisa total=0 – või soovi korral jäta vahele)
      if (!sections.has(sec)) sections.set(sec, { final: 0, draft: 0, total: expectedPerSection.get(sec) ?? 0, updated_at: null });

      const agg = sections.get(sec)!;
      if (row.status === 'final') agg.final += 1;
      else if (row.status === 'draft') agg.draft += 1;

      const ts = row.updated_at ? Date.parse(String(row.updated_at)) : NaN;
      if (!isNaN(ts)) {
        const prev = agg.updated_at ? Date.parse(agg.updated_at) : 0;
        if (ts > prev) agg.updated_at = new Date(ts).toISOString();
      }
    }

    // 4) Arvuta kogusumma ja protsendid
    let totalFinal = 0;
    let totalDraft = 0;
    let totalExpected = 0;
    let lastUpdated: string | null = null;

    const outSections: Record<
      string,
      { final: number; draft: number; total: number; pct: number; updated_at: string | null }
    > = {};

    for (const [sec, agg] of sections.entries()) {
      const pct = agg.total > 0 ? Math.round((agg.final / agg.total) * 100) : 0;
      outSections[sec] = { ...agg, pct };

      totalFinal += agg.final;
      totalDraft += agg.draft;
      totalExpected += agg.total;

      if (agg.updated_at) {
        const t = Date.parse(agg.updated_at);
        const prev = lastUpdated ? Date.parse(lastUpdated) : 0;
        if (t > prev) lastUpdated = new Date(t).toISOString();
      }
    }

    // 5) Sorteeri vastus võtmete järgi (B1, B2, …)
    const sortedKeys = Object.keys(outSections).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
    const sortedSections: typeof outSections = {};
    for (const k of sortedKeys) sortedSections[k] = outSections[k];

    return json({
      ok: true,
      project,
      totals: {
        final: totalFinal,
        draft: totalDraft,
        total: totalExpected,
        updated_at: lastUpdated,
        pct: totalExpected > 0 ? Math.round((totalFinal / totalExpected) * 100) : 0,
      },
      sections: sortedSections,
    });
  } catch (e: any) {
    return json({ ok: false, error: e?.message || 'Unexpected error' }, 500);
  }
}
