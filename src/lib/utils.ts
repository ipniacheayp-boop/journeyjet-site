import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCurrencySymbol(currencyCode: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
    CNY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'Fr',
    AED: 'د.إ',
    SGD: 'S$',
    MYR: 'RM',
    THB: '฿',
  };
  return symbols[currencyCode.toUpperCase()] || currencyCode;
}

export function formatCurrency(amount: string | number, currencyCode: string): string {
  const symbol = getCurrencySymbol(currencyCode);
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return `${symbol}0.00`;
  
  return `${symbol}${numAmount.toFixed(2)}`;
}
