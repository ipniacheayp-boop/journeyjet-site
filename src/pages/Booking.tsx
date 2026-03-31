import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useBookingFlow } from "@/hooks/useBookingFlow";
import { toast } from "sonner";
import { Loader2, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import PriceChangeModal from "@/components/PriceChangeModal";
import BookingStepper from "@/components/booking/BookingStepper";
import FlightSummaryCard from "@/components/booking/FlightSummaryCard";
import PassengerForm, { type Passenger, type ContactDetails } from "@/components/booking/PassengerForm";
import CouponSection from "@/components/booking/CouponSection";
import PriceSummaryCard from "@/components/booking/PriceSummaryCard";
import HotelUpsellStep, { type HotelUpsellData } from "@/components/booking/HotelUpsellStep";

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

  // Passenger & contact state
  const [passengers, setPassengers] = useState<Passenger[]>([{ ...emptyPassenger }]);
  const [contact, setContact] = useState<ContactDetails>({ email: "", phone: "" });

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);

  // Hotel upsell state
  const [hotelUpsellData, setHotelUpsellData] = useState<HotelUpsellData | null>(null);

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

  const price = validatedPrice || getPrice(offer);
  const currency = validatedCurrency || getCurrency(offer);
  const taxes = price * 0.15;
  const total = price + taxes;
  const finalTotal = total * passengers.length - discount;

  const isProcessing = loading || validating;

  // Extract flight destination info for hotel upsell
  const flightSegments = offer?.itineraries?.[0]?.segments || [];
  const lastFlightSegment = flightSegments[flightSegments.length - 1];
  const destinationCode = lastFlightSegment?.arrival?.iataCode || "";
  const arrivalDateRaw = lastFlightSegment?.arrival?.at || "";
  const arrivalDate = arrivalDateRaw ? arrivalDateRaw.split("T")[0] : "";

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

    await proceedToCheckout(
      validationResult.validatedOffer || offer,
      validationResult.price || getPrice(offer),
      validationResult.currency || "USD",
      validationResult.expiresAt,
    );
  };

  const proceedToCheckout = async (offerToBook: any, checkoutPrice: number, checkoutCurrency: string, expires?: string) => {
    try {
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
          },
          agentId,
          expiresAt: expires,
        },
      });

      if (fnError) throw new Error(fnError.message || "Failed to create booking");
      if (!data.ok) throw new Error(data.message || "Booking creation failed");

      sessionStorage.setItem("pendingBooking", JSON.stringify({
        bookingId: data.bookingId,
        checkoutUrl: null,
        amount: (checkoutPrice).toFixed(2),
        currency: "USD",
        bookingType,
        agentId,
        bookingReference: data.bookingReference,
        travelerInfo: { firstName: passengers[0].firstName, lastName: passengers[0].lastName, email: contact.email, phone: contact.phone },
      }));

      toast.success("Booking confirmed! Our agent will contact you shortly.");
      navigate(`/agent-will-connect?booking_id=${data.bookingId}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create booking");
      clientRequestIdRef.current = generateClientRequestId();
    }
  };

  const handlePriceChangeConfirm = async () => {
    setShowPriceChangeModal(false);
    clearPriceChange();
    if (priceChangeData && pendingPriceChangeOffer) {
      setValidatedOffer(pendingPriceChangeOffer);
      setValidatedPrice(priceChangeData.newPrice);
      setValidatedCurrency("USD");
      clientRequestIdRef.current = generateClientRequestId();
      await proceedToCheckout(pendingPriceChangeOffer, priceChangeData.newPrice, "USD");
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
                  <FlightSummaryCard offer={offer} />
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
                    totalPrice={total * passengers.length}
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
                <Card className="bg-card border-border">
                  <CardContent className="p-6 space-y-6">
                    <h2 className="text-xl font-semibold text-foreground">Confirm & Pay</h2>

                    {/* Mini flight summary */}
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

                    {/* Hotel summary if selected */}
                    {hotelUpsellData?.wantsHotel && (
                      <div className="p-4 bg-muted/30 rounded-lg text-sm space-y-1">
                        <p className="font-medium text-foreground">🏨 Hotel at {hotelUpsellData.destination}</p>
                        <p className="text-muted-foreground">
                          {hotelUpsellData.checkInDate} → {hotelUpsellData.checkOutDate} • {hotelUpsellData.rooms} Room{hotelUpsellData.rooms > 1 ? "s" : ""} • {hotelUpsellData.adults} Adult{hotelUpsellData.adults > 1 ? "s" : ""}
                          {hotelUpsellData.children > 0 && `, ${hotelUpsellData.children} Child${hotelUpsellData.children > 1 ? "ren" : ""}`}
                        </p>
                        {hotelUpsellData.preferences.length > 0 && (
                          <p className="text-muted-foreground">Preferences: {hotelUpsellData.preferences.join(", ")}</p>
                        )}
                      </div>
                    )}

                    {/* Terms */}
                    <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                      <Checkbox
                        id="terms"
                        checked={acceptedTerms}
                        disabled={isProcessing}
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

                    <div className="flex justify-between items-center">
                      <Button variant="outline" onClick={goBack} className="gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back
                      </Button>
                      <Button
                        size="lg"
                        onClick={handleSubmit}
                        disabled={isProcessing || !acceptedTerms}
                        className="gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {validating ? "Validating Price..." : "Confirming Booking..."}
                          </>
                        ) : (
                          "Continue to Payment"
                        )}
                      </Button>
                    </div>

                    {validatedOffer && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Price validated with provider</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Price Summary */}
            <div className="lg:col-span-1">
              <PriceSummaryCard
                basePrice={price}
                taxes={taxes}
                discount={discount}
                currency={currency}
                passengerCount={passengers.length}
                couponCode={appliedCoupon}
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
