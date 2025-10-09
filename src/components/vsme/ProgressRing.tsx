// src/components/vsme/ProgressRing.tsx
'use client';

type Props = { value: number; size?: number };
export default function ProgressRing({ value, size = 48 }: Props) {
  const clamped = Math.max(0, Math.min(100, value ?? 0));
  const r = (size - 8) / 2;              // padding for stroke
  const c = 2 * Math.PI * r;
  const dash = (clamped / 100) * c;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#eee" strokeWidth="6" fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="currentColor"
        strokeWidth="6"
        fill="none"
        strokeDasharray={`${dash} ${c - dash}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={size * 0.28}
        fill="currentColor"
      >
        {Math.round(clamped)}%
      </text>
    </svg>
  );
}
