export default function StatusBadge({ percent }: { percent: number }) {
  const tone = percent >= 90 ? "bg-emerald-100 text-emerald-700 border-emerald-200"
    : percent >= 50 ? "bg-amber-100 text-amber-700 border-amber-200"
    : "bg-gray-100 text-gray-700 border-gray-200";
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${tone}`}>
      {percent}% complete
    </span>
  );
}
