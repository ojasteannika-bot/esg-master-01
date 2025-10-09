'use client';
export default function Donut({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const r = 18;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  return (
    <svg viewBox="0 0 44 44" width="44" height="44">
      <circle cx="22" cy="22" r={r} stroke="#E5E7EB" strokeWidth="6" fill="none" />
      <circle cx="22" cy="22" r={r} stroke="#10B981" strokeWidth="6" fill="none"
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
        transform="rotate(-90 22 22)" />
      <text x="22" y="24" textAnchor="middle" fontSize="10" fill="#111827">{pct}%</text>
    </svg>
  );
}
