export default function Badge({ children, tone="brand" }: { children: React.ReactNode; tone?: "brand"|"gray"|"green"|"red" }) {
  const map = {
    brand: "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200",
    gray:  "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200",
    green: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    red:   "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
  } as const;
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs ${map[tone]}`}>{children}</span>;
}
