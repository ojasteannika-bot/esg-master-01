'use client';
export default function ProgressRing({
  percent, size = 48, stroke = 6
}: { percent:number; size?:number; stroke?:number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(100, percent));
  const dash = (p / 100) * c;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <filter id="s" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity=".12"/>
        </filter>
      </defs>
      <circle cx={size/2} cy={size/2} r={r} stroke="#e5e7ef" strokeWidth={stroke} fill="#fff" />
      <circle
        cx={size/2} cy={size/2} r={r}
        stroke={p===100 ? '#16a34a' : '#4f46e5'}
        strokeWidth={stroke} fill="none"
        strokeDasharray={`${dash} ${c - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ filter:'url(#s)' }}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
            fontSize={size*0.34} fontWeight={700} fill="#111827">
        {Math.round(p)}%
      </text>
    </svg>
  );
}
