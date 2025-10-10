'use client'

// Next 15: unwrap params & searchParams React.use()’ga
import { use, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type SP = { project?: string }
type PP = { section: string }

export default function Page({
  searchParams,
  params,
}: {
  searchParams: Promise<SP> | SP
  params: Promise<PP> | PP
}) {
  const sp = use(searchParams as any) as SP
  const pr = use(params as any) as PP
  const router = useRouter()
  const qp = useSearchParams()

  const project = sp?.project ?? 'client-test1'
  const section = pr?.section

  useEffect(() => {
    const url = `/questionnaires/esglite/${encodeURIComponent(section)}?project=${encodeURIComponent(project)}`
    router.replace(url)
  }, [router, section, project])

  // väike fallback, kui replace pole veel teinud
  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <p>Redirecting to section…</p>
      <p>
        If nothing happens, open{' '}
        <a href={`/questionnaires/esglite/${section}?project=${encodeURIComponent(project)}`}>
          this link
        </a>.
      </p>
    </main>
  )
}
