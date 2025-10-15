export default function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full rounded-lg border border-[--color-border] bg-white px-3 py-2 text-sm outline-none
                 ring-0 focus:border-brand-400 focus:ring-2 focus:ring-brand-200 transition"
      {...props}
    />
  );
}
