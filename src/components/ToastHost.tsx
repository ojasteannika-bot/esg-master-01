'use client';

import React, { useEffect, useMemo, useState } from 'react';

// Sama sündmuse API, mida kasutad: lib/toast.ts -> window.dispatchEvent(new CustomEvent('toast', {detail}))
type ToastKind = 'info' | 'success' | 'warning' | 'error';
type ToastPayload = { msg: string; kind?: ToastKind };

type ToastItem = {
  id: string;
  msg: string;
  kind: ToastKind;
};

function classFor(kind: ToastKind) {
  switch (kind) {
    case 'success':
      return 'bg-emerald-600 text-white';
    case 'warning':
      return 'bg-amber-500 text-black';
    case 'error':
      return 'bg-rose-600 text-white';
    default:
      return 'bg-slate-800 text-white';
  }
}

export default function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);

  // liitu window 'toast' sündmusega
  useEffect(() => {
    const handler = (ev: Event) => {
      const detail = (ev as CustomEvent<ToastPayload>).detail;
      if (!detail?.msg) return;
      const t: ToastItem = {
        id: crypto.randomUUID(),
        msg: detail.msg,
        kind: (detail.kind ?? 'info') as ToastKind,
      };
      setItems((prev) => [...prev, t]);

      // auto-dismiss 4s pärast
      setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== t.id));
      }, 4000);
    };

    window.addEventListener('toast' as any, handler as EventListener);
    return () => {
      window.removeEventListener('toast' as any, handler as EventListener);
    };
  }, []);

  const hasItems = useMemo(() => items.length > 0, [items.length]);

  if (!hasItems) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[1000] flex justify-center">
      <div className="w-full max-w-xl px-4">
        <div className="space-y-2">
          {(items ?? []).map((t) => (
            <div
              key={t.id}
              className={`pointer-events-auto rounded-lg px-4 py-3 shadow-lg ${classFor(
                t.kind
              )}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 text-sm">{t.msg}</div>
                <button
                  aria-label="Close"
                  onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
                  className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-black/20 text-white hover:bg-black/30"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
