import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { 
  Plane, 
  MapPin, 
  DollarSign, 
  Clock, 
  ArrowRight, 
  Building2,
  Star,
  Shield,
  Phone,
  ChevronRight,
  Users,
  Calendar
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AirportSchema from "@/components/seo/AirportSchema";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import FAQSchema from "@/components/seo/FAQSchema";
import ReviewSchema from "@/components/seo/ReviewSchema";
import { findAirportBySlug, airportLandingPages } from "@/data/airportLandingData";

const AirportLandingPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const airport = findAirportBySlug(slug || "");

  // Handle not found
  if (!airport) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Airport Not Found</h1>
          <p className="text-muted-foreground mb-8">
            We couldn't find information for this airport.
          </p>
          <Link to="/deals">
            <Button>Browse All Deals</Button>
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  // Dynamic SEO content
  const pageTitle = `Cheap Flights from ${airport.cityName} (${airport.airportCode}) | ${airport.airportName} Deals`;
  const pageDescription = airport.description;
  const canonicalUrl = `https://cheapflights.com/cheap-flights-from-${airport.slug}`;

  // Breadcrumbs
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Flights", url: "/deals" },
    { name: airport.stateName, url: `/flights/${airport.stateCode.toLowerCase()}` },
    { name: `${airport.cityName} (${airport.airportCode})`, url: canonicalUrl },
  ];

  // Get related airports (same state or nearby)
  const relatedAirports = airportLandingPages
    .filter((a) => a.slug !== airport.slug && a.stateCode === airport.stateCode)
    .slice(0, 4);

  return (
    <>
      <Header />

      {/* SEO Meta Tags */}
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content={`cheap flights ${airport.cityName}, ${airport.airportCode} flights, ${airport.airportName} deals, flights from ${airport.cityName} ${airport.stateCode}, budget airfare ${airport.airportCode}`}
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={airport.destinationImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>

      {/* Structured Data */}
      <AirportSchema
        airportName={airport.airportName}
        airportCode={airport.airportCode}
        cityName={airport.cityName}
        stateName={airport.stateName}
        samplePrice={airport.samplePrice}
        sampleRoute={airport.sampleRoute}
        coordinates={airport.coordinates}
      />
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={airport.faqs} />
      <ReviewSchema ratingValue={4.5} reviewCount={1847} />

      <main className="pt-16">
        {/* Breadcrumb Navigation */}
        <nav className="container mx-auto px-4 py-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.name} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="h-4 w-4" />}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-foreground font-medium">{crumb.name}</span>
                ) : (
                  <Link to={crumb.url} className="hover:text-primary transition-colors">
                    {crumb.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/5 py-12 md:py-20">
          {/* Background Image Overlay */}
          <div
            className="absolute inset-0 opacity-10 bg-cover bg-center"
            style={{ backgroundImage: `url(${airport.destinationImage})` }}
          />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-8">
                <Badge variant="secondary" className="mb-4">
                  <MapPin className="h-3 w-3 mr-1" />
                  {airport.stateName}
                </Badge>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                  Cheap Flights from {airport.cityName} ({airport.airportCode})
                </h1>
                
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-2">
                  {airport.airportName}
                </p>
                
                <p className="text-muted-foreground max-w-3xl mx-auto">
                  Compare prices from top airlines and find the best deals on flights 
                  departing from {airport.cityName}, {airport.stateName}. 
                  Fares starting at just ${airport.samplePrice} to {airport.sampleRoute}.
                </p>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="bg-card/80 backdrop-blur border-0 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <DollarSign className="h-6 w-6 text-accent mx-auto mb-2" />
                    <p className="text-2xl md:text-3xl font-bold text-foreground">
                      ${airport.samplePrice}
                    </p>
                    <p className="text-sm text-muted-foreground">Starting Price</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-card/80 backdrop-blur border-0 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-2xl md:text-3xl font-bold text-foreground">
                      {airport.averageFlightTime}
                    </p>
                    <p className="text-sm text-muted-foreground">To Major Hub</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-card/80 backdrop-blur border-0 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <Plane className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-2xl md:text-3xl font-bold text-foreground">
                      {airport.popularAirlines.length}+
                    </p>
                    <p className="text-sm text-muted-foreground">Airlines</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-card/80 backdrop-blur border-0 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <MapPin className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-2xl md:text-3xl font-bold text-foreground">
                      {airport.popularDestinations.length}+
                    </p>
                    <p className="text-sm text-muted-foreground">Destinations</p>
                  </CardContent>
                </Card>
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <Link to={`/search-results?type=flight&from=${airport.airportCode}`}>
                  <Button size="lg" className="gap-2 text-lg px-8">
                    Search Flights from {airport.airportCode}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Destinations */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Popular Destinations from {airport.cityName}
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {airport.popularDestinations.map((dest) => (
                <Link
                  key={dest.code}
                  to={`/search-results?type=flight&from=${airport.airportCode}&to=${dest.code}`}
                  className="group"
                >
                  <Card className="transition-all hover:shadow-lg hover:border-primary/50">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 rounded-full p-2">
                          <Plane className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {airport.airportCode} → {dest.code}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {airport.cityName} to {dest.city}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-accent">
                          ${dest.price}
                        </p>
                        <p className="text-xs text-muted-foreground">one-way</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Airport Information */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
              {/* About the Airport */}
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-primary" />
                  About {airport.airportName}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {airport.airportName} ({airport.airportCode}) serves the {airport.cityName} metropolitan area 
                  in {airport.stateName}. Find cheap flights and compare prices from multiple airlines 
                  to get the best deals on your next trip.
                </p>
                
                <h3 className="font-semibold mb-3">Why Fly from {airport.airportCode}?</h3>
                <ul className="space-y-2">
                  {airport.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-accent mt-1 shrink-0" />
                      <span className="text-muted-foreground">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Airlines & Nearby Airports */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Airlines at {airport.airportCode}</h3>
                  <div className="flex flex-wrap gap-2">
                    {airport.popularAirlines.map((airline) => (
                      <Badge key={airline} variant="outline">
                        {airline}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Nearby Airports</h3>
                  <div className="space-y-2">
                    {airport.nearbyAirports.map((nearby) => (
                      <div
                        key={nearby.code}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{nearby.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ({nearby.code})
                          </p>
                        </div>
                        <Badge variant="secondary">{nearby.distance}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-8 md:gap-12">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-5 w-5 text-accent" />
                <span className="text-sm">Secure Booking</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-5 w-5 text-accent" />
                <span className="text-sm">Best Price Guarantee</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-sm">24/7 Support</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm">2M+ Happy Travelers</span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Frequently Asked Questions about {airport.airportCode}
            </h2>
            
            <div className="max-w-3xl mx-auto space-y-4">
              {airport.faqs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Related Airports */}
        {relatedAirports.length > 0 && (
          <section className="py-12 md:py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-center mb-8">
                Other Airports in {airport.stateName}
              </h2>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
                {relatedAirports.map((related) => (
                  <Link
                    key={related.slug}
                    to={`/cheap-flights-from-${related.slug}`}
                    className="group"
                  >
                    <Card className="transition-all hover:shadow-lg hover:border-primary/50">
                      <CardContent className="p-4 text-center">
                        <div className="bg-primary/10 rounded-full p-3 w-fit mx-auto mb-3">
                          <Plane className="h-5 w-5 text-primary" />
                        </div>
                        <p className="font-semibold group-hover:text-primary transition-colors">
                          {related.cityName} ({related.airportCode})
                        </p>
                        <p className="text-sm text-muted-foreground">
                          From ${related.samplePrice}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="py-12 md:py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Book Your Flight from {airport.cityName}?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Compare prices from {airport.popularAirlines.join(", ")} and more. 
              Find the best deals on flights from {airport.airportName}.
            </p>
            <Link to={`/search-results?type=flight&from=${airport.airportCode}`}>
              <Button size="lg" variant="secondary" className="gap-2">
                <Calendar className="h-5 w-5" />
                Search Flights Now
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default AirportLandingPage;
