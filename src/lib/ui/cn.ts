import { twMerge } from "tailwind-merge";

/** Merge'ib Tailwindi klassid ohutult. */
export function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(inputs.filter(Boolean).join(" "));
}
