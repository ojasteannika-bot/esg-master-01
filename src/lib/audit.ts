import { getProjectId } from './project';

/** Väike helper – kui API /api/audit/add puudub, logime lihtsalt konsooli.
 *  Fail on oluline, et oleks NIMELT EKSPORDITUD logAudit (kompileerimisviga kaob).
 */
export async function logAudit(
  type: string,
  ctx?: string,
  data?: unknown
) {
  try {
    const projectId = getProjectId();
    // proovi saata, aga kui API’t pole, siis ära rakendust katkesta
    await fetch('/api/audit/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        ts: new Date().toISOString(),
        type,
        ctx,
        data,
      }),
    }).catch(() => {});
  } catch {
    // no-op
  }
}
