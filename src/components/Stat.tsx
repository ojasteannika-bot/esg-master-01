type Props = { label: string; value: string | number; hint?: string };
export default function Stat({ label, value, hint }: Props) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-card">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}
