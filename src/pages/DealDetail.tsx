import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { mockDeals, type Deal } from "@/data/mockDeals";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Plane, ArrowRight, Clock, Users, Shield, HelpCircle, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import FAQSchema from "@/components/seo/FAQSchema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

  const faqs = [
    { question: `How much does a flight from ${deal.origin} to ${deal.destination} cost?`, answer: `Flights from ${deal.origin} to ${deal.destination} start at $${deal.price} with ${deal.airline}. Prices vary by date and cabin class.` },
    { question: `What is the best time to book flights to ${deal.destination}?`, answer: `Book 2-4 weeks in advance for the best prices. Midweek departures (Tue-Thu) tend to be cheaper.` },
    { question: `Can I cancel or change my booking?`, answer: `Most bookings offer free cancellation within 24 hours. Changes may incur a fee depending on the fare type. Contact our 24/7 support for help.` },
    { question: `Does Tripile.com charge any hidden fees?`, answer: `No. The price you see includes all taxes and fees. We offer a Price Match Guarantee — find it cheaper elsewhere and we'll match it.` },
  ];

  const relatedDeals = mockDeals.filter(d => d.id !== deal.id && (d.destination === deal.destination || d.origin === deal.origin)).slice(0, 4);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": deal.title,
    "description": `Book cheap ${deal.cabinClass} flights from ${deal.origin} to ${deal.destination} with ${deal.airline} starting at $${deal.price}. Save ${discount}% with Tripile.com.`,
    "url": `https://tripile.com/deals/${deal.id}`,
    "image": deal.image,
    "category": "Flight",
    "brand": { "@type": "Organization", "name": "Tripile.com" },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": deal.price.toFixed(2),
      "availability": "https://schema.org/InStock",
      "validFrom": deal.departDate,
      "priceValidUntil": deal.returnDate,
      "seller": { "@type": "Organization", "name": "Tripile.com" },
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "2847",
      "bestRating": "5",
      "worstRating": "1",
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{`${deal.origin} to ${deal.destination} from $${deal.price} – ${deal.airline} | Tripile.com`}</title>
        <meta name="description" content={`Book cheap ${deal.cabinClass} flights from ${deal.origin} to ${deal.destination} with ${deal.airline}. Save ${discount}% — fares from $${deal.price}. Price Match Guarantee on Tripile.com.`} />
        <meta name="keywords" content={`${deal.origin} to ${deal.destination} flights, cheap ${deal.destination} flights, ${deal.airline} deals, buy ${deal.destination} flights, ${deal.destination} flight reviews`} />
        <link rel="canonical" href={`https://tripile.com/deals/${deal.id}`} />
        <meta property="og:title" content={`${deal.origin} to ${deal.destination} from $${deal.price} | Tripile.com`} />
        <meta property="og:description" content={`Save ${discount}% on ${deal.cabinClass} flights with ${deal.airline}. Book now from $${deal.price}.`} />
        <meta property="og:url" content={`https://tripile.com/deals/${deal.id}`} />
        <meta property="og:type" content="product" />
        <meta property="og:image" content={deal.image} />
        <meta property="product:price:amount" content={deal.price.toString()} />
        <meta property="product:price:currency" content="USD" />
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
      </Helmet>

      <BreadcrumbSchema items={[
        { name: "Home", url: "https://tripile.com/" },
        { name: "Deals", url: "https://tripile.com/deals" },
        { name: `${deal.origin} to ${deal.destination}`, url: `https://tripile.com/deals/${deal.id}` },
      ]} />

      <FAQSchema faqs={faqs} />

      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Visual Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/deals" className="hover:text-foreground">Deals</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">{deal.origin} → {deal.destination}</span>
          </nav>

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
              <section className="bg-card rounded-lg shadow-md p-6 border border-border">
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
              <section className="bg-card rounded-lg shadow-md p-6 border border-border">
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

              {/* FAQ Section */}
              <section className="bg-card rounded-lg shadow-md p-6 border border-border">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  Frequently Asked Questions
                </h2>
                <Accordion type="single" collapsible>
                  {faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`faq-${i}`}>
                      <AccordionTrigger className="text-sm text-left hover:text-primary transition-colors">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>

              {/* Related Deals - Internal Links */}
              {relatedDeals.length > 0 && (
                <section className="bg-card rounded-lg shadow-md p-6 border border-border">
                  <h2 className="text-2xl font-bold mb-4">Related Flight Deals</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {relatedDeals.map(rd => (
                      <Link
                        key={rd.id}
                        to={`/deals/${rd.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/50 transition-all group"
                      >
                        <Plane className="w-4 h-4 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground group-hover:text-primary truncate">{rd.origin} → {rd.destination}</p>
                          <p className="text-xs text-muted-foreground">From ${rd.price} · {rd.airline}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg shadow-md p-6 sticky top-24 border border-border">
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
                    <Shield className="w-4 h-4 text-emerald-500" /> Price Match Guarantee
                  </p>
                  <p className="flex items-center gap-2">
                    ✓ Free cancellation within 24 hours
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
