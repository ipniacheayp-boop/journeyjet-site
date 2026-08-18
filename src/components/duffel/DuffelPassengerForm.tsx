import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "lucide-react";
import type { DuffelOffer } from "@/types/duffel";

export interface CheckoutPassenger {
  id: string;
  type: string;
  title: string;
  givenName: string;
  familyName: string;
  bornOn: string;
  gender: string;
  passportNumber: string;
  passportExpiry: string;
  issuingCountry: string;
  nationality: string;
}

export interface CheckoutContact {
  email: string;
  phone: string;
}

/** Frequently used ISO 3166-1 alpha-2 codes for passport / nationality selects. */
export const COUNTRIES: Array<{ code: string; name: string }> = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "IE", name: "Ireland" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "IN", name: "India" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "QA", name: "Qatar" },
  { code: "SG", name: "Singapore" },
  { code: "MY", name: "Malaysia" },
  { code: "TH", name: "Thailand" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "CN", name: "China" },
  { code: "HK", name: "Hong Kong" },
  { code: "PH", name: "Philippines" },
  { code: "ID", name: "Indonesia" },
  { code: "VN", name: "Vietnam" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "PT", name: "Portugal" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "CH", name: "Switzerland" },
  { code: "AT", name: "Austria" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "PL", name: "Poland" },
  { code: "CZ", name: "Czechia" },
  { code: "GR", name: "Greece" },
  { code: "TR", name: "Türkiye" },
  { code: "IL", name: "Israel" },
  { code: "EG", name: "Egypt" },
  { code: "ZA", name: "South Africa" },
  { code: "NG", name: "Nigeria" },
  { code: "KE", name: "Kenya" },
  { code: "MA", name: "Morocco" },
  { code: "BR", name: "Brazil" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "CO", name: "Colombia" },
  { code: "MX", name: "Mexico" },
  { code: "PE", name: "Peru" },
  { code: "PK", name: "Pakistan" },
  { code: "BD", name: "Bangladesh" },
  { code: "LK", name: "Sri Lanka" },
  { code: "NP", name: "Nepal" },
];

export function emptyPassenger(id: string, type: string): CheckoutPassenger {
  return {
    id,
    type,
    title: "",
    givenName: "",
    familyName: "",
    bornOn: "",
    gender: "",
    passportNumber: "",
    passportExpiry: "",
    issuingCountry: "",
    nationality: "",
  };
}

const typeLabel = (type: string, age: number | null) => {
  if (type === "child") return "Child";
  if (type === "infant_without_seat") return "Infant";
  if (age != null) return `Traveller (age ${age})`;
  return "Adult";
};

interface Props {
  offer: DuffelOffer;
  passengers: CheckoutPassenger[];
  contact: CheckoutContact;
  requireDocuments: boolean;
  /** Domestic itineraries book on the airline ticket name — no passport wording or fields. */
  isDomestic?: boolean;
  onPassengersChange: (passengers: CheckoutPassenger[]) => void;
  onContactChange: (contact: CheckoutContact) => void;
  acceptedTerms: boolean;
  onAcceptedTermsChange: (value: boolean) => void;
  disabled?: boolean;
}

const DuffelPassengerForm = ({
  offer,
  passengers,
  contact,
  requireDocuments,
  isDomestic = false,
  onPassengersChange,
  onContactChange,
  acceptedTerms,
  onAcceptedTermsChange,
  disabled,
}: Props) => {
  const update = (index: number, field: keyof CheckoutPassenger, value: string) => {
    const next = [...passengers];
    next[index] = { ...next[index], [field]: value };
    onPassengersChange(next);
  };

  return (
    <div className="space-y-6">
      {passengers.map((passenger, index) => {
        const offerPassenger = offer.passengers[index];
        return (
          <Card key={passenger.id} className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-4 h-4" aria-hidden="true" />
                {typeLabel(passenger.type, offerPassenger?.age ?? null)} {index + 1}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {isDomestic
                  ? "Enter the traveller's name exactly as it should appear on the airline ticket — airlines charge for corrections."
                  : "Enter names exactly as they appear on the passport — airlines charge for corrections."}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`title-${index}`}>Title <span className="text-destructive">*</span></Label>
                  <Select
                    value={passenger.title}
                    onValueChange={(v) => update(index, "title", v)}
                    disabled={disabled}
                  >
                    <SelectTrigger id={`title-${index}`} className="bg-background">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mr">Mr</SelectItem>
                      <SelectItem value="ms">Ms</SelectItem>
                      <SelectItem value="mrs">Mrs</SelectItem>
                      <SelectItem value="miss">Miss</SelectItem>
                      <SelectItem value="dr">Dr</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`given-${index}`}>First / given name <span className="text-destructive">*</span></Label>
                  <Input
                    id={`given-${index}`}
                    className="bg-background"
                    autoComplete="given-name"
                    value={passenger.givenName}
                    disabled={disabled}
                    onChange={(e) => update(index, "givenName", e.target.value)}
                    placeholder={isDomestic ? "First name" : "As on passport"}
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`family-${index}`}>Last / family name <span className="text-destructive">*</span></Label>
                  <Input
                    id={`family-${index}`}
                    className="bg-background"
                    autoComplete="family-name"
                    value={passenger.familyName}
                    disabled={disabled}
                    onChange={(e) => update(index, "familyName", e.target.value)}
                    placeholder={isDomestic ? "Last name" : "As on passport"}
                    maxLength={50}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`dob-${index}`}>Date of birth <span className="text-destructive">*</span></Label>
                  <Input
                    id={`dob-${index}`}
                    type="date"
                    className="bg-background"
                    max={new Date().toISOString().slice(0, 10)}
                    value={passenger.bornOn}
                    disabled={disabled}
                    onChange={(e) => update(index, "bornOn", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`gender-${index}`}>
                    Gender{isDomestic ? "" : " (as on passport)"} <span className="text-destructive">*</span>
                  </Label>
                  <Select value={passenger.gender} onValueChange={(v) => update(index, "gender", v)} disabled={disabled}>
                    <SelectTrigger id={`gender-${index}`} className="bg-background">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="m">Male</SelectItem>
                      <SelectItem value="f">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isDomestic && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`nationality-domestic-${index}`}>Nationality</Label>
                    <Select
                      value={passenger.nationality}
                      onValueChange={(v) => update(index, "nationality", v)}
                      disabled={disabled}
                    >
                      <SelectTrigger id={`nationality-domestic-${index}`} className="bg-background">
                        <SelectValue placeholder="Select nationality" />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {requireDocuments && !isDomestic && (
                <div className="pt-2 border-t border-border space-y-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Passport details (required by the airline for this route)
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`passport-${index}`}>Passport number <span className="text-destructive">*</span></Label>
                      <Input
                        id={`passport-${index}`}
                        className="bg-background"
                        value={passenger.passportNumber}
                        disabled={disabled}
                        onChange={(e) => update(index, "passportNumber", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                        placeholder="e.g. A1234567"
                        maxLength={20}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`passport-exp-${index}`}>Passport expiry <span className="text-destructive">*</span></Label>
                      <Input
                        id={`passport-exp-${index}`}
                        type="date"
                        className="bg-background"
                        min={new Date().toISOString().slice(0, 10)}
                        value={passenger.passportExpiry}
                        disabled={disabled}
                        onChange={(e) => update(index, "passportExpiry", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`issuing-${index}`}>Issuing country <span className="text-destructive">*</span></Label>
                      <Select
                        value={passenger.issuingCountry}
                        onValueChange={(v) => update(index, "issuingCountry", v)}
                        disabled={disabled}
                      >
                        <SelectTrigger id={`issuing-${index}`} className="bg-background">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                          {COUNTRIES.map((c) => (
                            <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`nationality-${index}`}>Nationality <span className="text-destructive">*</span></Label>
                      <Select
                        value={passenger.nationality}
                        onValueChange={(v) => update(index, "nationality", v)}
                        disabled={disabled}
                      >
                        <SelectTrigger id={`nationality-${index}`} className="bg-background">
                          <SelectValue placeholder="Select nationality" />
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                          {COUNTRIES.map((c) => (
                            <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Contact details</CardTitle>
          <p className="text-sm text-muted-foreground">
            Your ticket, booking reference and any airline updates are sent here.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email address <span className="text-destructive">*</span></Label>
              <Input
                id="contact-email"
                type="email"
                className="bg-background"
                autoComplete="email"
                value={contact.email}
                disabled={disabled}
                onChange={(e) => onContactChange({ ...contact, email: e.target.value })}
                placeholder="you@example.com"
                maxLength={254}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Phone number <span className="text-destructive">*</span></Label>
              <Input
                id="contact-phone"
                type="tel"
                className="bg-background"
                autoComplete="tel"
                value={contact.phone}
                disabled={disabled}
                onChange={(e) => onContactChange({ ...contact, phone: e.target.value.replace(/[^\d+]/g, "") })}
                placeholder="+14155550123"
                maxLength={16}
              />
              <p className="text-xs text-muted-foreground">Include the country code, e.g. +1 for the US.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              id="accept-terms"
              checked={acceptedTerms}
              disabled={disabled}
              onCheckedChange={(v) => onAcceptedTermsChange(v === true)}
            />
            <Label htmlFor="accept-terms" className="text-sm font-normal leading-relaxed">
              {isDomestic
                ? "I confirm the traveller names match their government-issued ID and I accept the "
                : "I confirm the traveller names match their passports and I accept the "}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                Terms &amp; Conditions
              </a>
              , the{" "}
              <a href="/refund-policy" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                Refund Policy
              </a>{" "}
              and the airline&apos;s fare rules. <span className="text-destructive">*</span>
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DuffelPassengerForm;
