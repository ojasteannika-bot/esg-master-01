// src/app/api/cdm/item/save/route.ts
/* Item save API (draft/final)
   POST body: { project: string, code: string, status: "draft"|"final", values: any }
   Returns: { ok: true, project, code, section_code, status } | { ok:false, error }
*/
import 'server-only'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

type SaveBody = {
  project?: string
  code?: string
  status?: 'draft' | 'final'
  values?: any
}

function json(body: any, init?: number | ResponseInit) {
  const initObj: ResponseInit =
    typeof init === 'number' ? { status: init } : init ?? {}
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    ...initObj,
  })
}

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env: ${name}`)
  return v
}

function makeAdmin() {
  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
  const key = requireEnv('SUPABASE_SERVICE_ROLE_KEY') // SERVER-ONLY!
  return createClient(url, key, { auth: { persistSession: false } })
}

function deriveSectionCode(code: string): string {
  // "B1-1" -> "B1", "b3-7" -> "B3"
  const m = code.match(/^([A-Za-z]+[0-9]+)/)
  return (m?.[1] ?? code).toUpperCase()
}

async function logAudit(
  supabase: ReturnType<typeof makeAdmin>,
  project: string,
  ctx: string,
  data: any
) {
  try {
    // Kohanda vastavalt sinu tegelikule audit tabelile/struktuurile
    await supabase.from('audit_log').insert({
      project,
      type: 'app:event',
      ctx,
      data,
    })
  } catch {
    // ignoreeri vaikselt, kui audit tabelit pole
  }
}

export async function POST(req: Request) {
  let body: SaveBody
  try {
    body = await req.json()
  } catch {
    return json({ ok: false, error: 'Invalid JSON body' }, 400)
  }

  const project = (body.project || '').trim()
  const code = (body.code || '').trim()
  const status = body.status

  if (!project) return json({ ok: false, error: 'Missing project' }, 400)
  if (!code) return json({ ok: false, error: 'Missing code' }, 400)
  if (status !== 'draft' && status !== 'final') {
    return json({ ok: false, error: 'Invalid status (use "draft" or "final")' }, 400)
  }

  const section_code = deriveSectionCode(code)
  const values = body.values ?? {}

  const supabase = makeAdmin()

  // Upsert payload: kirjutame kas draft või cdm välja,
  // hoides teist puutumata (kui tahad final puhul draft nullida, võid seda teha).
  const baseCols: any = {
    project_id: project,
    code,
    section_code,
    status, // "draft" | "final"
    updated_at: new Date().toISOString(),
  }

  const payload =
    status === 'final'
      ? { ...baseCols, cdm: values, draft: null }
      : { ...baseCols, draft: values }

  const { error } = await supabase
    .from('cdm_records')
    .upsert(payload, { onConflict: 'project_id,code' })

  if (error) {
    // Logi auditisse ka vea-case
    await logAudit(supabase, project, 'api:cdm:item:save:error', {
      code,
      section_code,
      status,
      error: error.message,
    })
    return json({ ok: false, error: error.message }, 500)
  }

  // Audit OK
  await logAudit(supabase, project, 'api:cdm:item:save', {
    code,
    section_code,
    status,
  })

  return json({ ok: true, project, code, section_code, status })
}
