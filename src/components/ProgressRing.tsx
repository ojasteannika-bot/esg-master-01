// src/components/ProgressRing.tsx
'use client';

import * as React from 'react';

type Props = {
  value: number;        // 0..100
  size?: number;        // px
  stroke?: number;      // px
  label?: string;       // allteksti rida
};

export default function ProgressRing({ value, size = 96, stroke = 8, label }: Props) {
  const r = (size - stroke) / 2;
  const c = Math.PI * 2 * r;
  const clamped = Math.max(0, Math.min(100, value));
  const dash = (clamped / 100) * c;

  return (
    <div style={{ width: size, height: size }} className="relative">
      <svg width={size} height={size} className="block">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#E5E7EB"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#111827"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-lg font-semibold">{Math.round(clamped)}%</div>
        {label && <div className="text-[10px] text-gray-500">{label}</div>}
      </div>
    </div>
  );
}
