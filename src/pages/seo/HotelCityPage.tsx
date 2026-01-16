import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Building2, MapPin, Star, ArrowRight, Shield, CheckCircle, Wifi, Car, Coffee } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import FAQSchema from '@/components/seo/FAQSchema';
import ReviewSchema from '@/components/seo/ReviewSchema';
import { seoHotelCities } from '@/data/seoRoutes';

const HotelCityPage = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const city = seoHotelCities.find(c => c.slug === slug);
  
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

  const pageTitle = `Cheap Hotels in ${city.city} | Best Deals & Discounts – ChyeapFlights`;
  const pageDescription = `Book cheap hotels in ${city.city}, ${city.state} with exclusive discounts. Compare prices, ratings, and amenities. Hotels starting at $${city.avgPrice}/night.`;
  const canonicalUrl = `https://chyeap.lovable.app/${city.slug}`;

  const faqs = [
    {
      question: `What is the cheapest hotel in ${city.city}?`,
      answer: `Budget hotels in ${city.city} start around $${city.avgPrice} per night. Popular areas for affordable stays include ${city.topAreas.slice(0, 2).join(' and ')}. Book in advance for the best rates.`
    },
    {
      question: `What are the best areas to stay in ${city.city}?`,
      answer: `The most popular areas to stay in ${city.city} include ${city.topAreas.join(', ')}. Each neighborhood offers unique attractions and different price points.`
    },
    {
      question: `When is the cheapest time to book hotels in ${city.city}?`,
      answer: `The cheapest times to book hotels in ${city.city} are typically during off-peak seasons. Booking 2-3 weeks in advance often yields the best rates. Avoid major holidays and events for lower prices.`
    }
  ];

  const breadcrumbs = [
    { name: 'Home', url: 'https://chyeap.lovable.app/' },
    { name: 'Hotels', url: 'https://chyeap.lovable.app/deals' },
    { name: city.city, url: canonicalUrl }
  ];

  return (
    <>
      <Header />
      
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`cheap hotels ${city.city}, ${city.city} hotel deals, budget hotels ${city.city} ${city.state}, discount hotels ${city.city}`} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
      </Helmet>

      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={faqs} />
      <ReviewSchema ratingValue={4.5} reviewCount={1523} />

      <main className="min-h-screen bg-background pt-20">
        {/* Breadcrumb Navigation */}
        <nav className="container mx-auto px-4 py-4">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li>/</li>
            <li><Link to="/deals" className="hover:text-primary">Hotels</Link></li>
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
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Cheap Hotels in {city.city}
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Find the best hotel deals in {city.city}, {city.state}. Compare prices from hundreds of hotels 
                and book your perfect stay at the lowest price guaranteed.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <Card className="bg-card/50 backdrop-blur">
                  <CardContent className="p-4 text-center">
                    <Building2 className="h-5 w-5 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">${city.avgPrice}</p>
                    <p className="text-sm text-muted-foreground">Avg/Night</p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur">
                  <CardContent className="p-4 text-center">
                    <MapPin className="h-5 w-5 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{city.topAreas.length}</p>
                    <p className="text-sm text-muted-foreground">Top Areas</p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur">
                  <CardContent className="p-4 text-center">
                    <Star className="h-5 w-5 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">4.5</p>
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                  </CardContent>
                </Card>
              </div>

              <Link to={`/search-results?type=hotel&city=${city.city}`}>
                <Button size="lg" className="gap-2">
                  Search Hotels <ArrowRight className="h-4 w-4" />
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
                About Hotels in {city.city}
              </h2>
              
              <div className="prose prose-slate max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Looking for cheap hotels in {city.city}? We compare prices from hundreds of booking sites to 
                  find you the best hotel deals. Whether you're looking for a budget-friendly stay or a luxury 
                  experience, {city.city} offers accommodations for every traveler and budget.
                </p>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  With average nightly rates starting around ${city.avgPrice}, you'll find great value in 
                  popular areas like {city.topAreas.join(', ')}. Book in advance for the best rates and 
                  be sure to check our exclusive deals for additional savings.
                </p>
              </div>

              {/* Popular Areas */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Popular Areas to Stay
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {city.topAreas.map((area, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg"
                    >
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">{area}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Common Hotel Amenities
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                    <Wifi className="h-5 w-5 text-primary" />
                    <span className="text-sm text-foreground">Free WiFi</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                    <Car className="h-5 w-5 text-primary" />
                    <span className="text-sm text-foreground">Parking</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                    <Coffee className="h-5 w-5 text-primary" />
                    <span className="text-sm text-foreground">Breakfast</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="text-sm text-foreground">24/7 Security</span>
                  </div>
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
                    <p className="text-sm text-muted-foreground">Real guest feedback</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-secondary/20 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="font-medium text-foreground">Free Cancellation</p>
                    <p className="text-sm text-muted-foreground">On most bookings</p>
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

export default HotelCityPage;
