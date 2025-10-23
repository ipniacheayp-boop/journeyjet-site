import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchWidget from "@/components/SearchWidget";
import DealCard from "@/components/DealCard";
import TailoredDealCard from "@/components/TailoredDealCard";
import TrustBadges from "@/components/TrustBadges";
import { mockDeals } from "@/data/mockDeals";
import heroFlight from "@/assets/hero-flight.jpg";
import dealLastMinute from "@/assets/deal-last-minute.jpg";
import dealBudget from "@/assets/deal-budget.jpg";
import dealSeniors from "@/assets/deal-seniors.jpg";
import dealBusiness from "@/assets/deal-business.jpg";
import dealStudents from "@/assets/deal-students.jpg";
import dealAirlines from "@/assets/deal-airlines.jpg";
import rewardsIllustration from "@/assets/rewards-illustration.png";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  const tailoredDeals = [
    {
      id: "1",
      title: "Last Minute Flight Deals",
      description: "Up to $50* Off Instantly, Just Like That.",
      image: dealLastMinute,
      tag: "HOT DEAL"
    },
    {
      id: "2",
      title: "Deals Under $199",
      description: "Fly With Up To 25% Off* On Flights.",
      image: dealBudget,
      tag: "BUDGET"
    },
    {
      id: "3",
      title: "Deals for Seniors",
      description: "Save Up To $60* On Flights For Seniors.",
      image: dealSeniors,
      tag: "SENIOR"
    },
    {
      id: "4",
      title: "Business Class Flights",
      description: "Up To 45% Off* Business Class Bliss.",
      image: dealBusiness,
      tag: "PREMIUM"
    },
    {
      id: "5",
      title: "Student Travel Deals",
      description: "Unlock Savings Up To $40* For Students.",
      image: dealStudents,
      tag: "STUDENT"
    },
    {
      id: "6",
      title: "Top Airline Deals",
      description: "Up To 20% Off* On Your Favorite Airlines.",
      image: dealAirlines,
      tag: "POPULAR"
    }
  ];

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

      {/* Tailored Travel Deals */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-2">Tailored Travel Deals</h2>
            <p className="text-muted-foreground max-w-3xl">
              From weekend escapes to last-minute flights, travel with the best and the cheapest travel deals handpicked by our team.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tailoredDeals.map((deal) => (
              <TailoredDealCard key={deal.id} deal={deal} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <TrustBadges />

      {/* Rewards Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
              SIGN UP & UNLOCK REWARDS
            </h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left side - Illustration */}
              <div className="flex justify-center">
                <img 
                  src={rewardsIllustration} 
                  alt="Rewards and benefits illustration" 
                  className="w-full max-w-md"
                />
              </div>
              
              {/* Right side - Benefits and CTA */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-foreground font-medium">Members only Deals</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-foreground font-medium">Lounge access</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-foreground font-medium">Reward points</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-foreground font-medium">Alerts & notifications</span>
                  </div>
                </div>
                
                <Link to="/account" className="block">
                  <Button 
                    size="lg" 
                    className="w-full text-lg font-bold bg-gradient-to-r from-[#007BFF] to-[#00B4FF] hover:brightness-110 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                  >
                    Join Now For Free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

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
