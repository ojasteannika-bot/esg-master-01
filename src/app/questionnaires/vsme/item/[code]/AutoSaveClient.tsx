'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  project: string;
  code: string;
  section: string;
  formSelector?: string; // default '#vsme-item-form'
};

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let t: any;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export default function AutoSaveClient({
  project,
  code,
  section,
  formSelector = '#vsme-item-form',
}: Props) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [stamp, setStamp] = useState<string>('');
  const unsubRef = useRef<() => void>();

  useEffect(() => {
    const form = document.querySelector<HTMLFormElement>(formSelector);
    if (!form) return;

    const answerEl = form.querySelector<HTMLTextAreaElement | HTMLSelectElement>('textarea[name="answer"], select[name="answer"]');
    const notesEl = form.querySelector<HTMLTextAreaElement>('textarea[name="notes"]');

    if (!answerEl && !notesEl) return;

    const doSave = async () => {
      try {
        const answer =
          answerEl instanceof HTMLTextAreaElement
            ? answerEl.value
            : answerEl instanceof HTMLSelectElement
            ? answerEl.value
            : '';

        const notes = notesEl?.value ?? '';

        // ära salvesta tühja “no selection” väärtust (hoia võrdsena server-vormiga)
        if (answerEl instanceof HTMLSelectElement && answer === '') {
          return;
        }

        setStatus('saving');

        const res = await fetch('/api/vsme/item', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            project,
            code,
            section,
            status: 'draft',
            value: { answer },
            notes,
          }),
        });

        if (!res.ok) throw new Error(String(res.status));
        setStatus('saved');
        setStamp(new Date().toLocaleTimeString());
      } catch {
        setStatus('error');
      }
    };

    const debounced = debounce(doSave, 1200);

    const onChange = () => {
      setStatus('idle'); // kohe näitame, et on muutumas
      debounced();
    };

    answerEl?.addEventListener('input', onChange);
    answerEl?.addEventListener('change', onChange);
    notesEl?.addEventListener('input', onChange);
    notesEl?.addEventListener('change', onChange);

    unsubRef.current = () => {
      answerEl?.removeEventListener('input', onChange);
      answerEl?.removeEventListener('change', onChange);
      notesEl?.removeEventListener('input', onChange);
      notesEl?.removeEventListener('change', onChange);
    };

    return () => unsubRef.current?.();
  }, [project, code, section, formSelector]);

  const pill =
    status === 'saving'
      ? { cls: 'bg-amber-50 text-amber-700', text: 'Saving…' }
      : status === 'saved'
      ? { cls: 'bg-emerald-50 text-emerald-700', text: `Saved ${stamp}` }
      : status === 'error'
      ? { cls: 'bg-rose-50 text-rose-700', text: 'Save failed' }
      : { cls: 'bg-gray-100 text-gray-700', text: 'Idle' };

  return (
    <div className="text-xs">
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${pill.cls}`}>
        {pill.text}
      </span>
      <span className="ml-2 text-gray-500">Autosave (draft)</span>
    </div>
  );
}
