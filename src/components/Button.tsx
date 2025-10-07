import React from "react";
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" };
export default function Button({ variant="primary", className="", ...rest }: Props) {
  const base = "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition";
  const styles = variant === "primary"
    ? "bg-brand-600 hover:bg-brand-700 text-white"
    : "border border-slate-300 hover:bg-slate-50 text-slate-700";
  return <button className={`${base} ${styles} ${className}`} {...rest} />;
}
