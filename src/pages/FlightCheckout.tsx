import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import BookingStepper from "@/components/booking/BookingStepper";
import DuffelPassengerForm, {
  CheckoutContact,
  CheckoutPassenger,
  emptyPassenger,
} from "@/components/duffel/DuffelPassengerForm";
import DuffelPaymentStep from "@/components/duffel/DuffelPaymentStep";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  Plane,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import { getDuffelOffer } from "@/services/duffelFlights";
import {
  createDuffelOrder,
  type DuffelOrderSummary,
  type DuffelPassengerPayload,
} from "@/services/duffelBooking";
import { useAuth } from "@/contexts/AuthContext";
import type { DuffelOffer } from "@/types/duffel";
import { getItineraryScope } from "@/lib/itineraryScope";

const STEPS = ["Travellers", "Review", "Payment", "Confirmed"];

const money = (amount: string | number | null | undefined, currency: string | null | undefined) => {
  const value = Number(amount ?? 0);
  if (!Number.isFinite(value)) return "—";
  // Exact amount — the traveller must see the same figure the card is charged.
  return `${currency === "USD" ? "$" : `${currency ?? ""} `}${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

};

const time = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) : "—";
const day = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "—";
const duration = (iso: string | null) =>
  iso ? iso.replace("PT", "").replace("H", "h ").replace("M", "m").toLowerCase() : "—";

const FlightCheckout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [offer, setOffer] = useState<DuffelOffer | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [priceChange, setPriceChange] = useState<{ from: number; to: number } | null>(null);

  const [passengers, setPassengers] = useState<CheckoutPassenger[]>([]);
  const [contact, setContact] = useState<CheckoutContact>({ email: "", phone: "" });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [order, setOrder] = useState<DuffelOrderSummary | null>(null);
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  const stored = useMemo(() => {
    try {
      const raw = sessionStorage.getItem("selectedOffer") || localStorage.getItem("selectedOffer");
      return raw ? (JSON.parse(raw) as { offerId?: string; offer?: DuffelOffer; agentId?: string | null }) : null;
    } catch {
      return null;
    }
  }, []);


  const offerId = searchParams.get("offer") || stored?.offerId || stored?.offer?.id || "";
  const agentId = stored?.agentId ?? null;

  // ── Revalidate the offer against the live Duffel API before showing any price ──
  const loadOffer = useCallback(async () => {
    if (!offerId) {
      setLoading(false);
      setLoadError("We couldn't find your flight selection. Please search again to pick a fare.");
      return;
    }

    setLoading(true);
    setLoadError(null);

    const { offer: fresh, error, expired: isExpired } = await getDuffelOffer(offerId);

    if (!fresh) {
      setExpired(Boolean(isExpired));
      setLoadError(error ?? "This fare is no longer available. Please search again.");
      setLoading(false);
      return;
    }

    const previous = stored?.offer?.total_amount ? Number(stored.offer.total_amount) : null;
    const current = Number(fresh.total_amount ?? 0);
    if (previous !== null && Number.isFinite(previous) && Math.abs(previous - current) >= 0.01) {
      setPriceChange({ from: previous, to: current });
    }

    setOffer(fresh);
    // Re-persist the revalidated offer so a refresh or back-navigation keeps the real price.
    try {
      const payload = JSON.stringify({
        type: "flights",
        provider: "duffel",
        offerId: fresh.id,
        offer: fresh,
        agentId: stored?.agentId ?? null,
      });
      sessionStorage.setItem("selectedOffer", payload);
      localStorage.setItem("selectedOffer", payload);
    } catch {
      /* non-fatal */
    }
    setPassengers((existing) =>
      existing.length === fresh.passengers.length
        ? existing
        : fresh.passengers.map((p, i) => emptyPassenger(String(p.id ?? `pas_${i}`), p.type ?? "adult")),
    );
    setLoading(false);

  }, [offerId, stored]);

  useEffect(() => {
    loadOffer();
  }, [loadOffer]);

  useEffect(() => {
    if (user?.email && !contact.email) setContact((c) => ({ ...c, email: user.email as string }));
  }, [user, contact.email]);

  // Domestic vs international comes from the itinerary's airport countries, never the URL.
  const { isDomestic } = useMemo(() => getItineraryScope(offer), [offer]);
  const requireDocuments = offer?.passenger_identity_documents_required === true && !isDomestic;

  // Duffel's revalidated total is the only price we are ever allowed to charge.
  const payableAmount = (() => {
    const n = Number(offer?.total_amount ?? 0);
    return Number.isFinite(n) && n > 0 ? n : 0;
  })();


  const validateTravellers = (): string | null => {
    if (!offer) return "Please reload your flight selection.";
    for (const [i, p] of passengers.entries()) {
      const label = `Traveller ${i + 1}`;
      if (!p.title) return `${label}: select a title.`;
      if (!/^[A-Za-z][A-Za-z\s'’-]{0,49}$/.test(p.givenName.trim()))
        return `${label}: enter a valid first name${isDomestic ? " for the ticket." : " as on the passport."}`;
      if (!/^[A-Za-z][A-Za-z\s'’-]{0,49}$/.test(p.familyName.trim()))
        return `${label}: enter a valid last name${isDomestic ? " for the ticket." : " as on the passport."}`;
      if (!p.bornOn || new Date(p.bornOn) > new Date()) return `${label}: enter a valid date of birth.`;
      if (!p.gender) return `${label}: select a gender${isDomestic ? "." : " as shown on the passport."}`;
      if (requireDocuments) {
        if (!/^[A-Za-z0-9]{5,20}$/.test(p.passportNumber)) return `${label}: enter a valid passport number.`;
        if (!p.passportExpiry || new Date(p.passportExpiry) < new Date()) return `${label}: the passport must not be expired.`;
        if (!p.issuingCountry) return `${label}: select the passport issuing country.`;
        if (!p.nationality) return `${label}: select a nationality.`;
      }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) return "Enter a valid contact email address.";
    if (!/^\+[1-9]\d{6,14}$/.test(contact.phone)) return "Enter a contact phone number in international format, e.g. +14155550123.";
    if (!acceptedTerms) return "Please accept the Terms & Conditions and fare rules to continue.";
    return null;
  };

  const goToReview = () => {
    const problem = validateTravellers();
    if (problem) {
      setFormError(problem);
      toast.error(problem);
      return;
    }
    setFormError(null);
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildPassengerPayload = (): DuffelPassengerPayload[] =>
    passengers.map((p) => ({
      id: p.id,
      title: p.title,
      given_name: p.givenName.trim(),
      family_name: p.familyName.trim(),
      born_on: p.bornOn,
      gender: p.gender,
      email: contact.email.trim(),
      phone_number: contact.phone.trim(),
      ...(requireDocuments
        ? {
            identity_document: {
              unique_identifier: p.passportNumber,
              expires_on: p.passportExpiry,
              issuing_country_code: p.issuingCountry,
              nationality: p.nationality,
            },
          }
        : {}),
    }));

  const handleAuthorised = async (auth: { threeDSecureSessionId?: string; cardId?: string }) => {
    if (!offer) return;

    setSubmitting(true);
    setOrderError(null);

    const result = await createDuffelOrder({
      offerId: offer.id,
      passengers: buildPassengerPayload(),
      contact: { email: contact.email.trim(), phone: contact.phone.trim() },
      paymentType: "card",
      threeDSecureSessionId: auth.threeDSecureSessionId,
      cardId: auth.cardId,
      expectedAmount: offer.total_amount ?? undefined,
      acceptedTerms: true,
      agentId,
    });

    setSubmitting(false);

    if (!result.ok) {
      if (result.code === "PRICE_CHANGED" && result.newPrice) {
        setPriceChange({ from: result.originalPrice ?? Number(offer.total_amount ?? 0), to: result.newPrice });
        setStep(1);
        await loadOffer();
        toast.error(result.message ?? "The price changed. Please review it.");
        return;
      }
      if (result.code === "OFFER_EXPIRED" || result.code === "OFFER_UNAVAILABLE") {
        setExpired(true);
        setLoadError(result.message ?? "This fare has expired. Please search again.");
        return;
      }
      setOrderError(result.message ?? "We couldn't complete your booking. No payment was taken.");
      toast.error(result.message ?? "Booking failed");
      return;
    }

    sessionStorage.removeItem("selectedOffer");
    try {
      localStorage.removeItem("selectedOffer");
    } catch {
      /* non-fatal */
    }

    setOrder(result.order ?? null);
    setBookingRef(result.bookingReference ?? null);
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.success(`Booking confirmed — PNR ${result.bookingReference ?? ""}`.trim());
  };

  const itinerary = offer && (
    <div className="space-y-4">
      {offer.slices.map((slice, si) => (
        <div key={slice.id ?? si} className="rounded-2xl border border-border p-4 bg-card">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold">
              {slice.origin.iata_code} → {slice.destination.iata_code}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {day(slice.segments[0]?.departing_at ?? null)}
              </span>
            </p>
            <Badge variant="secondary">{duration(slice.duration)}</Badge>
          </div>

          <div className="space-y-3">
            {slice.segments.map((seg, i) => (
              <div key={seg.id ?? i} className="flex items-start gap-3 text-sm">
                {seg.marketing_carrier?.logo_symbol_url ? (
                  <img
                    src={seg.marketing_carrier.logo_symbol_url}
                    alt={`${seg.marketing_carrier.name ?? "Airline"} logo`}
                    className="w-7 h-7 rounded-md object-contain shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <span className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <Plane className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                  </span>
                )}
                <div className="flex-1">
                  <p className="font-medium">
                    {time(seg.departing_at)} {seg.origin.iata_code} → {time(seg.arriving_at)} {seg.destination.iata_code}
                  </p>
                  <p className="text-muted-foreground">
                    {seg.marketing_carrier?.name ?? "Airline"} {seg.marketing_carrier?.iata_code}
                    {seg.marketing_carrier_flight_number}
                    {seg.aircraft?.name ? ` · ${seg.aircraft.name}` : ""}
                    {seg.cabin_class_marketing_name || seg.cabin ? ` · ${seg.cabin_class_marketing_name ?? seg.cabin}` : ""}
                  </p>
                  {seg.baggages.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Baggage:{" "}
                      {seg.baggages
                        .map((b) => `${b.quantity} × ${String(b.type ?? "").replace(/_/g, " ")}`)
                        .join(", ")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {(slice.fare_brand_name || slice.conditions.refund_before_departure) && (
            <p className="mt-3 text-xs text-muted-foreground">
              {slice.fare_brand_name ? `${slice.fare_brand_name} · ` : ""}
              {slice.conditions.refund_before_departure?.allowed ? "Refundable before departure" : "Non-refundable"} ·{" "}
              {slice.conditions.change_before_departure?.allowed ? "Changes allowed" : "No changes"}
            </p>
          )}
        </div>
      ))}
    </div>
  );

  const priceBreakdown = offer && (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Price breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Base fare</span>
          <span>{money(offer.base_amount, offer.base_currency ?? offer.total_currency)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Taxes &amp; carrier charges</span>
          <span>{money(offer.tax_amount, offer.tax_currency ?? offer.total_currency)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Travellers</span>
          <span>{offer.passengers.length}</span>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between text-base font-semibold">
          <span>Total due today</span>
          <span>{money(offer.total_amount, offer.total_currency)}</span>
        </div>
        {offer.expires_at && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            Fare held until {new Date(offer.expires_at).toLocaleString("en-US")}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Secure Flight Checkout | Tripile.com"
        description="Complete your flight booking securely with Tripile.com. Enter traveller details, review your itinerary and pay with 3D Secure card protection."
        canonicalUrl="https://tripile.com/flight/checkout"
        noIndex
      />
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
          Back to results
        </Button>

        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          {step === 3 ? "Your flight is confirmed" : "Complete your flight booking"}
        </h1>

        <BookingStepper currentStep={step} steps={STEPS} />

        {loading && (
          <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            Checking live availability and price…
          </div>
        )}

        {!loading && loadError && !order && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>{expired ? "Fare expired" : "Flight unavailable"}</AlertTitle>
            <AlertDescription className="space-y-3">
              <p>{loadError}</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => navigate("/flights")}>Search flights again</Button>
                <Button size="sm" variant="outline" onClick={loadOffer}>Retry</Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {!loading && offer && !loadError && step < 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {priceChange && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  <AlertTitle>The airline updated this fare</AlertTitle>
                  <AlertDescription>
                    The price changed from {money(priceChange.from, offer.total_currency)} to{" "}
                    {money(priceChange.to, offer.total_currency)}. You&apos;ll only be charged the new total shown here.
                  </AlertDescription>
                </Alert>
              )}

              {step === 0 && (
                <>
                  {formError && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                      <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                  )}
                  <DuffelPassengerForm
                    offer={offer}
                    passengers={passengers}
                    contact={contact}
                    requireDocuments={requireDocuments}
                    isDomestic={isDomestic}
                    onPassengersChange={setPassengers}
                    onContactChange={setContact}
                    acceptedTerms={acceptedTerms}
                    onAcceptedTermsChange={setAcceptedTerms}
                  />
                  <Button size="lg" className="w-full" onClick={goToReview}>
                    Review booking
                  </Button>
                </>
              )}

              {step === 1 && (
                <>
                  <Card className="border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Plane className="w-4 h-4" aria-hidden="true" />
                        Your itinerary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>{itinerary}</CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Travellers</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {passengers.map((p, i) => (
                        <div key={p.id} className="flex justify-between">
                          <span>
                            {i + 1}. {p.title.toUpperCase()} {p.givenName} {p.familyName}
                          </span>
                          <span className="text-muted-foreground">
                            {p.bornOn}
                            {requireDocuments && p.passportNumber ? ` · ${p.passportNumber}` : ""}
                          </span>
                        </div>
                      ))}
                      <Separator className="my-2" />
                      <p className="text-muted-foreground">
                        {contact.email} · {contact.phone}
                      </p>
                    </CardContent>
                  </Card>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" className="sm:w-auto" onClick={() => setStep(0)}>
                      Edit traveller details
                    </Button>
                    <Button
                      size="lg"
                      className="flex-1"
                      disabled={!payableAmount}
                      onClick={() => { setStep(2); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    >
                      Continue to payment
                    </Button>
                  </div>
                  {!payableAmount && (
                    <p className="text-sm text-destructive">
                      We couldn't confirm the fare for this flight. Please search again and reselect it.
                    </p>
                  )}
                </>
              )}

              {step === 2 && (
                payableAmount ? (
                  <DuffelPaymentStep
                    offerId={offer.id}
                    amountLabel={money(offer.total_amount, offer.total_currency)}
                    onAuthorised={handleAuthorised}
                    submitting={submitting}
                    externalError={orderError}
                  />
                ) : (
                  <Card className="border-destructive/40">
                    <CardContent className="p-6 text-sm text-destructive">
                      This fare no longer has a valid price. Please search again and reselect your flight.
                    </CardContent>
                  </Card>
                )
              )}

            </div>

            <aside className="space-y-4 lg:sticky lg:top-24 h-fit">
              {step !== 1 && (
                <Card className="border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Flight summary</CardTitle>
                  </CardHeader>
                  <CardContent>{itinerary}</CardContent>
                </Card>
              )}
              {priceBreakdown}
            </aside>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="border-primary/30">
              <CardContent className="pt-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-primary mx-auto" aria-hidden="true" />
                <h2 className="text-xl font-semibold">Booking confirmed and ticketed</h2>
                <p className="text-muted-foreground">
                  We&apos;ve emailed your ticket and receipt to {contact.email}.
                </p>
                <div className="inline-flex flex-col items-center rounded-2xl bg-muted px-6 py-4">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">Airline booking reference (PNR)</span>
                  <span className="text-2xl font-bold tracking-widest">{bookingRef ?? "—"}</span>
                </div>
                {order?.owner?.name && (
                  <p className="text-sm text-muted-foreground">
                    Operated by {order.owner.name}. Use this reference for airline check-in.
                  </p>
                )}
              </CardContent>
            </Card>

            {order && (
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Ticketed itinerary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {order.slices.map((slice, si) => (
                    <div key={si} className="rounded-xl border border-border p-3">
                      <p className="font-medium mb-1">
                        {slice.origin} → {slice.destination}
                      </p>
                      {slice.segments.map((seg, i) => (
                        <p key={i} className="text-muted-foreground">
                          {seg.marketing_carrier}
                          {seg.flight_number} · {day(seg.departing_at)} {time(seg.departing_at)} {seg.origin} →{" "}
                          {time(seg.arriving_at)} {seg.destination}
                        </p>
                      ))}
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total paid</span>
                    <span>{money(order.total_amount, order.total_currency)}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-2" aria-hidden="true" />
                Print / save as PDF
              </Button>
              <Button className="flex-1" onClick={() => navigate("/my-bookings")}>
                View my bookings
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default FlightCheckout;
