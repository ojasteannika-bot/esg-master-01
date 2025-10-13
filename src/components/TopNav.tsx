"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Item = { label: string; href: string };

export default function TopNav({ items }: { items: Item[] }) {
  const sp = useSearchParams();
  const project = sp.get("project") ?? undefined;

  const toUrlObject = (href: string) => {
    const u = new URL(href, "http://d");
    if (project) u.searchParams.set("project", project);
    return { pathname: u.pathname, query: Object.fromEntries(u.searchParams.entries()) };
  };

  return (
    <div style={{ display: "flex", gap: 16, padding: 12 }}>
      {(items ?? []).map((it) => (
        <Link key={it.href} href={toUrlObject(it.href)}>
          {it.label}
        </Link>
      ))}
    </div>
  );
}
