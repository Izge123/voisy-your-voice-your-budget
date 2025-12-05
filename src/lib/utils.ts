import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Currency symbols for CIS countries
export const CURRENCY_SYMBOLS: Record<string, string> = {
  // International
  USD: '$',
  EUR: '€',
  // CIS countries
  RUB: '₽',      // Russia
  BYN: 'Br',     // Belarus
  UAH: '₴',      // Ukraine
  KZT: '₸',      // Kazakhstan
  UZS: 'сўм',    // Uzbekistan
  AZN: '₼',      // Azerbaijan
  AMD: '֏',      // Armenia
  MDL: 'L',      // Moldova
  KGS: 'с',      // Kyrgyzstan
  TJS: 'смн',    // Tajikistan
  TMT: 'm',      // Turkmenistan
  GEL: '₾',      // Georgia
};

export function formatCurrency(
  amount: number,
  currency: string = 'USD'
): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const isNegative = amount < 0;
  const formatted = Math.abs(amount).toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return isNegative ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
}

export function getCurrencySymbol(currency: string = 'USD'): string {
  return CURRENCY_SYMBOLS[currency] || currency;
}
