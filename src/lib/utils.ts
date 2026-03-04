import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhoneBR(input: string) {
  let digits = (input || '').replace(/\D/g, '');
  // Remove country code 55 for masking if present
  if (digits.startsWith('55') && digits.length > 11) {
    digits = digits.slice(2);
  }
  // (DD) 9xxxx-xxxx or (DD) xxxx-xxxx while typing
  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    // landline pattern: (DD) xxxx-xxxx
    return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
  }
  // mobile pattern: (DD) xxxxx-xxxx
  return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7,11)}`;
}

export function digitsOnlyPhone(input: string) {
  let d = (input || '').replace(/\D/g, '');
  if (d.startsWith('55') && d.length > 11) return d.slice(2);
  return d;
}
