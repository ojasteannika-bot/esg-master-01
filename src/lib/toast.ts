'use client';

export type ToastVariant = 'success' | 'warning' | 'error' | 'info';

export function toast(message: string, variant: ToastVariant = 'success', ttl = 3000) {
  if (typeof window === 'undefined') return;
  const ev = new CustomEvent('app:toast', { detail: { message, variant, ttl } });
  window.dispatchEvent(ev);
}
