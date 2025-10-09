'use client'

import React from 'react'
import QuestionHelp from './ai/QuestionHelp'

export type VsmeField = {
  key: string
  label: string
  type: 'number' | 'text' | 'textarea'
  placeholder?: string
  suffix?: string
  colSpan?: 6 | 12
}

export type VsmeSection = {
  code: string
  fields: VsmeField[]
}

export default function VsmeForm(props: {
  section: VsmeSection
  value: Record<string, any>
  onChange(v: Record<string, any>): void
  disabled?: boolean
}) {
  const { section, value, onChange, disabled } = props

  const set = (k: string, v: any) => onChange({ ...value, [k]: v })

  return (
    <div className="grid grid-cols-12 gap-4">
      {section.fields.map((f) => {
        const span = f.colSpan || 6
        const common = (
          <>
            <label className="mb-1 flex items-center text-sm font-medium">
              <span>{f.label}</span>
              <QuestionHelp
                sectionCode={section.code}
                questionKey={f.key}
                hint={`Help for ${section.code}/${f.key}: ${f.label}`}
              />
            </label>
          </>
        )

        if (f.type === 'textarea') {
          return (
            <div key={f.key} className={`col-span-12`}>
              {common}
              <textarea
                disabled={disabled}
                className="h-28 w-full rounded border p-2 text-sm"
                placeholder={f.placeholder}
                value={value[f.key] ?? ''}
                onChange={(e) => set(f.key, e.target.value)}
              />
            </div>
          )
        }

        return (
          <div key={f.key} className={`col-span-${span}`}>
            {common}
            <div className="flex">
              <input
                disabled={disabled}
                type={f.type === 'number' ? 'number' : 'text'}
                className="w-full rounded border p-2 text-sm"
                placeholder={f.placeholder}
                value={value[f.key] ?? ''}
                onChange={(e) => set(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)}
              />
              {f.suffix && <span className="ml-2 self-center text-sm text-gray-500">{f.suffix}</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
