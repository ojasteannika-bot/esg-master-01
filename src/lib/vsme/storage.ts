// src/lib/vsme/storage.ts
import { createClient } from '@/lib/supabase/client';

export type SaveStatus = 'draft' | 'final';

export type SaveSectionPayload = {
  projectId: string;
  code: string;             // nt "B1-1" või lihtsalt "B1"
  values: Record<string, any>;
  status: SaveStatus;       // 'draft' | 'final'
};

export async function saveSectionToSupabase(input: SaveSectionPayload) {
  const { projectId, code, values, status } = input;
  const supabase = createClient();

  // 1) Audit
  await supabase.from('audit_entries').insert({
    project_id: projectId,
    type: 'save',
    ctx: 'vsme',
    data: { code, status, values },
  });

  // 2) CDM kirje (MVP: 1 rida / sektsioon / staatus)
  const key = `vsme:${code}:${status}`;
  const { error } = await supabase.from('cdm_records').insert({
    project_id: projectId,
    key,
    value: values, // jsonb
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }
  return { ok: true as const };
}

/**
 * Lae sektsiooni väärtused.
 * Loogika:
 *  - kui FINAL olemas => tagasta see
 *  - muidu kui DRAFT olemas => tagasta see
 *  - muidu tühi objekt
 */
export async function loadSectionFromSupabase(projectId: string, code: string) {
  const supabase = createClient();

  const keys = [`vsme:${code}:final`, `vsme:${code}:draft`];

  const { data, error } = await supabase
    .from('cdm_records')
    .select('key, value')
    .eq('project_id', projectId)
    .in('key', keys);

  if (error) {
    return { ok: false as const, error: error.message, values: {} as Record<string, any>, source: null as null | 'final' | 'draft' };
  }

  // eelistame final -> draft
  const finalRow = data?.find((r) => r.key === keys[0]);
  if (finalRow) {
    return { ok: true as const, values: (finalRow as any).value ?? {}, source: 'final' as const };
  }

  const draftRow = data?.find((r) => r.key === keys[1]);
  if (draftRow) {
    return { ok: true as const, values: (draftRow as any).value ?? {}, source: 'draft' as const };
  }

  return { ok: true as const, values: {}, source: null };
}
