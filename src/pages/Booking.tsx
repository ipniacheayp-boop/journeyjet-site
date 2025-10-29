import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBooking } from "@/hooks/useBooking";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Booking = () => {
  const { id: bookingType } = useParams();
  const [offer, setOffer] = useState<any>(null);
  const [agentId, setAgentId] = useState<string | undefined>(undefined);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const { bookFlight, bookHotel, bookCar, loading } = useBooking();

  useEffect(() => {
    // Retrieve the selected offer from sessionStorage
    const storedData = sessionStorage.getItem('selectedOffer');
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setOffer(parsed.offer);
      setAgentId(parsed.agentId);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!offer) {
      toast.error("No offer selected");
      return;
    }

    try {
      let response;
      const bookingDetails = { ...formData, agentId };
      
      if (bookingType === "flights") {
        response = await bookFlight(offer, bookingDetails);
      } else if (bookingType === "hotels") {
        response = await bookHotel(offer, bookingDetails);
      } else if (bookingType === "cars") {
        response = await bookCar(offer, bookingDetails);
      }

      if (response?.checkoutUrl) {
        // Store booking details for payment options page
        const bookingData = {
          checkoutUrl: response.checkoutUrl,
          bookingId: response.bookingId,
          amount: total.toFixed(2),
          currency: currency,
          bookingType: bookingType,
          agentId
        };
        sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));
        
        // Navigate to payment options page or agent dashboard
        if (agentId) {
          window.location.href = '/payment-options';
        } else {
          window.location.href = '/payment-options';
        }
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (error: any) {
      toast.error(error.message || "Booking failed");
    }
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
                <Button onClick={() => window.location.href = "/"}>
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
      return offer.price?.total || offer.price?.grandTotal || "N/A";
    } else if (bookingType === "hotels") {
      return offer.offers?.[0]?.price?.total || offer.price?.total || "N/A";
    } else if (bookingType === "cars") {
      return offer.price?.total || "N/A";
    }
    return "N/A";
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

  const price = parseFloat(getPrice());
  const currency = getCurrency();
  const taxes = price * 0.15; // 15% estimated taxes
  const total = price + taxes;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
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
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          required
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
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Proceed to Payment"
                      )}
                    </Button>
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
                      <p className="text-sm text-muted-foreground">
                        {offer.vehicle?.make} {offer.vehicle?.model || "Car Rental"}
                      </p>
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
