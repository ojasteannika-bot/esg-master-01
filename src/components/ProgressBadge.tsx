'use client';
export default function ProgressBadge({ value, label }: { value?: number; label?: string }) {
  const pct = typeof value === 'number' ? Math.max(0, Math.min(100, value)) : undefined;
  return (
    <span
      style={{
        display:'inline-flex', alignItems:'center', gap:8,
        padding:'2px 8px', borderRadius:999, fontSize:12,
        background:'#eef2ff', color:'#3730a3', border:'1px solid #c7d2fe'
      }}
    >
      {label ?? 'Progress'}{pct !== undefined ? `: ${pct}%` : ''}
    </span>
  );
}
