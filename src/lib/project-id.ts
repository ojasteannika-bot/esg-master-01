'use client';

const KEY = 'project_id';

export function getProjectId() {
  if (typeof window === 'undefined') return 'demo-project';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = 'demo-project-01';
    localStorage.setItem(KEY, id);
  }
  return id;
}
