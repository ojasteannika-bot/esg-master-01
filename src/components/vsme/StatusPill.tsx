// src/components/vsme/StatusPill.tsx
export default function StatusPill({ status }: { status: "final" | "draft" | "empty" }) {
  const cls =
    status === "final"
      ? "bg-emerald-50 text-emerald-700"
      : status === "draft"
      ? "bg-amber-50 text-amber-700"
      : "bg-gray-100 text-gray-700";
  const label = status === "final" ? "FINAL" : status === "draft" ? "DRAFT" : "EMPTY";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
