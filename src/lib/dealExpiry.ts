/**
 * Date-based eligibility for featured deals. All comparisons use UTC calendar
 * dates (YYYY-MM-DD) so the result is identical for every visitor timezone.
 * A deal stays active through the last day of its travel period, unless an
 * explicit earlier offer expiry date has passed. Creation date is ignored.
 */
export interface ExpirableDeal {
  departDate: string;
  returnDate?: string | null;
  expiresAt?: string | null;
}

export const utcToday = (now: Date = new Date()): string => now.toISOString().slice(0, 10);

const toDay = (value?: string | null): string | null => {
  if (!value) return null;
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(value);
  if (m) return m[1];
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};

export const isDealActive = (deal: ExpirableDeal, now: Date = new Date()): boolean => {
  const today = utcToday(now);
  const travelEnd = toDay(deal.returnDate) ?? toDay(deal.departDate);
  if (!travelEnd || travelEnd < today) return false;
  const expiry = toDay(deal.expiresAt);
  if (expiry && expiry < today) return false;
  return true;
};

export const activeDeals = <T extends ExpirableDeal>(deals: T[], now: Date = new Date()): T[] =>
  deals
    .filter((d) => isDealActive(d, now))
    .sort((a, b) => (toDay(a.departDate) ?? "").localeCompare(toDay(b.departDate) ?? ""));

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "15 Nov 2026" from a YYYY-MM-DD string, without timezone shifting. */
export const formatDealDate = (value: string): string => {
  const day = toDay(value);
  if (!day) return value;
  const [y, m, d] = day.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

export const formatDealRange = (from: string, to?: string | null): string =>
  to ? `${formatDealDate(from)} – ${formatDealDate(to)}` : formatDealDate(from);
