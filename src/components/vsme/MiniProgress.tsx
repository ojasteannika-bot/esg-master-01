// src/components/vsme/MiniProgress.tsx
export default function MiniProgress({
  value,
  label,
}: {
  value: number; // 0..100
  label?: string;
}) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="w-full">
      {label ? (
        <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
          <span>{label}</span>
          <span>{v}%</span>
        </div>
      ) : (
        <div className="mb-1 flex justify-end text-xs text-gray-500">{v}%</div>
      )}
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div
          className="h-2 rounded-full bg-gray-900 transition-all"
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}
