import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Car, MapPin, Star, ArrowRight, Shield, CheckCircle, Clock, CreditCard } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import FAQSchema from '@/components/seo/FAQSchema';
import ReviewSchema from '@/components/seo/ReviewSchema';
import { seoCarCities } from '@/data/seoRoutes';

const CarRentalCityPage = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const city = seoCarCities.find(c => c.slug === slug);
  
  if (!city) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">City Not Found</h1>
          <Link to="/deals" className="text-primary hover:underline">Browse All Deals</Link>
        </div>
        <Footer />
      </>
    );
  }

  const pageTitle = `Cheap Car Rentals in ${city.city} | Compare & Save – ChyeapFlights`;
  const pageDescription = `Find affordable car rentals in ${city.city}, ${city.state}. Compare top providers and book instantly. Rentals starting at $${city.avgPrice}/day.`;
  const canonicalUrl = `https://chyeap.lovable.app/${city.slug}`;

  const faqs = [
    {
      question: `What is the cheapest car rental in ${city.city}?`,
      answer: `Car rentals in ${city.city} start around $${city.avgPrice} per day for economy cars. Popular providers include ${city.topProviders.slice(0, 2).join(' and ')}. Book in advance for the best rates.`
    },
    {
      question: `Which car rental companies operate in ${city.city}?`,
      answer: `Major car rental companies in ${city.city} include ${city.topProviders.join(', ')}. Each offers different vehicle types and pricing options.`
    },
    {
      question: `Do I need insurance for a rental car in ${city.city}?`,
      answer: `While not legally required, rental car insurance is recommended. Many credit cards offer rental car coverage. Check with your credit card company and personal auto insurance before purchasing additional coverage.`
    }
  ];

  const breadcrumbs = [
    { name: 'Home', url: 'https://chyeap.lovable.app/' },
    { name: 'Car Rentals', url: 'https://chyeap.lovable.app/deals' },
    { name: city.city, url: canonicalUrl }
  ];

  return (
    <>
      <Header />
      
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`cheap car rental ${city.city}, ${city.city} car hire, budget car rental ${city.city} ${city.state}, discount car rental ${city.city}`} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
      </Helmet>

      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={faqs} />
      <ReviewSchema ratingValue={4.4} reviewCount={892} />

      <main className="min-h-screen bg-background pt-20">
        {/* Breadcrumb Navigation */}
        <nav className="container mx-auto px-4 py-4">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li>/</li>
            <li><Link to="/deals" className="hover:text-primary">Car Rentals</Link></li>
            <li>/</li>
            <li className="text-foreground font-medium">{city.city}</li>
          </ol>
        </nav>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="bg-primary/10 rounded-full p-3">
                  <Car className="h-6 w-6 text-primary" />
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Cheap Car Rentals in {city.city}
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Compare car rental prices from top providers in {city.city}, {city.state}. 
                Find the perfect vehicle for your trip at the best price.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <Card className="bg-card/50 backdrop-blur">
                  <CardContent className="p-4 text-center">
                    <Car className="h-5 w-5 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">${city.avgPrice}</p>
                    <p className="text-sm text-muted-foreground">Per Day</p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur">
                  <CardContent className="p-4 text-center">
                    <MapPin className="h-5 w-5 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{city.topProviders.length}</p>
                    <p className="text-sm text-muted-foreground">Providers</p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur">
                  <CardContent className="p-4 text-center">
                    <Star className="h-5 w-5 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">4.4</p>
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                  </CardContent>
                </Card>
              </div>

              <Link to={`/search-results?type=car&city=${city.city}`}>
                <Button size="lg" className="gap-2">
                  Search Cars <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* City Information */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                About Car Rentals in {city.city}
              </h2>
              
              <div className="prose prose-slate max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Need a rental car in {city.city}? We compare prices from all major car rental companies 
                  to find you the best deal. Whether you need an economy car for a quick trip or an SUV 
                  for a family vacation, {city.city} has options for every budget and need.
                </p>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  With daily rates starting around ${city.avgPrice}, you'll find great value from 
                  providers like {city.topProviders.join(', ')}. Pick up at the airport or downtown 
                  locations for maximum convenience.
                </p>
              </div>

              {/* Top Providers */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Top Car Rental Providers
                </h3>
                <div className="flex flex-wrap gap-3">
                  {city.topProviders.map((provider, index) => (
                    <span 
                      key={index}
                      className="bg-secondary/50 text-secondary-foreground px-4 py-2 rounded-full text-sm font-medium"
                    >
                      {provider}
                    </span>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-sm text-foreground">24/7 Pickup</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span className="text-sm text-foreground">No Hidden Fees</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm text-foreground">Insurance Options</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="text-sm text-foreground">Free Cancellation</span>
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
                    <p className="font-medium text-foreground">Verified Reviews</p>
                    <p className="text-sm text-muted-foreground">Real customer feedback</p>
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
      </main>

      <Footer />
    </>
  );
};

export default CarRentalCityPage;
