import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina múltiples clases CSS utilizando clsx y tailwind-merge.
 * @param inputs - Clases CSS que pueden ser strings, arrays o condicionales.
 * @returns Una string con las clases combinadas.
 */
export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}
