'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { getProjectId, onProjectChange } from '../../lib/project';

type Mode = 'general' | 'section' | 'question';

export default function FloatingAssistant() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('general');
  const [section, setSection] = useState<string>('b1');
  const [question, setQuestion] = useState<string>('notes');
  const [query, setQuery] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<string>(getProjectId());

  useEffect(() => {
    // kuula ProjectPickeri muudatusi (lib/project.ts -> onProjectChange)
    const off = onProjectChange((id) => setProject(id));
    return off;
  }, []);

  const canSend = useMemo(() => {
    if (loading) return false;
    if (mode === 'general') return true;
    if (mode === 'section') return !!section;
    if (mode === 'question') return !!section && !!question;
    return false;
  }, [loading, mode, section, question]);

  async function send() {
    try {
      setLoading(true);
      setAnswer('');
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          projectId: project,
          mode,
          sectionCode: mode !== 'general' ? section : undefined,
          questionKey: mode === 'question' ? question : undefined,
          query,
          includeData: true,
        }),
      });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error || 'AI request failed');
      setAnswer(String(json.text || ''));
    } catch (e: any) {
      setAnswer(`⚠️ ${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  }

  // lihtne ujuv nupp + paneel
  return (
    <>
      {/* Ujuv nupp */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-black text-white shadow-lg hover:opacity-90"
        title="AI assistant"
        aria-label="AI assistant"
      >
        ?
      </button>

      {/* Paneel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[92vw] rounded-2xl border bg-white p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-semibold">AI assistant</div>
            <button
              className="rounded px-2 py-1 text-sm hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>

          {/* režiim */}
          <div className="mb-3 grid grid-cols-3 gap-2">
            <button
              onClick={() => setMode('general')}
              className={`rounded border px-2 py-1 text-sm ${mode === 'general' ? 'bg-gray-900 text-white' : 'bg-white'}`}
            >
              General
            </button>
            <button
              onClick={() => setMode('section')}
              className={`rounded border px-2 py-1 text-sm ${mode === 'section' ? 'bg-gray-900 text-white' : 'bg-white'}`}
            >
              Section
            </button>
            <button
              onClick={() => setMode('question')}
              className={`rounded border px-2 py-1 text-sm ${mode === 'question' ? 'bg-gray-900 text-white' : 'bg-white'}`}
            >
              Question
            </button>
          </div>

          {/* kontekstiväljad */}
          {mode !== 'general' && (
            <div className="mb-3 grid grid-cols-2 gap-2">
              <input
                className="rounded border px-2 py-1 text-sm"
                placeholder="section (e.g. b1)"
                value={section}
                onChange={e => setSection(e.target.value)}
              />
              {mode === 'question' && (
                <input
                  className="rounded border px-2 py-1 text-sm"
                  placeholder="question key (e.g. notes)"
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                />
              )}
            </div>
          )}

          {/* lisaküsimus */}
          <textarea
            className="mb-3 h-20 w-full resize-y rounded border p-2 text-sm"
            placeholder="Optional: what do you need help with?"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />

          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs text-gray-500">Project: <span className="font-mono">{project}</span></div>
            <button
              disabled={!canSend}
              onClick={send}
              className={`rounded px-3 py-1 text-sm text-white ${canSend ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              {loading ? 'Thinking…' : 'Ask'}
            </button>
          </div>

          {/* vastus */}
          {!!answer && (
            <div className="max-h-64 overflow-auto rounded border bg-gray-50 p-2 text-sm">
              <pre className="whitespace-pre-wrap break-words">{answer}</pre>
            </div>
          )}
        </div>
      )}
    </>
  );
}
