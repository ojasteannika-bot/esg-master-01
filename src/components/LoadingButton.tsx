'use client';
import React from 'react';

type LoadingButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Kui true, näitab spinnerit ja teeb nupu “disabled” */
  loading?: boolean;
  /** Värviskeem */
  variant?: 'primary' | 'secondary' | 'ghost';
};

function classesFor(variant: LoadingButtonProps['variant'], disabled?: boolean) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors outline-none';
  const dis = disabled ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90';

  switch (variant) {
    case 'secondary':
      return `${base} bg-slate-900 text-white ${dis}`;
    case 'ghost':
      return `${base} border border-slate-300 bg-white text-slate-900 ${dis}`;
    default:
      // primary
      return `${base} bg-emerald-600 text-white ${dis}`;
  }
}

export default function LoadingButton({
  children,
  loading = false,
  variant = 'primary',
  className = '',
  disabled,
  ...rest
}: LoadingButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...rest}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`${classesFor(variant, isDisabled)} ${className}`}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      <span>{children}</span>
    </button>
  );
}
