'use client'

import React from 'react'

export default function QuestionHelp(props: {
  sectionCode: string
  questionKey?: string
  hint?: string
}) {
  return (
    <button
      type="button"
      title="Get AI help"
      aria-label="Get AI help"
      onClick={() => {
        const ev = new CustomEvent('ai:question-help', { detail: props })
        window.dispatchEvent(ev)
      }}
      className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs text-gray-600 hover:bg-gray-50"
    >
      ?
    </button>
  )
}
