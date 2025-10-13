import Link from "next/link";

type BtnProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  size?: "sm" | "md";
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  type?: "button" | "submit" | "reset";
};

const base =
  "inline-flex items-center justify-center rounded-md font-medium transition-colors " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-400 " +
  "disabled:opacity-50 disabled:pointer-events-none";

const sizes = { sm: "h-8 px-3 text-sm", md: "h-10 px-4 text-sm" };

const variants = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 !no-underline",
  secondary: "bg-white text-[--color-text] border border-[--color-border] hover:bg-gray-50 !no-underline",
  ghost: "bg-transparent text-[--color-text] hover:bg-black/5 !no-underline",
} as const;

export default function Button({ children, href, onClick, size="md", variant="primary", className="", type="button" }: BtnProps) {
  const cls = `${base} ${sizes[size]} ${variants[variant]} ${className}`;
  return href ? (
    <Link href={href} className={cls}>{children}</Link>
  ) : (
    <button type={type} onClick={onClick} className={cls}>{children}</button>
  );
}
