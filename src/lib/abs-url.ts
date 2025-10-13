import { headers } from "next/headers";

export type AbsUrlQuery = Record<string, string | number | boolean | null | undefined>;

/**
 * Build absolute URL using request headers (Next 15: await headers()).
 * Usage: const url = await absUrl("/api/cdm/audit.summary", { project, limit: 50 });
 */
export async function absUrl(path: string, query?: AbsUrlQuery): Promise<string> {
  const h = await headers(); // must be awaited in Next 15
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3001";
  const proto = h.get("x-forwarded-proto") ?? "http";

  const sp = new URLSearchParams();
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) sp.set(k, String(v));
    }
  }

  const qs = sp.toString();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${proto}://${host}${p}${qs ? `?${qs}` : ""}`;
}
