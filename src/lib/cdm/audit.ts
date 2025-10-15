"use server";

/**
 * MVP: vormista auditilog ühe objekt-argumendiga.
 * Kui tahad päriselt salvestada, postita oma API-sse siin sees.
 */
export async function logAudit(ev: {
  type: string;
  page?: string;
  from?: string;
  to?: string;
  project?: string;
  data?: any;
}) {
  // TODO: tee POST /api/cdm/audit kui vaja
  // await fetch(await absUrl('/api/cdm/audit'), { method:'POST', body: JSON.stringify(ev) });
  return true;
}
