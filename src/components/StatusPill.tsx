'use client';

export type ItemStatus = 'not_started' | 'partial' | 'ready';

const classes: Record<ItemStatus, string> = {
  not_started: 'bg-gray-100 text-gray-700',
  partial: 'bg-amber-100 text-amber-800',
  ready: 'bg-emerald-100 text-emerald-800',
};

const labels: Record<ItemStatus, string> = {
  not_started: 'Not started',
  partial: 'In progress',
  ready: 'Completed',
};

export default function StatusPill({ status }: { status: ItemStatus }) {
  const cls = classes[status] ?? classes.not_started;
  const label = labels[status] ?? labels.not_started;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
