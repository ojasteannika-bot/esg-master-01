/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:"#eef2ff",100:"#e0e7ff",200:"#c7d2fe",300:"#a5b4fc",
          400:"#818cf8",500:"#6366f1",600:"#4f46e5",700:"#4338ca",
          800:"#3730a3",900:"#312e81",
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  safelist: [
    "min-h-screen","mx-auto","max-w-6xl","px-4","py-8",
    "rounded-xl","border","border-gray-200","bg-white","shadow-sm",
    "border-b","border-gray-100","p-4","sm:p-5","text-lg","font-semibold","text-gray-900",
    "mt-1","text-sm","text-gray-500",
    "grid","gap-4","sm:grid-cols-2",
    "inline-flex","items-center","justify-center","rounded-md","font-medium",
    "transition-colors","focus:outline-none","focus-visible:ring-2",
    "focus-visible:ring-offset-2","focus-visible:ring-brand-400",
    "disabled:opacity-50","disabled:pointer-events-none",
    "h-8","px-3","text-sm","h-10","px-4",
    "bg-brand-600","text-white","hover:bg-brand-700","no-underline",
    "bg-white","text-[--color-text]","border-[--color-border]","hover:bg-gray-50",
    "bg-transparent","hover:bg-black/5",
  ],
  plugins: [],
};
