import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchWidget from "@/components/SearchWidget";
import DealCard from "@/components/DealCard";
import TrustBadges from "@/components/TrustBadges";
import { mockDeals } from "@/data/mockDeals";
import heroFlight from "@/assets/hero-flight.jpg";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section 
        className="relative pt-32 pb-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroFlight})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 to-foreground/50" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Find Your Next Adventure
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Compare and book flights, hotels, and more at the best prices
            </p>
          </div>
          <SearchWidget />
        </div>
      </section>

      {/* Featured Deals */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Deals</h2>
              <p className="text-muted-foreground">Handpicked offers for your next journey</p>
            </div>
            <Link to="/deals">
              <Button variant="outline" className="gap-2">
                View All Deals <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockDeals.slice(0, 6).map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <TrustBadges />

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join millions of travelers who trust us to find the best deals
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/account">
              <Button size="lg" variant="secondary" className="gap-2">
                Sign Up Now <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/deals">
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                Browse All Deals
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
