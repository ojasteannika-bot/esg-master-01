import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

export default {
  content: [
    "./src/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        xl: "12px",
      },
    },
  },
  plugins: [forms],
} satisfies Config;
