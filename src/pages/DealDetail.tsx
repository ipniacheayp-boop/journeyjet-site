import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { mockDeals, type Deal } from "@/data/mockDeals";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Plane, ArrowRight, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const DealDetail = () => {
  const { id } = useParams();
  const deal = mockDeals.find(d => d.id === id);

  if (!deal) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Deal Not Found</h1>
            <Link to="/deals">
              <Button>Browse All Deals</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const discount = deal.originalPrice
    ? Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Image */}
          <div className="relative h-96 rounded-2xl overflow-hidden mb-8">
            <img
              src={deal.image}
              alt={deal.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h1 className="text-4xl font-bold mb-2">{deal.title}</h1>
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{deal.origin} → {deal.destination}</span>
                </div>
                <Badge variant="secondary" className="bg-accent text-accent-foreground">
                  Save {discount}%
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Flight Details */}
              <section className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Flight Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <Plane className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="font-semibold mb-1">Airline</p>
                      <p className="text-muted-foreground">{deal.airline}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="font-semibold mb-1">Travel Dates</p>
                      <p className="text-muted-foreground">
                        {new Date(deal.departDate).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                        {' - '}
                        {new Date(deal.returnDate).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="font-semibold mb-1">Cabin Class</p>
                      <p className="text-muted-foreground">{deal.cabinClass}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="font-semibold mb-1">Duration</p>
                      <p className="text-muted-foreground">Varies by route</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* About */}
              <section className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">About This Deal</h2>
                <div className="prose max-w-none text-muted-foreground">
                  <p className="mb-4">
                    Experience an unforgettable journey from {deal.origin} to {deal.destination} with {deal.airline}. 
                    This exclusive deal offers incredible value for travelers looking to explore new destinations.
                  </p>
                  <p className="mb-4">
                    Your adventure includes comfortable {deal.cabinClass} seating, ensuring a pleasant flight experience. 
                    Take advantage of this limited-time offer to save on your next trip.
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Flexible date changes available</li>
                    <li>Complimentary baggage allowance</li>
                    <li>24/7 customer support</li>
                    <li>Secure online booking</li>
                  </ul>
                </div>
              </section>
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Price per person</p>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-bold text-primary">${deal.price}</span>
                    {deal.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through">
                        ${deal.originalPrice}
                      </span>
                    )}
                  </div>
                  {discount > 0 && (
                    <Badge variant="secondary" className="bg-accent text-accent-foreground">
                      Save ${deal.originalPrice! - deal.price} ({discount}% off)
                    </Badge>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <Link to={`/booking/${deal.id}`}>
                    <Button size="lg" className="w-full gap-2">
                      Book Now <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="w-full">
                    Contact Support
                  </Button>
                </div>

                <div className="border-t pt-4 space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    ✓ Free cancellation within 24 hours
                  </p>
                  <p className="flex items-center gap-2">
                    ✓ Price guarantee
                  </p>
                  <p className="flex items-center gap-2">
                    ✓ Secure payment
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DealDetail;
