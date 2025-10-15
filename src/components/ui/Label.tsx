import * as React from "react";

export default function Label(
  { children, className = "" }: React.PropsWithChildren<{ className?: string }>
) {
  return (
    <label className={`mb-1 block text-sm font-medium text-[--color-text] ${className}`}>
      {children}
    </label>
  );
}
