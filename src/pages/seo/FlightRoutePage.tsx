import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Plane, Clock, Calendar, TrendingDown, ArrowRight, Star, Shield, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import FlightOfferSchema from '@/components/seo/FlightOfferSchema';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import FAQSchema from '@/components/seo/FAQSchema';
import ReviewSchema from '@/components/seo/ReviewSchema';
import { seoFlightRoutes } from '@/data/seoRoutes';

const FlightRoutePage = () => {
  const { slug } = useParams<{ slug: string }>();
  
  // Find the route data
  const route = seoFlightRoutes.find(r => r.slug === slug);
  
  if (!route) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Route Not Found</h1>
          <Link to="/deals" className="text-primary hover:underline">Browse All Deals</Link>
        </div>
        <Footer />
      </>
    );
  }

  const pageTitle = `Cheap Flights from ${route.origin} to ${route.destination} | Save Big – ChyeapFlights`;
  const pageDescription = `Find cheap flights from ${route.origin} to ${route.destination}. Compare airlines, get the lowest fares starting at $${route.avgPrice}, and book securely with ChyeapFlights.`;
  const canonicalUrl = `https://chyeap.lovable.app/${route.slug}`;

  // Related routes (same origin or destination)
  const relatedRoutes = seoFlightRoutes
    .filter(r => r.slug !== route.slug && (r.origin === route.origin || r.destination === route.destination))
    .slice(0, 6);

  // FAQs for this route
  const faqs = [
    {
      question: `What is the cheapest flight from ${route.origin} to ${route.destination}?`,
      answer: `The cheapest flights from ${route.origin} to ${route.destination} typically start around $${route.avgPrice}. Prices vary by season, with the best deals usually found in ${route.bestMonth}. We recommend booking 3-6 weeks in advance for the best fares.`
    },
    {
      question: `How long is the flight from ${route.origin} to ${route.destination}?`,
      answer: `Direct flights from ${route.origin} (${route.originCode}) to ${route.destination} (${route.destinationCode}) take approximately ${route.flightDuration}. Flight times may vary based on weather conditions and the specific route taken.`
    },
    {
      question: `Which airlines fly from ${route.origin} to ${route.destination}?`,
      answer: `Popular airlines on this route include ${route.popularAirlines.join(', ')}. Each airline offers different fare classes and amenities, so compare options to find the best value for your trip.`
    },
    {
      question: `When is the best time to book flights from ${route.origin} to ${route.destination}?`,
      answer: `The best time to book this route is typically ${route.bestMonth}. For the lowest fares, try booking on Tuesdays or Wednesdays, and be flexible with your travel dates. Setting price alerts can help you catch deals.`
    }
  ];

  const breadcrumbs = [
    { name: 'Home', url: 'https://chyeap.lovable.app/' },
    { name: 'Deals', url: 'https://chyeap.lovable.app/deals' },
    { name: `${route.origin} to ${route.destination}`, url: canonicalUrl }
  ];

  return (
    <>
      <Header />
      
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`cheap flights ${route.origin} ${route.destination}, ${route.originCode} to ${route.destinationCode} flights, budget airfare ${route.destination}, discount flights from ${route.origin}`} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>

      <FlightOfferSchema
        origin={route.origin}
        originCode={route.originCode}
        destination={route.destination}
        destinationCode={route.destinationCode}
        price={route.avgPrice}
        airline={route.popularAirlines[0]}
      />
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={faqs} />
      <ReviewSchema ratingValue={4.6} reviewCount={2847} />

      <main className="min-h-screen bg-background pt-20">
        {/* Breadcrumb Navigation */}
        <nav className="container mx-auto px-4 py-4">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li>/</li>
            <li><Link to="/deals" className="hover:text-primary">Deals</Link></li>
            <li>/</li>
            <li className="text-foreground font-medium">{route.origin} to {route.destination}</li>
          </ol>
        </nav>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="bg-primary/10 rounded-full p-3">
                  <Plane className="h-6 w-6 text-primary" />
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Cheap Flights from {route.origin} to {route.destination}
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Find the best deals on flights from {route.origin} ({route.originCode}) to {route.destination} ({route.destinationCode}). 
                Compare fares from top airlines and save on your next trip.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="bg-card/50 backdrop-blur">
                  <CardContent className="p-4 text-center">
                    <TrendingDown className="h-5 w-5 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">${route.avgPrice}</p>
                    <p className="text-sm text-muted-foreground">Starting Price</p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur">
                  <CardContent className="p-4 text-center">
                    <Clock className="h-5 w-5 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{route.flightDuration}</p>
                    <p className="text-sm text-muted-foreground">Flight Time</p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur">
                  <CardContent className="p-4 text-center">
                    <Plane className="h-5 w-5 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{route.popularAirlines.length}+</p>
                    <p className="text-sm text-muted-foreground">Airlines</p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur">
                  <CardContent className="p-4 text-center">
                    <Calendar className="h-5 w-5 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{route.bestMonth}</p>
                    <p className="text-sm text-muted-foreground">Best Time</p>
                  </CardContent>
                </Card>
              </div>

              <Link to={`/search-results?type=flight&from=${route.originCode}&to=${route.destinationCode}`}>
                <Button size="lg" className="gap-2">
                  Search Flights <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Route Information */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                About {route.origin} to {route.destination} Flights
              </h2>
              
              <div className="prose prose-slate max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Looking for cheap flights from {route.origin} to {route.destination}? You've come to the right place. 
                  This popular route connects {route.originCode} to {route.destinationCode}, with multiple daily departures 
                  from leading airlines. Whether you're traveling for business or leisure, we help you find the best fares 
                  and compare options across all major carriers.
                </p>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  The average flight time from {route.origin} to {route.destination} is approximately {route.flightDuration}. 
                  Prices typically start around ${route.avgPrice} for economy class, with the best deals available when booking 
                  in {route.bestMonth}. For the lowest fares, we recommend being flexible with your travel dates and setting 
                  up price alerts to catch flash sales and special promotions.
                </p>
              </div>

              {/* Popular Airlines */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Popular Airlines on This Route
                </h3>
                <div className="flex flex-wrap gap-3">
                  {route.popularAirlines.map((airline, index) => (
                    <span 
                      key={index}
                      className="bg-secondary/50 text-secondary-foreground px-4 py-2 rounded-full text-sm font-medium"
                    >
                      {airline}
                    </span>
                  ))}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-secondary/20 rounded-lg">
                  <Shield className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Secure Booking</p>
                    <p className="text-sm text-muted-foreground">256-bit SSL encryption</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-secondary/20 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-500" />
                  <div>
                    <p className="font-medium text-foreground">Trusted by Millions</p>
                    <p className="text-sm text-muted-foreground">4.6/5 average rating</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-secondary/20 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="font-medium text-foreground">Best Price Guarantee</p>
                    <p className="text-sm text-muted-foreground">We match lower prices</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-12 bg-secondary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Related Routes */}
        {relatedRoutes.length > 0 && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Related Flight Routes
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedRoutes.map((relatedRoute, index) => (
                    <Link 
                      key={index}
                      to={`/${relatedRoute.slug}`}
                      className="block p-4 bg-card rounded-lg border hover:border-primary transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-foreground">{relatedRoute.origin}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{relatedRoute.destination}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        From ${relatedRoute.avgPrice} • {relatedRoute.flightDuration}
                      </p>
                    </Link>
                  ))}
                </div>

                <div className="mt-8 text-center">
                  <Link to="/deals">
                    <Button variant="outline" className="gap-2">
                      View All Deals <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
};

export default FlightRoutePage;
