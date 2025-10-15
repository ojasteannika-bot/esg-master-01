export default function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      className="w-full min-h-[140px] rounded-lg border border-[--color-border] bg-white px-3 py-2 text-sm outline-none
                 ring-0 focus:border-brand-400 focus:ring-2 focus:ring-brand-200 transition"
      {...props}
    />
  );
}
