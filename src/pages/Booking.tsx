import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useBookingFlow } from "@/hooks/useBookingFlow";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useFxSmartSave } from "@/hooks/useFxSmartSave";
import FxSmartSaveCheckout from "@/components/FxSmartSaveCheckout";
import PriceChangeModal from "@/components/PriceChangeModal";

const Booking = () => {
  const { id: bookingType } = useParams();
  const navigate = useNavigate();
  const { user } = useRequireAuth();
  const [offer, setOffer] = useState<any>(null);
  const [agentId, setAgentId] = useState<string | undefined>(undefined);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Idempotency: Generate clientRequestId once per booking attempt
  const clientRequestIdRef = useRef<string>('');
  const [validatedOffer, setValidatedOffer] = useState<any>(null);
  const [validatedPrice, setValidatedPrice] = useState<number | null>(null);
  const [validatedCurrency, setValidatedCurrency] = useState<string>('USD');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [showPriceChangeModal, setShowPriceChangeModal] = useState(false);
  const [pendingPriceChangeOffer, setPendingPriceChangeOffer] = useState<any>(null);

  const {
    loading,
    validating,
    error,
    priceChangeData,
    generateClientRequestId,
    validatePrebooking,
    createProvisionalBooking,
    clearPriceChange,
  } = useBookingFlow();

  useEffect(() => {
    // Retrieve the selected offer from sessionStorage
    const storedData = sessionStorage.getItem('selectedOffer');
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setOffer(parsed.offer);
      setAgentId(parsed.agentId);
    }
    // Generate a fresh clientRequestId for this booking session
    clientRequestIdRef.current = generateClientRequestId();
  }, [generateClientRequestId]);

  // Show price change modal when price changes
  useEffect(() => {
    if (priceChangeData) {
      setShowPriceChangeModal(true);
    }
  }, [priceChangeData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms) {
      toast.error("You must accept the Terms & Conditions to continue");
      return;
    }

    if (!offer) {
      toast.error("No offer selected");
      return;
    }

    // Step 1: Validate prebooking with provider
    const productType = bookingType as 'flight' | 'hotel' | 'car' | 'flights' | 'hotels' | 'cars';
    const validationResult = await validatePrebooking(
      productType,
      validatedOffer || offer,
      clientRequestIdRef.current
    );

    if (!validationResult.ok) {
      if (validationResult.code === 'PRICE_CHANGED') {
        // Modal will be shown via useEffect
        setPendingPriceChangeOffer(validationResult.validatedOffer);
        return;
      }
      toast.error(validationResult.message || 'Validation failed. Please try again.');
      return;
    }

    // If we already have a booking from idempotency check
    if (validationResult.existingBooking && validationResult.bookingId) {
      toast.info("Resuming your existing booking...");
      // Need to create checkout session for existing booking
    }

    // Store validated data
    setValidatedOffer(validationResult.validatedOffer);
    setValidatedPrice(validationResult.price || null);
    setValidatedCurrency(validationResult.currency || 'USD');
    setExpiresAt(validationResult.expiresAt || null);

    // Step 2: Create provisional booking
    await proceedToCheckout(
      validationResult.validatedOffer || offer,
      validationResult.price || parseFloat(getPrice()),
      validationResult.currency || 'USD',
      validationResult.expiresAt
    );
  };

  const proceedToCheckout = async (
    offerToBook: any,
    price: number,
    currency: string,
    expires?: string
  ) => {
    const productType = bookingType as string;
    
    const result = await createProvisionalBooking(
      productType,
      offer,
      offerToBook,
      price,
      currency,
      clientRequestIdRef.current,
      {
        ...formData,
        acceptedTerms,
      },
      agentId,
      expires
    );

    if (!result.ok) {
      toast.error(result.message || 'Failed to create booking');
      // Generate new clientRequestId for retry
      clientRequestIdRef.current = generateClientRequestId();
      return;
    }

    if (result.checkoutUrl) {
      // Store booking details for status polling after payment
      sessionStorage.setItem('pendingBooking', JSON.stringify({
        bookingId: result.bookingId,
        checkoutUrl: result.checkoutUrl,
        amount: price.toFixed(2),
        currency,
        bookingType,
        agentId,
      }));

      toast.success("Redirecting to secure payment...");
      
      // Redirect to Stripe Checkout
      window.location.href = result.checkoutUrl;
    } else {
      toast.error("Failed to create checkout session");
    }
  };

  const handlePriceChangeConfirm = async () => {
    setShowPriceChangeModal(false);
    clearPriceChange();

    if (priceChangeData && pendingPriceChangeOffer) {
      // Update with new price and proceed
      setValidatedOffer(pendingPriceChangeOffer);
      setValidatedPrice(priceChangeData.newPrice);
      setValidatedCurrency(priceChangeData.currency);
      
      // Generate new clientRequestId for the new price
      clientRequestIdRef.current = generateClientRequestId();
      
      await proceedToCheckout(
        pendingPriceChangeOffer,
        priceChangeData.newPrice,
        priceChangeData.currency
      );
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
              <p className="text-center text-muted-foreground">
                No offer selected. Please search and select an offer first.
              </p>
              <div className="mt-4 text-center">
                <Button onClick={() => navigate("/")}>
                  Go to Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Extract pricing info based on booking type
  const getPrice = () => {
    if (bookingType === "flights") {
      return offer.price?.total || offer.price?.grandTotal || "0";
    } else if (bookingType === "hotels") {
      return offer.offers?.[0]?.price?.total || offer.price?.total || "0";
    } else if (bookingType === "cars") {
      return offer.price?.total || "0";
    }
    return "0";
  };

  const getCurrency = () => {
    if (bookingType === "flights") {
      return offer.price?.currency || "USD";
    } else if (bookingType === "hotels") {
      return offer.offers?.[0]?.price?.currency || offer.price?.currency || "USD";
    } else if (bookingType === "cars") {
      return offer.price?.currency || "USD";
    }
    return "USD";
  };

  const price = validatedPrice || parseFloat(getPrice());
  const currency = validatedCurrency || getCurrency();
  const taxes = price * 0.15; // 15% estimated taxes
  const total = price + taxes;

  // FX-SmartSave calculation
  const { data: fxData } = useFxSmartSave({
    productType: bookingType as 'flight' | 'hotel' | 'car',
    prices: [
      { currency: 'USD', amount: total },
      { currency: 'EUR', amount: total * 0.92 },
      { currency: 'GBP', amount: total * 0.79 },
    ],
    travelDate: offer?.itineraries?.[0]?.segments?.[0]?.departure?.at?.split('T')[0],
  });

  const handleCurrencySelect = (useRecommended: boolean, curr: string) => {
    setSelectedCurrency(curr);
  };

  const isProcessing = loading || validating;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Price Change Modal */}
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
      
      <main className="flex-1 pt-24 pb-16 bg-secondary">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-4xl font-bold mb-8">Complete Your Booking</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Traveler Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          required
                          disabled={isProcessing}
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          required
                          disabled={isProcessing}
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        disabled={isProcessing}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        disabled={isProcessing}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    {/* FX-SmartSave Checkout Panel */}
                    {fxData && fxData.savingsUSD >= 5 && (
                      <FxSmartSaveCheckout
                        savingsUSD={fxData.savingsUSD}
                        recommendedCurrency={fxData.recommendedCurrency}
                        recommendedAmountLocal={fxData.recommendedAmountLocal}
                        recommendedAmountUSD={fxData.recommendedAmountUSD}
                        originalCurrency={currency}
                        originalAmount={total}
                        travelDate={offer?.itineraries?.[0]?.segments?.[0]?.departure?.at?.split('T')[0]}
                        onCurrencySelect={handleCurrencySelect}
                      />
                    )}

                    <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                      <Checkbox
                        id="terms"
                        checked={acceptedTerms}
                        disabled={isProcessing}
                        onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                      />
                      <div className="space-y-1">
                        <label
                          htmlFor="terms"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I agree to the{" "}
                          <a
                            href="/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Terms & Conditions
                          </a>
                        </label>
                        <p className="text-xs text-muted-foreground">
                          You must accept the Terms & Conditions before booking.
                        </p>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full" 
                      disabled={isProcessing || !acceptedTerms}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {validating ? "Validating Price..." : "Creating Booking..."}
                        </>
                      ) : (
                        "Proceed to Payment"
                      )}
                    </Button>

                    {validatedOffer && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Price validated with provider</span>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 capitalize">{bookingType} Booking</h3>
                    {bookingType === "flights" && (
                      <p className="text-sm text-muted-foreground">
                        {offer.itineraries?.[0]?.segments?.[0]?.departure?.iataCode} →{" "}
                        {offer.itineraries?.[0]?.segments?.slice(-1)[0]?.arrival?.iataCode}
                      </p>
                    )}
                    {bookingType === "hotels" && (
                      <p className="text-sm text-muted-foreground">
                        {offer.hotel?.name || "Hotel Booking"}
                      </p>
                    )}
                    {bookingType === "cars" && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {offer.vehicle?.make} {offer.vehicle?.model || offer.vehicle?.category || "Car Rental"}
                        </p>
                        {offer.provider?.name && (
                          <p className="text-xs text-muted-foreground">Provider: {offer.provider.name}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Base Price</span>
                      <span>${price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Taxes & Fees</span>
                      <span>${taxes.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-primary">${total.toFixed(2)} {currency}</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground pt-4 border-t">
                    <p>
                      By clicking "Proceed to Payment", you agree to our{" "}
                      <a href="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="/terms" className="text-primary hover:underline">
                        Privacy Policy
                      </a>
                      .
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Booking;
