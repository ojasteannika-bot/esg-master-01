import * as React from "react";

export function Card({ className = "", children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>{children}</div>;
}

export function CardHeader({ title, subtitle, className = "" }: { title: React.ReactNode; subtitle?: React.ReactNode; className?: string; }) {
  return (
    <div className={`border-b border-gray-100 p-4 sm:p-5 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
    </div>
  );
}

export function CardBody({ className = "", children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={`p-4 sm:p-5 ${className}`}>{children}</div>;
}
