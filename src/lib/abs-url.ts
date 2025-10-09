// src/lib/abs-url.ts
import { headers } from 'next/headers';

export function absUrl(path: string) {
  // Accept both "/api/..." and "api/..."
  const p = path.startsWith('/') ? path : `/${path}`;
  const h = headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3001';
  const proto = (h.get('x-forwarded-proto') ?? 'http').split(',')[0];
  return `${proto}://${host}${p}`;
}
