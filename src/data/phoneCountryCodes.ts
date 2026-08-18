export interface PhoneCountry {
  /** ISO 3166-1 alpha-2 */
  iso: string;
  name: string;
  /** International dialling code, including the leading "+" */
  dial: string;
  /** Expected national number length range (digits, excluding dial code) */
  min: number;
  max: number;
}

/** Countries whose phone numbers Tripile accepts at signup and checkout. */
export const PHONE_COUNTRIES: PhoneCountry[] = [
  { iso: "US", name: "United States", dial: "+1", min: 10, max: 10 },
  { iso: "CA", name: "Canada", dial: "+1", min: 10, max: 10 },
  { iso: "IN", name: "India", dial: "+91", min: 10, max: 10 },
  { iso: "GB", name: "United Kingdom", dial: "+44", min: 9, max: 11 },
  { iso: "IE", name: "Ireland", dial: "+353", min: 7, max: 10 },
  { iso: "AU", name: "Australia", dial: "+61", min: 9, max: 10 },
  { iso: "NZ", name: "New Zealand", dial: "+64", min: 8, max: 10 },
  { iso: "AE", name: "United Arab Emirates", dial: "+971", min: 8, max: 9 },
  { iso: "SA", name: "Saudi Arabia", dial: "+966", min: 9, max: 9 },
  { iso: "QA", name: "Qatar", dial: "+974", min: 8, max: 8 },
  { iso: "SG", name: "Singapore", dial: "+65", min: 8, max: 8 },
  { iso: "MY", name: "Malaysia", dial: "+60", min: 9, max: 10 },
  { iso: "TH", name: "Thailand", dial: "+66", min: 8, max: 9 },
  { iso: "ID", name: "Indonesia", dial: "+62", min: 9, max: 12 },
  { iso: "PH", name: "Philippines", dial: "+63", min: 9, max: 10 },
  { iso: "JP", name: "Japan", dial: "+81", min: 9, max: 10 },
  { iso: "KR", name: "South Korea", dial: "+82", min: 9, max: 10 },
  { iso: "CN", name: "China", dial: "+86", min: 11, max: 11 },
  { iso: "HK", name: "Hong Kong", dial: "+852", min: 8, max: 8 },
  { iso: "LK", name: "Sri Lanka", dial: "+94", min: 9, max: 9 },
  { iso: "NP", name: "Nepal", dial: "+977", min: 9, max: 10 },
  { iso: "BD", name: "Bangladesh", dial: "+880", min: 9, max: 10 },
  { iso: "PK", name: "Pakistan", dial: "+92", min: 9, max: 10 },
  { iso: "DE", name: "Germany", dial: "+49", min: 9, max: 11 },
  { iso: "FR", name: "France", dial: "+33", min: 9, max: 9 },
  { iso: "ES", name: "Spain", dial: "+34", min: 9, max: 9 },
  { iso: "IT", name: "Italy", dial: "+39", min: 9, max: 11 },
  { iso: "NL", name: "Netherlands", dial: "+31", min: 9, max: 9 },
  { iso: "CH", name: "Switzerland", dial: "+41", min: 9, max: 9 },
  { iso: "SE", name: "Sweden", dial: "+46", min: 7, max: 10 },
  { iso: "NO", name: "Norway", dial: "+47", min: 8, max: 8 },
  { iso: "DK", name: "Denmark", dial: "+45", min: 8, max: 8 },
  { iso: "PT", name: "Portugal", dial: "+351", min: 9, max: 9 },
  { iso: "TR", name: "Türkiye", dial: "+90", min: 10, max: 10 },
  { iso: "ZA", name: "South Africa", dial: "+27", min: 9, max: 9 },
  { iso: "EG", name: "Egypt", dial: "+20", min: 9, max: 10 },
  { iso: "KE", name: "Kenya", dial: "+254", min: 9, max: 9 },
  { iso: "NG", name: "Nigeria", dial: "+234", min: 8, max: 10 },
  { iso: "BR", name: "Brazil", dial: "+55", min: 10, max: 11 },
  { iso: "MX", name: "Mexico", dial: "+52", min: 10, max: 10 },
  { iso: "AR", name: "Argentina", dial: "+54", min: 10, max: 11 },
];

export const DEFAULT_PHONE_COUNTRY = PHONE_COUNTRIES[0];

/** Longest dial code first, so "+1" never shadows "+91". */
const BY_DIAL_LENGTH = [...PHONE_COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);

export const findPhoneCountryByIso = (iso: string) =>
  PHONE_COUNTRIES.find((c) => c.iso === iso.toUpperCase());

/** Split a full E.164 number into its country and national parts. */
export const splitPhoneNumber = (value: string) => {
  const digits = `+${String(value || "").replace(/\D/g, "")}`;
  const match = BY_DIAL_LENGTH.find((c) => digits.startsWith(c.dial) && digits.length > c.dial.length);
  if (!match) return { country: null as PhoneCountry | null, national: String(value || "").replace(/\D/g, "") };
  return { country: match, national: digits.slice(match.dial.length) };
};

export const composePhoneNumber = (dial: string, national: string) =>
  `${dial}${String(national || "").replace(/\D/g, "")}`;

export const isValidNationalNumber = (country: PhoneCountry | null | undefined, national: string) => {
  const digits = String(national || "").replace(/\D/g, "");
  if (!country) return /^[1-9]\d{5,14}$/.test(digits);
  return digits.length >= country.min && digits.length <= country.max;
};
