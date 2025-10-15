"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition } from "react";

export default function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = new URLSearchParams(useSearchParams().toString());

  function setParam(k: string, v: string | null) {
    if (v === null) sp.delete(k);
    else sp.set(k, v);
    // Next 15: kasuta UrlObject’i
    startTransition(() => {
      router.replace(
        { pathname, query: Object.fromEntries(sp.entries()) },
        { scroll: false }
      );
    });
  }

  return (
    <div>
      {/* sinu filtrid, kutsu setParam(key, value) */}
    </div>
  );
}
