// src/lib/cdm/derive.ts
import 'server-only';

/**
 * Võtab näiteks "B1-1" ja tagastab "B1".
 * Töötab ka "B2-3", "b3-7" (ka suurtähed).
 * Kui leiab ainult tähed (nt "B"), tagastab need.
 * Tagavarana võtab vasakpoolse osa kuni '-' ja puhastab.
 */
export function deriveSectionCode(code: string): string {
  const raw = (code || '').trim();

  // Esmalt proovi muster: tähed + numbrid (nt B1, AB12)
  const m = /^([A-Za-z]+[0-9]+)/.exec(raw);
  if (m) return m[1].toUpperCase();

  // Kui ainult tähed (nt "B")
  if (/^[A-Za-z]+$/.test(raw)) return raw.toUpperCase();

  // Tagavara: osa enne '-' ja puhasta
  const left = raw.split('-')[0] || raw;
  return left.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}
