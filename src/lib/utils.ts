import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCurrencySymbol(currencyCode: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
    JPY: "¥",
    CNY: "¥",
    AUD: "A$",
    CAD: "C$",
    CHF: "Fr",
    AED: "د.إ",
    SGD: "S$",
    MYR: "RM",
    THB: "฿",
  };
  return symbols[currencyCode.toUpperCase()] || currencyCode;
}

export function formatCurrency(amount: string | number, currencyCode: string): string {
  const symbol = getCurrencySymbol(currencyCode);
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) return `${symbol}0.00`;

  return `${symbol}${numAmount.toFixed(2)}`;
}

export function getCategoryBadgeColor(category: string): string {
  switch (category?.toLowerCase()) {
    case "travel tips":
      return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 shadow-blue-500/10 border-blue-500/20";
    case "destinations":
      return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 shadow-emerald-500/10 border-emerald-500/20";
    case "travel trends":
      return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 shadow-purple-500/10 border-purple-500/20";
    case "flight deals":
      return "bg-coral/10 text-coral hover:bg-coral/20 shadow-coral/10 border-coral/20";
    case "guides":
      return "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 shadow-cyan-500/10 border-cyan-500/20";
    default:
      return "bg-primary/10 text-primary hover:bg-primary/20 shadow-primary/10 border-primary/20";
  }
}
