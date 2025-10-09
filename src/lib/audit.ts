'use client';

export type AuditEntryInput = {
  project_id: string;
  type: string;   // 'save' | 'nav' | 'field' | 'test' | ...
  ctx?: string;
  data?: any;
};

export async function logAudit(input: AuditEntryInput) {
  try {
    await fetch('/api/audit/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  } catch {
    // vaikne – audit ei tohi UX-i katkestada
  }
}
