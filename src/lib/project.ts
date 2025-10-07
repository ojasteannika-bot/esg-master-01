'use client';

const KEY = 'project:id';

export function getProjectId(): string {
  if (typeof window === 'undefined') return 'demo-project-01';
  return localStorage.getItem(KEY) || 'demo-project-01';
}

export function setProjectId(id: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, id);
  window.dispatchEvent(new CustomEvent('project:change', { detail: id }));
}

export function onProjectChange(cb: (id: string) => void) {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => cb((e as CustomEvent<string>).detail);
  window.addEventListener('project:change', handler as any);
  return () => window.removeEventListener('project:change', handler as any);
}
