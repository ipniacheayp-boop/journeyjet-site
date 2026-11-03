import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import BookingStepper from "@/components/booking/BookingStepper";
import type { HotelUpsellData } from "@/components/booking/HotelUpsellStep";
import DuffelPassengerForm, {
  CheckoutContact,
  CheckoutPassenger,
  emptyPassenger,
} from "@/components/duffel/DuffelPassengerForm";
import { Skeleton } from "@/components/ui/skeleton";
import { bindCheckoutPassengers, CHECKOUT_DRAFT_TTL, clearCheckoutDraft, readCheckoutDraft, saveCheckoutDraft } from "@/lib/flightCheckoutDraft";
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
  reconcileDuffelBooking,
  type DuffelOrderSummary,
  type DuffelPassengerPayload,
} from "@/services/duffelBooking";
import { useAuth } from "@/contexts/AuthContext";
import type { DuffelOffer } from "@/types/duffel";
import { getItineraryScope } from "@/lib/itineraryScope";
import { formatDateShort, formatTime } from "@/lib/duffelUtils";
import { combinedCheckoutTotal, hotelGuestsFromFlight, readHotelContinuation } from "@/lib/flightHotelCheckout";

const STEPS = ["Hotel", "Travellers", "Review", "Payment", "Confirmed"];
const HotelUpsellStep = lazy(() => import("@/components/booking/HotelUpsellStep"));
const DuffelPaymentStep = lazy(() => import("@/components/duffel/DuffelPaymentStep"));
const HotelBookingPayment = lazy(() => import("@/pages/Booking"));

const money = (amount: string | number | null | undefined, currency: string | null | undefined) => {
  const value = Number(amount ?? 0);
  if (!Number.isFinite(value)) return "—";
  // Exact amount — the traveller must see the same figure the card is charged.
  return `${currency === "USD" ? "$" : `${currency ?? ""} `}${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

};

const time = formatTime;
const day = formatDateShort;
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
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [checkingPrice, setCheckingPrice] = useState(false);
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);
  const [hotelStepComplete, setHotelStepComplete] = useState(false);
  const [hotelUpsellData, setHotelUpsellData] = useState<HotelUpsellData | null>(null);
  const submittingRef = useRef(false);
  const verifyingRef = useRef(false);
  const hydratedRef = useRef(false);

  const stored = useMemo(() => {
    try {
      const raw = sessionStorage.getItem("selectedOffer") || localStorage.getItem("selectedOffer");
      return raw ? (JSON.parse(raw) as { offerId?: string; offer?: DuffelOffer; agentId?: string | null; attemptId?: string }) : null;
    } catch {
      return null;
    }
  }, []);


  const offerId = searchParams.get("offer") || stored?.offerId || stored?.offer?.id || "";
  const draftKey = offerId ? `duffelCheckoutDraft:${offerId}` : "";
  const initialDraft = useMemo(() => readCheckoutDraft(sessionStorage, offerId), [offerId]);
  const hotelContinuation = useMemo(() => readHotelContinuation(sessionStorage, offerId), [offerId]);
  const recovery = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem(`duffelRecovery:${offerId}`) || "null") as { attemptId: string; bookingId?: string } | null; }
    catch { return null; }
  }, [offerId]);
  const agentId = stored?.agentId ?? null;
  const attemptId = useMemo(
    () => recovery?.attemptId || initialDraft?.attemptId || (stored?.attemptId && /^[0-9a-f-]{36}$/i.test(stored.attemptId) ? stored.attemptId : crypto.randomUUID()),
    [stored, initialDraft, recovery],
  );

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

    setExpired(false);
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
        attemptId,
      });
      sessionStorage.setItem("selectedOffer", payload);
      localStorage.setItem("selectedOffer", payload);
    } catch {
      /* non-fatal */
    }
    const freshPassengers = fresh.passengers.map((p, i) => emptyPassenger(String(p.id ?? `pas_${i}`), p.type ?? "adult"));
    const alreadyHydrated = hydratedRef.current;
    setPassengers(existing => bindCheckoutPassengers(alreadyHydrated ? existing : initialDraft?.passengers ?? [], freshPassengers));
    if (!hydratedRef.current && initialDraft) {
      setContact(initialDraft.contact);
      setAcceptedTerms(initialDraft.acceptedTerms === true);
      setStep(Number.isInteger(initialDraft.step) ? Math.max(0, Math.min(2, initialDraft.step)) : 0);
      setPendingBookingId(initialDraft.pendingBookingId);
      setPaymentStarted(initialDraft.paymentStarted === true);
      setHotelStepComplete(initialDraft.hotelStepComplete ?? initialDraft.step > 0);
      setHotelUpsellData(initialDraft.hotelUpsellData ?? null);
    }
    if (recovery) { setPaymentStarted(true); setPendingBookingId(recovery.bookingId ?? null); setStep(2); }
    hydratedRef.current = true;
    setLoading(false);

  }, [attemptId, initialDraft, offerId, recovery, stored]);

  useEffect(() => {
    if (!draftKey || !offer || step === 3) return;
    const saved = saveCheckoutDraft(sessionStorage, { offerId: offer.id, attemptId, step, passengers, contact, acceptedTerms, pendingBookingId, paymentStarted, hotelStepComplete, hotelUpsellData, savedAt: Date.now() });
    if (!saved) setStorageWarning(true);
    const expire = window.setTimeout(() => {
      clearCheckoutDraft(sessionStorage, offer.id);
      setPassengers(offer.passengers.map((p, i) => emptyPassenger(String(p.id ?? `pas_${i}`), p.type ?? "adult")));
      setContact({ email: "", phone: "" }); setAcceptedTerms(false);
      setHotelUpsellData(null); setHotelStepComplete(false);
      if (!paymentStarted) setStep(0);
    }, CHECKOUT_DRAFT_TTL);
    return () => window.clearTimeout(expire);
  }, [acceptedTerms, attemptId, contact, draftKey, offer, passengers, paymentStarted, pendingBookingId, step, hotelStepComplete, hotelUpsellData]);

  useEffect(() => {
    if (!recovery) return;
    setPaymentStarted(true); setPendingBookingId(recovery.bookingId ?? null); setStep(2);
  }, [recovery]);

  useEffect(() => {
    loadOffer();
  }, [loadOffer]);

  useEffect(() => {
    if (user?.email && !contact.email) setContact((c) => ({ ...c, email: user.email as string }));
  }, [user, contact.email]);

  // Domestic vs international comes from the itinerary's airport countries, never the URL.
  // Rule: any itinerary leaving a single country (e.g. Delhi → Mumbai, all-India) is domestic
  // and needs no passport; anything crossing a border is international and passport data is
  // mandatory for every traveller — regardless of the offer's document hint.
  const { isDomestic } = useMemo(() => getItineraryScope(offer), [offer]);
  const requireDocuments = !isDomestic && !!offer;
  const hotelDestination = offer?.slices[0]?.destination;
  const outboundSegments = offer?.slices[0]?.segments ?? [];
  const hotelArrivalDate = outboundSegments[outboundSegments.length - 1]?.arriving_at?.split("T")[0] ?? "";
  const hotelDepartureDate = offer?.slices[1]?.segments[0]?.departing_at?.split("T")[0];
  const showingHotel = step === 0 && !hotelStepComplete && !paymentStarted;
  const hotelSelected = hotelUpsellData?.selectedHotel;
  useEffect(() => {
    if (hotelContinuation && !hotelUpsellData) {
      setHotelUpsellData(hotelContinuation.hotelUpsellData);
      setContact(hotelContinuation.contact);
      setHotelStepComplete(true);
    }
  }, [hotelContinuation, hotelUpsellData]);
  const hotelAmount = Number(hotelSelected?.offers?.[0]?.price?.total ?? 0);
  const hotelCurrency = hotelSelected?.offers?.[0]?.price?.currency ?? "USD";
  const hotelIsEstimate = Boolean(hotelSelected?.googlePlace);
  const hotelCheckout = useMemo(() => hotelSelected && !hotelIsEstimate ? {
    offer: hotelSelected,
    passengers: hotelContinuation?.passengers ?? hotelGuestsFromFlight(passengers),
    contact,
    agentId,
    checkoutId: offerId,
  } : undefined, [hotelSelected, hotelIsEstimate, hotelContinuation, passengers, contact, agentId, offerId]);
  const preserveHotelCheckout = useCallback(() => {
    if (!hotelUpsellData?.selectedHotel) return;
    try {
      sessionStorage.setItem(`flightHotel:${offerId}`, JSON.stringify({
        hotelUpsellData, passengers: hotelContinuation?.passengers ?? hotelGuestsFromFlight(passengers),
        contact, savedAt: Date.now(),
      }));
      sessionStorage.setItem(`duffelRecovery:${offerId}`, JSON.stringify({ attemptId }));
    } catch { setStorageWarning(true); }
  }, [hotelUpsellData, offerId, hotelContinuation, passengers, contact, attemptId]);

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
    if (!offer || submittingRef.current || paymentStarted) return;
    const problem = validateTravellers();
    if (problem) { setFormError(problem); setStep(0); return; }
    submittingRef.current = true;
    setPaymentStarted(true);
    try { sessionStorage.setItem(`duffelRecovery:${offerId}`, JSON.stringify({ attemptId })); } catch { setStorageWarning(true); }

    setSubmitting(true);
    setOrderError(null);

    const result = await createDuffelOrder({
      offerId: offer.id,
      passengers: buildPassengerPayload(),
      contact: { email: contact.email.trim(), phone: contact.phone.trim() },
      paymentType: "card",
      threeDSecureSessionId: auth.threeDSecureSessionId,
      cardId: auth.cardId,
      expectedAmount: offer.total_amount ?? "",
      expectedCurrency: offer.total_currency ?? "",
      acceptedTerms,
      agentId,
      attemptId,
    });

    setSubmitting(false);
    submittingRef.current = false;

    if (!result.ok) {
      if (result.pending && result.bookingId) {
        setPendingBookingId(result.bookingId);
        try { sessionStorage.setItem(`duffelRecovery:${offerId}`, JSON.stringify({ attemptId, bookingId: result.bookingId })); } catch { /* recover by attempt */ }
        setOrderError(null);
        setVerifying(false);
        toast.info("Your payment is being verified with the airline. Please don't submit it again.");
        return;
      }
      if (result.code === "NETWORK") {
        setOrderError("The connection was interrupted. Check booking status before attempting another payment, or contact support if a charge appears.");
        toast.warning("Connection interrupted. We will check your existing booking attempt.");
        return;
      }
      setPaymentStarted(false);
      try { sessionStorage.removeItem(`duffelRecovery:${offerId}`); } catch { /* non-fatal */ }
      if (result.code === "PRICE_CHANGED" && result.newPrice) {
        setPriceChange({ from: result.originalPrice ?? Number(offer.total_amount ?? 0), to: result.newPrice });
        setStep(1);
        await loadOffer();
        setStep(1);
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
    sessionStorage.removeItem(`duffelRecovery:${offerId}`);
    preserveHotelCheckout();
    if (draftKey) sessionStorage.removeItem(draftKey);
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

  const verifyPendingBooking = useCallback(async () => {
    if ((!pendingBookingId && !paymentStarted) || verifyingRef.current) return;
    verifyingRef.current = true;
    setVerifying(true);
    try {
      const result = await reconcileDuffelBooking({ bookingId: pendingBookingId ?? undefined, attemptId });
      if (result.bookingId) setPendingBookingId(result.bookingId);
      if (result.message || result.error) setOrderError(result.message ?? result.error ?? null);
      if (result.confirmed) {
        sessionStorage.removeItem("selectedOffer");
        sessionStorage.removeItem(`duffelRecovery:${offerId}`);
        preserveHotelCheckout();
        if (draftKey) sessionStorage.removeItem(draftKey);
        try { localStorage.removeItem("selectedOffer"); } catch { /* non-fatal */ }
        setOrder(result.order ?? null);
        setBookingRef(result.bookingReference ?? null);
        setPendingBookingId(null);
        setPaymentStarted(false);
        setStep(3);
        toast.success(`Booking confirmed — PNR ${result.bookingReference ?? ""}`.trim());
      } else if (result.state === "failed" || result.state === "cancelled") {
        setOrderError(result.message ?? "The airline did not complete this booking. Search again to begin a new checkout attempt.");
      }
    } finally {
      verifyingRef.current = false;
      setVerifying(false);
    }
  }, [attemptId, draftKey, offerId, paymentStarted, pendingBookingId, preserveHotelCheckout]);

  useEffect(() => {
    if (!pendingBookingId && !paymentStarted) return;
    void verifyPendingBooking();
    const timer = window.setInterval(() => void verifyPendingBooking(), 8_000);
    return () => window.clearInterval(timer);
  }, [paymentStarted, pendingBookingId, verifyPendingBooking]);

  const preparePayment = async () => {
    if (!offer || checkingPrice) return;
    setCheckingPrice(true);
    const result = await getDuffelOffer(offer.id);
    setCheckingPrice(false);
    if (!result.offer) {
      setExpired(Boolean(result.expired)); setLoadError(result.error ?? "We couldn't recheck this fare. Please retry."); return;
    }
    const fresh = result.offer;
    setOffer(fresh);
    setPassengers(existing => bindCheckoutPassengers(existing, fresh.passengers.map((p, i) => emptyPassenger(String(p.id ?? `pas_${i}`), p.type ?? "adult"))));
    if (fresh.total_amount !== offer.total_amount || fresh.total_currency !== offer.total_currency) {
      setPriceChange({ from: Number(offer.total_amount), to: Number(fresh.total_amount) }); setStep(1); return;
    }
    setPriceChange(null); setStep(2); window.scrollTo({ top: 0, behavior: "smooth" });
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
          <span>Flight charges</span>
          <span>{money(offer.total_amount, offer.total_currency)}</span>
        </div>
        {hotelSelected && <>
          <div className="flex justify-between gap-3"><span>Hotel charges{hotelIsEstimate ? " (estimate)" : ""}</span><span>{money(hotelAmount, hotelCurrency)}</span></div>
          <Separator />
          {combinedCheckoutTotal(payableAmount, offer.total_currency ?? "", hotelAmount, hotelCurrency) !== null && <div className="flex justify-between gap-3 font-semibold"><span>{hotelIsEstimate ? "Combined estimate" : "Combined total"}</span><span>{money(combinedCheckoutTotal(payableAmount, offer.total_currency ?? "", hotelAmount, hotelCurrency), hotelCurrency)}</span></div>}
          <p className="text-xs text-muted-foreground">{hotelIsEstimate ? "Only flight charges are payable by card. Google Places does not provide a confirmed hotel rate or reservation; the hotel estimate is not charged." : "Two separate payments: flight first, then hotel charges in this checkout. Hotel price and availability are checked before payment."}</p>
        </>}
        {offer.expires_at && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
             Fare held until {new Date(offer.expires_at).toLocaleString("en-US")} (your local time)
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

      <main className="container mx-auto px-4 pb-8 pt-24 md:pt-36 max-w-5xl">
        <Button variant="ghost" size="sm" className="mb-4" disabled={submitting || paymentStarted} onClick={() => step > 0 && step < 3 ? setStep(step - 1) : step === 0 && hotelStepComplete ? setHotelStepComplete(false) : navigate("/flights")}>
          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
          {(step > 0 && step < 3) || (step === 0 && hotelStepComplete) ? "Back to previous step" : "Back to flight search"}
        </Button>
        {step < 3 && !paymentStarted && <Button variant="ghost" size="sm" onClick={() => {
          if (!window.confirm("Cancel this checkout and clear your traveller details?")) return;
          clearCheckoutDraft(sessionStorage, offerId);
          try { sessionStorage.removeItem("selectedOffer"); localStorage.removeItem("selectedOffer"); } catch { /* non-fatal */ }
          navigate("/flights");
        }}>Cancel checkout</Button>}
        {storageWarning && <Alert className="mb-4"><AlertDescription>Your browser cannot save checkout details. Keep this tab open until your booking is complete.</AlertDescription></Alert>}

        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          {step === 3 ? "Your flight is confirmed" : "Complete your flight booking"}
        </h1>

        <BookingStepper currentStep={showingHotel ? 0 : step + 1} steps={hotelSelected ? ["Hotel", "Travellers", "Review", "Flight payment", "Hotel payment"] : STEPS} />

        {loading && (
          <div className="space-y-4 py-8" role="status">
            <Skeleton className="h-24 w-full" /><Skeleton className="h-48 w-full" />
            <p className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            Checking live availability and price…
            </p>
          </div>
        )}

        {!loading && loadError && !order && !paymentStarted && (
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

        {paymentStarted && (loadError || !offer) && step < 3 && <Alert className="mb-6"><AlertTitle>Checking your booking</AlertTitle><AlertDescription>{orderError || "Your payment result is being verified. Do not pay again."}<Button className="mt-3" variant="outline" disabled={verifying} onClick={() => void verifyPendingBooking()}>Check booking status</Button></AlertDescription></Alert>}
        {!loading && offer && (!loadError || paymentStarted) && step < 3 && (
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

              {showingHotel && <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                <HotelUpsellStep
                  destinationCode={hotelDestination?.city_name || hotelDestination?.name || hotelDestination?.iata_code || ""}
                  arrivalDate={hotelArrivalDate}
                  departureDate={hotelDepartureDate}
                  initialData={hotelUpsellData}
                  onDraftChange={setHotelUpsellData}
                  onComplete={data => { setHotelUpsellData(data); setHotelStepComplete(true); }}
                  onSkip={() => { setHotelUpsellData(null); setHotelStepComplete(true); }}
                  disabled={submitting}
                />
              </Suspense>}
              {step === 0 && !showingHotel && (
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

                  {hotelSelected && <Card><CardHeader><CardTitle className="text-lg">Selected hotel</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
                    <p className="font-medium">{hotelSelected.hotel?.name}</p>
                    <p>{hotelUpsellData?.checkInDate} → {hotelUpsellData?.checkOutDate} · {hotelUpsellData?.rooms} room(s)</p>
                    <p>Hotel charges{hotelIsEstimate ? " (estimate)" : ""}: {money(hotelAmount, hotelCurrency)} · {hotelIsEstimate ? "Not included in the card payment" : "Paid in the next checkout stage after flight confirmation"}</p>
                    <Button variant="outline" onClick={() => { setStep(0); setHotelStepComplete(false); }}>Change hotel</Button>
                  </CardContent></Card>}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" className="sm:w-auto" onClick={() => setStep(0)}>
                      Edit traveller details
                    </Button>
                    <Button
                      size="lg"
                      className="flex-1"
                      disabled={!payableAmount || checkingPrice}
                      onClick={() => void preparePayment()}
                    >
                      {checkingPrice ? "Checking current fare…" : "Continue to payment"}
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
                pendingBookingId || paymentStarted ? (
                  <Card className="border-primary/30">
                    <CardContent className="p-6 space-y-4 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" aria-hidden="true" />
                      <div>
                        <h2 className="font-semibold text-lg">Verifying with the airline</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          Duffel may take longer to return the final order status. Do not submit payment again.
                        </p>
                      </div>
                      {orderError && <p className="text-sm text-muted-foreground">{orderError}</p>}
                      <Button type="button" variant="outline" disabled={verifying} onClick={() => void verifyPendingBooking()}>
                        {verifying ? "Checking…" : "Check booking status"}
                      </Button>
                    </CardContent>
                  </Card>
                ) : payableAmount ? (
                  <Suspense fallback={<Skeleton className="h-72 w-full" />}><DuffelPaymentStep
                    offerId={offer.id}
                    amountLabel={money(offer.total_amount, offer.total_currency)}
                    onAuthorised={handleAuthorised}
                    submitting={submitting}
                    externalError={orderError}
                    beforeAuthorise={async () => {
                      const result = await getDuffelOffer(offer.id);
                      if (!result.offer) { setLoadError(result.error ?? "Please recheck this fare."); return false; }
                      if (result.offer.total_amount !== offer.total_amount || result.offer.total_currency !== offer.total_currency) {
                        setPriceChange({ from: Number(offer.total_amount), to: Number(result.offer.total_amount) }); setOffer(result.offer); setStep(1); return false;
                      }
                      return true;
                    }}
                  /></Suspense>
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
                <h2 className="text-xl font-semibold">Booking confirmed{order?.documents.some(d => d.type === "electronic_ticket") ? " and ticketed" : ""}</h2>
                <p className="text-muted-foreground">
                  Booking contact: {contact.email || "See your booking details"}. Contact support if your confirmation email has not arrived.
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
                    <span>Flight charges paid</span>
                    <span>{money(order.total_amount, order.total_currency)}</span>
                  </div>
                </CardContent>
              </Card>
            )}
            {hotelCheckout && <section className="space-y-4" aria-label="Hotel payment">
              <p className="text-sm text-muted-foreground">Your flight is confirmed. Complete the separate hotel payment below. The hotel is not booked or charged yet; supplier confirmation is separate.</p>
              <Suspense fallback={<Skeleton className="h-72 w-full" />}><HotelBookingPayment embeddedHotel={hotelCheckout} /></Suspense>
            </section>}
            {hotelSelected && hotelIsEstimate && <Alert><AlertTitle>Hotel reservation not confirmed</AlertTitle><AlertDescription>{hotelSelected.hotel?.name}: the Google Places price is an estimate, not a bookable rate. No hotel payment was taken.</AlertDescription></Alert>}

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
