import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useBookingFlow } from "@/hooks/useBookingFlow";
import { toast } from "sonner";
import { Loader2, CheckCircle, ArrowLeft, ArrowRight, AlertTriangle, ShieldCheck } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import PriceChangeModal from "@/components/PriceChangeModal";
import BookingStepper from "@/components/booking/BookingStepper";
import FlightSummaryCard from "@/components/booking/FlightSummaryCard";
import PassengerForm, { type Passenger, type ContactDetails } from "@/components/booking/PassengerForm";
import CouponSection from "@/components/booking/CouponSection";
import PriceSummaryCard from "@/components/booking/PriceSummaryCard";
import HotelUpsellStep, { type HotelUpsellData } from "@/components/booking/HotelUpsellStep";
import StripePaymentForm from "@/components/booking/StripePaymentForm";
import HotelSummaryCard from "@/components/booking/HotelSummaryCard";
import CarSummaryCard from "@/components/booking/CarSummaryCard";

const STEPS = ["Flight", "Hotel", "Passengers", "Coupons", "Payment"];

const emptyPassenger: Passenger = {
  firstName: "", lastName: "", dateOfBirth: "", gender: "", nationality: "",
  passportNumber: "", passportExpiry: "", passportCountry: "",
  seatPreference: "", mealPreference: "",
};

const Booking = () => {
  const { id: bookingType } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [offer, setOffer] = useState<any>(null);
  const [agentId, setAgentId] = useState<string | undefined>(undefined);
  const [currentStep, setCurrentStep] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Geographic compliance — Tripile only accepts U.S.-based customers.
  const ALLOWED_BILLING_COUNTRY = "United States";
  const [billingCountry, setBillingCountry] = useState(ALLOWED_BILLING_COUNTRY);
  const isUsCustomer = billingCountry === ALLOWED_BILLING_COUNTRY;

  // Passenger & contact state
  const [passengers, setPassengers] = useState<Passenger[]>([{ ...emptyPassenger }]);
  const [contact, setContact] = useState<ContactDetails>({ email: "", phone: "" });

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);

  // Hotel upsell state
  const [hotelUpsellData, setHotelUpsellData] = useState<HotelUpsellData | null>(null);

  // Stripe payment state
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingReference, setBookingReference] = useState<string | null>(null);
  const [paymentReady, setPaymentReady] = useState(false);

  // Price validation state
  const clientRequestIdRef = useRef<string>("");
  const [validatedOffer, setValidatedOffer] = useState<any>(null);
  const [validatedPrice, setValidatedPrice] = useState<number | null>(null);
  const [validatedCurrency, setValidatedCurrency] = useState<string>("USD");
  const [showPriceChangeModal, setShowPriceChangeModal] = useState(false);
  const [pendingPriceChangeOffer, setPendingPriceChangeOffer] = useState<any>(null);

  const {
    loading, validating, priceChangeData,
    generateClientRequestId, validatePrebooking, clearPriceChange,
  } = useBookingFlow();

  useEffect(() => {
    const storedData = sessionStorage.getItem("selectedOffer");
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setOffer(parsed.offer);
      setAgentId(parsed.agentId);
    }
    clientRequestIdRef.current = generateClientRequestId();
  }, [generateClientRequestId]);

  useEffect(() => {
    if (priceChangeData) setShowPriceChangeModal(true);
  }, [priceChangeData]);

  // Price calculations
  const getPrice = (o: any) => {
    if (!o) return 0;
    if (bookingType === "flights") return parseFloat(o.price?.total || o.price?.grandTotal || "0");
    if (bookingType === "hotels") return parseFloat(o.offers?.[0]?.price?.total || o.price?.total || "0");
    if (bookingType === "cars") return parseFloat(o.price?.total || "0");
    return 0;
  };

  const getCurrency = (o: any) => {
    if (!o) return "USD";
    if (bookingType === "flights") return o.price?.currency || "USD";
    if (bookingType === "hotels") return o.offers?.[0]?.price?.currency || o.price?.currency || "USD";
    return o.price?.currency || "USD";
  };

  // API price (per person for flights; total for hotels/cars). API total already includes taxes.
  const price = validatedPrice || getPrice(offer);
  const currency = validatedCurrency || getCurrency(offer);
  const apiBaseRaw =
    bookingType === "hotels"
      ? parseFloat(offer?.offers?.[0]?.price?.base || offer?.price?.base || "0")
      : parseFloat(offer?.price?.base || "0");
  const taxes = apiBaseRaw > 0 && apiBaseRaw < price ? price - apiBaseRaw : 0;
  const basePerUnit = taxes > 0 ? apiBaseRaw : price;
  const passengerMultiplier = bookingType === "flights" ? passengers.length : 1;

  // Hotel upsell (only valid when primary booking is a flight)
  const hotelUpsellOffer = hotelUpsellData?.wantsHotel ? hotelUpsellData.selectedHotel : null;
  const hotelUpsellPrice = hotelUpsellOffer
    ? parseFloat(hotelUpsellOffer.offers?.[0]?.price?.total || "0")
    : 0;
  const hotelUpsellCurrency = hotelUpsellOffer?.offers?.[0]?.price?.currency || currency;

  // Strict conditional totals
  const flightSubtotal = bookingType === "flights" ? price * passengerMultiplier : 0;
  const hotelSubtotal =
    bookingType === "hotels" ? price : bookingType === "flights" ? hotelUpsellPrice : 0;
  const carSubtotal = bookingType === "cars" ? price : 0;
  const finalTotal = Math.max(0, flightSubtotal + hotelSubtotal + carSubtotal - discount);

  const isProcessing = loading || validating;

  // Extract flight destination info for hotel upsell
  const flightSegments = offer?.itineraries?.[0]?.segments || [];
  const lastFlightSegment = flightSegments[flightSegments.length - 1];
  const destinationCode = lastFlightSegment?.arrival?.iataCode || "";
  const arrivalDateRaw = lastFlightSegment?.arrival?.at || "";
  const arrivalDate = arrivalDateRaw ? arrivalDateRaw.split("T")[0] : "";

  // Extract return date for hotel check-out (from return itinerary or search params)
  const returnSegments = offer?.itineraries?.[1]?.segments || [];
  const returnFirstSegment = returnSegments[0];
  const returnDateRaw = returnFirstSegment?.departure?.at || "";
  const returnDate = returnDateRaw ? returnDateRaw.split("T")[0] : "";

  // Step validation
  const validateStep = (step: number): boolean => {
    if (step === 0) return true; // Flight summary
    if (step === 1) return true; // Hotel upsell - optional
    if (step === 2) {
      // Validate passengers
      for (const p of passengers) {
        if (!p.firstName || !p.lastName || !p.dateOfBirth || !p.gender || !p.nationality ||
            !p.passportNumber || !p.passportExpiry || !p.passportCountry) {
          toast.error("Please fill in all required passenger fields");
          return false;
        }
      }
      if (!contact.email || !contact.phone) {
        toast.error("Please provide contact email and phone");
        return false;
      }
      return true;
    }
    if (step === 3) return true; // Coupons - optional
    return true;
  };

  const goNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goBack = () => {
    setCurrentStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleApplyCoupon = (code: string, disc: number) => {
    setAppliedCoupon(code);
    setDiscount(disc);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
  };

  const handleSubmit = async () => {
    if (!acceptedTerms) {
      toast.error("You must accept the Terms & Conditions to continue");
      return;
    }
    if (!offer) {
      toast.error("No offer selected");
      return;
    }

    // Geographic compliance gate — block any non-U.S. billing country.
    if (!isUsCustomer) {
      toast.error(
        "We are unable to process payments from your region. Tripile currently serves customers located in the United States only.",
      );
      return;
    }

    const productType = bookingType as "flight" | "hotel" | "car" | "flights" | "hotels" | "cars";
    const validationResult = await validatePrebooking(productType, validatedOffer || offer, clientRequestIdRef.current);

    if (!validationResult.ok) {
      if (validationResult.code === "PRICE_CHANGED") {
        setPendingPriceChangeOffer(validationResult.validatedOffer);
        return;
      }
      toast.error(validationResult.message || "Validation failed. Please try again.");
      return;
    }

    setValidatedOffer(validationResult.validatedOffer);
    setValidatedPrice(validationResult.price || null);
    setValidatedCurrency(validationResult.currency || "USD");

    // Charge the customer the FULL grand total (flight + hotel upsell - discount, etc.)
    const validatedUnit = validationResult.price || getPrice(offer);
    const computedGrandTotal = Math.max(
      0,
      (bookingType === "flights" ? validatedUnit * passengerMultiplier : validatedUnit) +
        (bookingType === "flights" ? hotelUpsellPrice : 0) -
        discount,
    );

    await createBookingAndPay(
      validationResult.validatedOffer || offer,
      computedGrandTotal,
      validationResult.currency || "USD",
      validationResult.expiresAt,
    );
  };

  const createBookingAndPay = async (offerToBook: any, checkoutPrice: number, checkoutCurrency: string, expires?: string) => {
    try {
      // Create the booking with pending_payment status
      const { data, error: fnError } = await supabase.functions.invoke("bookings-agent-assisted", {
        body: {
          productType: bookingType,
          offer,
          validatedOffer: offerToBook,
          price: checkoutPrice,
          currency: "USD",
          clientRequestId: clientRequestIdRef.current,
          userDetails: {
            name: `${passengers[0].firstName} ${passengers[0].lastName}`.trim(),
            email: contact.email,
            phone: contact.phone,
            firstName: passengers[0].firstName,
            lastName: passengers[0].lastName,
            acceptedTerms,
            passengers,
            coupon: appliedCoupon,
            discount,
            hotelRequest: hotelUpsellData,
          },
          agentId,
          expiresAt: expires,
        },
      });

      if (fnError) throw new Error(fnError.message || "Failed to create booking");
      if (!data.ok) throw new Error(data.message || "Booking creation failed");

      // Store booking details and show Stripe payment form
      setBookingId(data.bookingId);
      setBookingReference(data.bookingReference);
      setPaymentReady(true);

      // Build a compact, type-aware itinerary summary for the confirmation page
      const itinerarySummary: any = { bookingType };
      if (bookingType === "flights") {
        const out = offer?.itineraries?.[0]?.segments || [];
        const ret = offer?.itineraries?.[1]?.segments || [];
        itinerarySummary.flight = {
          origin: out[0]?.departure?.iataCode,
          destination: out[out.length - 1]?.arrival?.iataCode,
          departAt: out[0]?.departure?.at,
          arriveAt: out[out.length - 1]?.arrival?.at,
          carrier: out[0]?.carrierCode,
          flightNumber: out[0]?.number,
          stops: Math.max(0, out.length - 1),
          cabin: offer?.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || "ECONOMY",
          returnDepartAt: ret[0]?.departure?.at,
          returnArriveAt: ret[ret.length - 1]?.arrival?.at,
        };
      } else if (bookingType === "hotels") {
        const o = offer?.offers?.[0] || offer;
        itinerarySummary.hotel = {
          name: offer?.hotel?.name || (offer?.googlePlace as any)?.displayName?.text,
          address: offer?.hotel?.address || (offer?.googlePlace as any)?.formattedAddress,
          checkIn: o?.checkInDate,
          checkOut: o?.checkOutDate,
          rating: offer?.rating,
        };
      } else if (bookingType === "cars") {
        itinerarySummary.car = {
          vehicle: offer?.vehicle?.description || offer?.vehicle?.category || offer?.title,
          supplier: offer?.provider?.name || offer?.supplier?.name || offer?.vendor,
          pickup: offer?.pickup?.location || offer?.pickUpLocation,
          pickupAt: offer?.pickup?.dateTime || offer?.pickUpDate,
          dropoffAt: offer?.dropoff?.dateTime || offer?.dropOffDate,
        };
      }

      sessionStorage.setItem("pendingBooking", JSON.stringify({
        bookingId: data.bookingId,
        amount: checkoutPrice.toFixed(2),
        currency: "USD",
        bookingType,
        agentId,
        bookingReference: data.bookingReference,
        travelerInfo: { firstName: passengers[0].firstName, lastName: passengers[0].lastName, email: contact.email, phone: contact.phone },
        itinerary: itinerarySummary,
        passengers: passengers.length,
        hotelUpsell: hotelUpsellData?.wantsHotel && hotelUpsellData.selectedHotel ? {
          name: hotelUpsellData.selectedHotel.hotel?.name,
          checkIn: hotelUpsellData.checkInDate,
          checkOut: hotelUpsellData.checkOutDate,
        } : null,
      }));

      toast.success("Booking created! Complete payment below.");
    } catch (err: any) {
      toast.error(err.message || "Failed to create booking");
      clientRequestIdRef.current = generateClientRequestId();
    }
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    // Update session storage with payment info
    const pending = sessionStorage.getItem("pendingBooking");
    if (pending) {
      const parsed = JSON.parse(pending);
      parsed.paymentIntentId = paymentIntentId;
      parsed.paymentStatus = "paid";
      sessionStorage.setItem("pendingBooking", JSON.stringify(parsed));
    }
    navigate(`/booking-confirmation?booking_id=${bookingId}`);
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);
    // Don't navigate away - let user retry
  };

  const handlePriceChangeConfirm = async () => {
    setShowPriceChangeModal(false);
    clearPriceChange();
    if (priceChangeData && pendingPriceChangeOffer) {
      setValidatedOffer(pendingPriceChangeOffer);
      setValidatedPrice(priceChangeData.newPrice);
      setValidatedCurrency("USD");
      clientRequestIdRef.current = generateClientRequestId();
      await createBookingAndPay(pendingPriceChangeOffer, priceChangeData.newPrice, "USD");
    }
  };

  const handlePriceChangeCancel = () => {
    setShowPriceChangeModal(false);
    clearPriceChange();
    setPendingPriceChangeOffer(null);
    toast.info("Booking cancelled. You can search for new options.");
  };

  if (!offer) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">No offer selected. Please search and select an offer first.</p>
              <div className="mt-4 text-center">
                <Button onClick={() => navigate("/")}>Go to Search</Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Secure Booking | Tripile.com"
        description="Complete your Tripile booking securely."
        canonicalUrl={`https://tripile.com/booking/${bookingType ?? "flight"}`}
        noIndex
      />
      <Header />

      {priceChangeData && (
        <PriceChangeModal
          open={showPriceChangeModal}
          originalPrice={priceChangeData.originalPrice}
          newPrice={priceChangeData.newPrice}
          currency={priceChangeData.currency}
          onConfirm={handlePriceChangeConfirm}
          onCancel={handlePriceChangeCancel}
        />
      )}

      <main className="flex-1 pt-24 pb-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="font-display text-3xl font-bold mb-6 text-foreground mt-4">Complete Your Booking</h1>

          {/* Stepper */}
          <BookingStepper currentStep={currentStep} steps={STEPS} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 0: Flight Summary */}
              {currentStep === 0 && (
                <>
                  {bookingType === "hotels" ? (
                    <HotelSummaryCard offer={offer} />
                  ) : bookingType === "cars" ? (
                    <CarSummaryCard offer={offer} />
                  ) : (
                    <FlightSummaryCard offer={offer} />
                  )}
                  <div className="flex justify-end">
                    <Button onClick={goNext} size="lg" className="gap-2">
                      Continue <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}

              {/* Step 1: Hotel Upsell */}
              {currentStep === 1 && bookingType === "flights" && (
                <HotelUpsellStep
                  destinationCode={destinationCode}
                  arrivalDate={arrivalDate}
                  departureDate={returnDate}
                  onComplete={(data) => {
                    setHotelUpsellData(data);
                    goNext();
                  }}
                  onSkip={() => {
                    setHotelUpsellData(null);
                    goNext();
                  }}
                  disabled={isProcessing}
                />
              )}
              {currentStep === 1 && bookingType !== "flights" && (
                <>
                  <PassengerForm
                    passengers={passengers}
                    contact={contact}
                    onPassengersChange={setPassengers}
                    onContactChange={setContact}
                    disabled={isProcessing}
                  />
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={goBack} className="gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                    <Button onClick={goNext} size="lg" className="gap-2">
                      Continue to Coupons <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}

              {/* Step 2: Passengers */}
              {currentStep === 2 && (
                <>
                  <PassengerForm
                    passengers={passengers}
                    contact={contact}
                    onPassengersChange={setPassengers}
                    onContactChange={setContact}
                    disabled={isProcessing}
                  />
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={goBack} className="gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                    <Button onClick={goNext} size="lg" className="gap-2">
                      Continue to Coupons <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}

              {/* Step 3: Coupons */}
              {currentStep === 3 && (
                <>
                  <CouponSection
                    totalPrice={flightSubtotal + hotelSubtotal + carSubtotal}
                    appliedCoupon={appliedCoupon}
                    discount={discount}
                    onApplyCoupon={handleApplyCoupon}
                    onRemoveCoupon={handleRemoveCoupon}
                    disabled={isProcessing}
                  />
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={goBack} className="gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                    <Button onClick={goNext} size="lg" className="gap-2">
                      Continue to Payment <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}

              {/* Step 4: Payment */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  {/* Booking Summary */}
                  <Card className="bg-card border-border">
                    <CardContent className="p-6 space-y-4">
                      <h2 className="text-xl font-semibold text-foreground">Booking Summary</h2>

                      {/* Flight summary — only for flight bookings */}
                      {bookingType === "flights" && (
                        <div className="p-4 bg-muted/30 rounded-lg text-sm space-y-1">
                          <p className="font-medium text-foreground">
                            ✈️ {offer.itineraries?.[0]?.segments?.[0]?.departure?.iataCode} →{" "}
                            {offer.itineraries?.[0]?.segments?.slice(-1)[0]?.arrival?.iataCode}
                          </p>
                          <p className="text-muted-foreground">
                            {passengers.length} Passenger{passengers.length > 1 ? "s" : ""} •{" "}
                            {passengers[0].firstName} {passengers[0].lastName}
                            {passengers.length > 1 && ` + ${passengers.length - 1} more`}
                          </p>
                          <p className="text-muted-foreground">{contact.email} • {contact.phone}</p>
                        </div>
                      )}

                      {/* Hotel-only summary */}
                      {bookingType === "hotels" && (
                        <div className="p-4 bg-muted/30 rounded-lg text-sm space-y-1">
                          <p className="font-medium text-foreground">
                            🏨 {offer?.hotel?.name || (offer?.googlePlace as any)?.displayName?.text || "Hotel"}
                          </p>
                          <p className="text-muted-foreground">
                            {offer?.offers?.[0]?.checkInDate} → {offer?.offers?.[0]?.checkOutDate}
                          </p>
                          <p className="text-muted-foreground">{contact.email} • {contact.phone}</p>
                        </div>
                      )}

                      {/* Car-only summary */}
                      {bookingType === "cars" && (
                        <div className="p-4 bg-muted/30 rounded-lg text-sm space-y-1">
                          <p className="font-medium text-foreground">
                            🚗 {offer?.vehicle?.description || offer?.vehicle?.category || offer?.title || "Vehicle"}
                          </p>
                          <p className="text-muted-foreground">{contact.email} • {contact.phone}</p>
                        </div>
                      )}

                      {/* Hotel upsell (flight + hotel package) */}
                      {bookingType === "flights" && hotelUpsellOffer && (
                        <div className="p-4 bg-muted/30 rounded-lg text-sm space-y-1">
                          <p className="font-medium text-foreground">
                            🏨 {hotelUpsellOffer.hotel?.name || "Hotel"} — {destinationCode}
                          </p>
                          <p className="text-muted-foreground">
                            {hotelUpsellData?.checkInDate} → {hotelUpsellData?.checkOutDate} • {hotelUpsellData?.rooms} Room{(hotelUpsellData?.rooms || 1) > 1 ? "s" : ""}
                          </p>
                          <p className="font-medium text-primary">
                            Hotel: {formatCurrency(hotelUpsellPrice, hotelUpsellCurrency)}
                          </p>
                        </div>
                      )}

                      {/* Price breakdown */}
                      <div className="p-4 bg-muted/30 rounded-lg text-sm space-y-2">
                        {flightSubtotal > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Flight Subtotal {passengerMultiplier > 1 && `(${passengerMultiplier}x)`}
                            </span>
                            <span className="text-foreground">{formatCurrency(flightSubtotal, currency)}</span>
                          </div>
                        )}
                        {hotelSubtotal > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Hotel Subtotal</span>
                            <span className="text-foreground">{formatCurrency(hotelSubtotal, currency)}</span>
                          </div>
                        )}
                        {carSubtotal > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Car Subtotal</span>
                            <span className="text-foreground">{formatCurrency(carSubtotal, currency)}</span>
                          </div>
                        )}
                        {bookingType === "flights" && taxes > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Taxes & Fees (included)</span>
                            <span className="text-foreground">
                              {formatCurrency(taxes * passengerMultiplier, currency)}
                            </span>
                          </div>
                        )}
                        {discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount ({appliedCoupon})</span>
                            <span>-{formatCurrency(discount, currency)}</span>
                          </div>
                        )}
                        <div className="border-t border-border pt-2 flex justify-between font-bold text-base">
                          <span className="text-foreground">Grand Total</span>
                          <span className="text-primary">{formatCurrency(finalTotal, currency)}</span>
                        </div>
                      </div>

                      {/* Compliance summary */}
                      <div className="p-4 rounded-lg border border-border bg-muted/20">
                        <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-green-600" />
                          Payment Compliance
                        </p>
                        <ul className="space-y-1.5 text-sm text-foreground/90">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            Payments processed securely through Stripe
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            U.S. customers only
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            No payments accepted from restricted jurisdictions
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            No alternative payment methods offered for blocked regions
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Billing Country (U.S. only) */}
                  <div className="p-4 bg-card border border-border rounded-lg space-y-2">
                    <Label htmlFor="billing-country" className="text-sm font-medium text-foreground">
                      Billing Country <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={billingCountry}
                      onValueChange={setBillingCountry}
                      disabled={isProcessing || paymentReady}
                    >
                      <SelectTrigger id="billing-country" className="bg-background">
                        <SelectValue placeholder="Select your billing country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="United States">United States</SelectItem>
                      </SelectContent>
                    </Select>
                    {!isUsCustomer ? (
                      <p className="text-xs text-destructive flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Only U.S.-based customers may complete bookings at this time.
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Tripile currently accepts bookings and payments only from customers located in the United
                        States.
                      </p>
                    )}
                  </div>

                  {/* Payment Notice */}
                  <div className="p-4 rounded-lg border border-amber-500/40 bg-amber-500/10 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground/90">
                      <span className="font-semibold text-foreground">Payment Notice:</span> Tripile currently accepts
                      bookings and payments only from customers located in the United States. Transactions from
                      restricted countries or jurisdictions cannot be processed.
                    </p>
                  </div>


                  {/* Terms */}
                  <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      disabled={isProcessing || paymentReady}
                      onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                    />
                    <div className="space-y-1">
                      <label htmlFor="terms" className="text-sm font-medium leading-none">
                        I agree to the{" "}
                        <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          Terms & Conditions
                        </a>
                      </label>
                      <p className="text-xs text-muted-foreground">
                        You must accept the Terms & Conditions before booking.
                      </p>
                    </div>
                  </div>

                  {/* Stripe Payment Form — shown after booking is created */}
                  {paymentReady && bookingId ? (
                    <StripePaymentForm
                      bookingId={bookingId}
                      amount={finalTotal}
                      currency={currency}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      disabled={isProcessing}
                      termsAccepted={acceptedTerms}
                      billingCountry={billingCountry}
                    />
                  ) : (
                    <div className="space-y-3">
                      {!isUsCustomer && (
                        <div className="p-4 rounded-lg border border-destructive/40 bg-destructive/10 flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-destructive">
                            We are unable to process payments from your region. Tripile currently serves customers
                            located in the United States only.
                          </p>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <Button variant="outline" onClick={goBack} className="gap-2">
                          <ArrowLeft className="w-4 h-4" /> Back
                        </Button>
                        <Button
                          size="lg"
                          onClick={handleSubmit}
                          disabled={isProcessing || !acceptedTerms || !isUsCustomer}
                          className="gap-2"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              {validating ? "Validating Price..." : "Creating Booking..."}
                            </>
                          ) : (
                            "Proceed to Payment"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}


                  {paymentReady && (
                    <Button variant="ghost" onClick={goBack} className="gap-2 text-muted-foreground">
                      <ArrowLeft className="w-4 h-4" /> Back to Review
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar - Price Summary */}
            <div className="lg:col-span-1">
              <PriceSummaryCard
                basePrice={basePerUnit}
                taxes={taxes}
                discount={discount}
                currency={currency}
                passengerCount={passengerMultiplier}
                couponCode={appliedCoupon}
                flightSubtotal={flightSubtotal}
                hotelSubtotal={hotelSubtotal}
                carSubtotal={carSubtotal}
                bookingType={bookingType}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Booking;
