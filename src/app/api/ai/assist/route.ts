import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/client'

type Body = {
  projectId: string
  mode?: 'general' | 'section' | 'question'
  sectionCode?: string
  questionKey?: string
  query?: string
  includeData?: boolean
}

const curatedTips: Record<string, { asks: string; where: string[]; how: string[] }> = {
  // key: `${sectionCode}.${questionKey}`
  'b1.notes': {
    asks: 'Kirjelda lühidalt märkused, eeldused või erijuhud, mis mõjutavad aruannet.',
    where: [
      'Meeskonna sisemärkmikud ja kommenteeritud arvutused',
      'Eelmise perioodi aruanded',
      'Audit/kooskõlastuse kirjavahetus'
    ],
    how: [
      'Hoia toon faktiline ja lühike (1–3 lauset).',
      'Viita vajadusel kuupäevadele või metoodika muudatustele.',
      'Väldi tundlikke isikuandmeid.'
    ]
  },
  'b1.target_year': {
    asks: 'Sisesta ESG sihtaasta (nt heitmete või protsesside eesmärk).',
    where: ['Strateegiadokument või juhtkonna kinnitatud plaan', 'Eelmise aasta plaanide ülevaade'],
    how: [
      'Kasuta neljakohalist aastat (YYYY).',
      'Veendu, et sihtaasta ei ole minevikus.',
      'Lisa märkused „Notes“ väljal, kui eesmärk on tingimuslik.'
    ]
  }
}

function renderAdvice(args: {
  mode: NonNullable<Body['mode']>
  sectionCode?: string
  questionKey?: string
  query?: string
  cdm?: any
}) {
  const k = `${(args.sectionCode || '').toLowerCase()}.${(args.questionKey || '').toLowerCase()}`
  const tip = curatedTips[k]

  const parts: string[] = []

  const head = args.mode === 'general'
    ? 'Here are some general tips for completing the VS/ VSME form.'
    : args.mode === 'section'
      ? `Section ${args.sectionCode?.toUpperCase()} — guidance`
      : `Question ${args.sectionCode?.toUpperCase()}/${args.questionKey} — guidance`

  parts.push(`**${head}**`)

  if (tip) {
    parts.push(`**What it asks**: ${tip.asks}`)
    parts.push('**Where to find data**')
    parts.push(...tip.where.map(s => `- ${s}`))
    parts.push('**How to answer**')
    parts.push(...tip.how.map(s => `- ${s}`))
  } else {
    parts.push('**What it asks**: Provide concise, verifiable information for this field.')
    parts.push('**Where to find data**')
    parts.push('- Internal spreadsheets / ledgers')
    parts.push('- Previous-year report and audit notes')
    parts.push('- Systems of record (accounting, energy meters, HRIS)')
    parts.push('**How to answer**')
    parts.push('- Keep it factual and short.')
    parts.push('- Use consistent units and year ranges.')
    parts.push('- Add brief notes if any assumptions were necessary.')
  }

  if (args.cdm && Object.keys(args.cdm).length) {
    const preview = JSON.stringify(args.cdm, null, 2)
    parts.push('')
    parts.push('**Your current data (preview)**')
    parts.push('```json')
    parts.push(preview.length > 600 ? preview.slice(0, 600) + ' ...' : preview)
    parts.push('```')
  }

  return parts.join('\n')
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body
    const mode: NonNullable<Body['mode']> = body.mode || 'general'
    if (!body.projectId) {
      return NextResponse.json({ ok: false, error: 'Missing projectId' }, { status: 400 })
    }

    // (MVP) vajadusel toome projekti viimase CDM drafti
    let cdm: any | undefined
    try {
      if (body.includeData && body.sectionCode) {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('cdm_records')
          .select('cdm_draft, cdm')
          .eq('project_id', body.projectId)
          .eq('section_code', body.sectionCode)
          .maybeSingle()

        if (error) throw error
        cdm = data?.cdm_draft || data?.cdm || undefined
        if (cdm && body.questionKey) {
          // kui küsitakse konkreetset välja, lõika preview kitsamaks
          const q = body.questionKey
          const narrowed: Record<string, unknown> = {}
          if (cdm && typeof cdm === 'object' && q in cdm) narrowed[q] = cdm[q]
          cdm = Object.keys(narrowed).length ? narrowed : cdm
        }
      }
    } catch (e) {
      // CDM-i lugemine ebaõnnestus ei ole kriitiline — jätkame ilma
    }

    const text = renderAdvice({
      mode,
      sectionCode: body.sectionCode,
      questionKey: body.questionKey,
      query: body.query,
      cdm
    })

    // Audit (läbi meie olemasoleva API)
    try {
      const url = new URL('/api/audit/add', req.url)
      await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          project_id: body.projectId,
          type: 'ai',
          ctx: mode,
          data: {
            section: body.sectionCode,
            question: body.questionKey,
            qlen: body.query?.length || 0
          }
        })
      })
    } catch {}

    return NextResponse.json({ ok: true, text })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 })
  }
}
