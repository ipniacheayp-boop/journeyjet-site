import { Link } from "react-router-dom";
import { Phone, Ship, Calendar, Star, Mail, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import SEOHead from "@/components/SEOHead";
import { useState } from "react";

const CruiseDeals = () => {
  const [email, setEmail] = useState("");
  const [agreeOffers, setAgreeOffers] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const trustBadges = [
    {
      name: "Trustpilot",
      rating: 4.7,
      text: "This rating is as of 01/05/2026",
      reviews: "22,801",
      link: "https://www.trustpilot.com/review/cheapflightsfares.com"
    },
    {
      name: "SiteJabber",
      rating: 4.7,
      text: "Instant Feedback",
      reviews: "22,801",
      link: "https://www.sitejabber.com/reviews/cheapflightsfares.com#instant-feedback"
    },
    {
      name: "Reviews.io",
      rating: 4.1,
      text: "This rating is as of 01/05/2026",
      reviews: "4,585",
      link: "#"
    },
    {
      name: "ResellerRatings",
      rating: 4.0,
      text: "This rating is as of 01/05/2026",
      reviews: "1,167",
      link: "#"
    },
    {
      name: "Google Reviews",
      rating: 4.1,
      text: "This rating is as of 01/05/2026",
      reviews: "1,605",
      link: "#"
    },
    {
      name: "Facebook",
      rating: 4.4,
      text: "This rating is as of 01/05/2026",
      reviews: "483",
      link: "#"
    }
  ];

  const cruiseDeals = [
    {
      cruiseLine: "Royal Caribbean",
      title: "7 Nights Northbound Alaska & Hubbard Glacier",
      price: 180,
      benefits: [
        "Instant savings up to 25%",
        "Free Gratuities",
        "Exclusive discount for 2nd Guest"
      ],
      image: "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=600&h=400&fit=crop"
    },
    {
      cruiseLine: "Carnival",
      title: "4 Nights Bahamas Cruise",
      price: 300,
      benefits: [
        "Instant Savings up to 20%",
        "Onboard Credit",
        "Free Gratuities"
      ],
      image: "https://images.unsplash.com/photo-1599640842225-85d111c60e6b?w=600&h=400&fit=crop"
    },
    {
      cruiseLine: "Holland America",
      title: "4 Nights Pacific Coastal Cruise",
      price: 280,
      benefits: [
        "Instant savings up to 20%",
        "Free Gratuities",
        "Exclusive discount for 2nd Guest"
      ],
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop"
    },
    {
      cruiseLine: "Norwegian",
      title: "7 Nights Alaska: Hubbard Glacier & Skagway",
      price: 600,
      benefits: [
        "Up to 15% off",
        "Onboard Credit",
        "Free Gratuities"
      ],
      image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop"
    },
    {
      cruiseLine: "Celebrity",
      title: "7 Nights Bahamas Mexico & Cayman",
      price: 1015,
      benefits: [
        "Instant savings up to $150",
        "Free Gratuities",
        "Onboard Credit and more"
      ],
      image: "https://images.unsplash.com/photo-1559599746-8823b38544c6?w=600&h=400&fit=crop"
    },
    {
      cruiseLine: "Princess",
      title: "7 Nights Voyage of the Glaciers Northbound",
      price: 400,
      benefits: [
        "Instant savings up to 25% plus Kids Sail Free",
        "Free Gratuities",
        "Exclusive discount for 2nd Guest"
      ],
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop"
    }
  ];

  const footerColumns = [
    {
      title: "Book",
      links: [
        { text: "Flights", href: "/search-results" },
        { text: "Hotels", href: "/search-results?type=hotels" },
        { text: "Cars", href: "/search-results?type=cars" },
        { text: "Cruises", href: "/cruise-deals" }
      ]
    },
    {
      title: "Traveler Tools",
      links: [
        { text: "My Bookings", href: "/my-bookings" },
        { text: "Flight Status", href: "#" },
        { text: "Check-In", href: "#" },
        { text: "Travel Alerts", href: "#" }
      ]
    },
    {
      title: "About",
      links: [
        { text: "About Us", href: "/about" },
        { text: "Careers", href: "/careers" },
        { text: "Press", href: "#" },
        { text: "Contact", href: "/support" }
      ]
    },
    {
      title: "Legal",
      links: [
        { text: "Privacy Policy", href: "/privacy-policy" },
        { text: "Terms & Conditions", href: "/terms" },
        { text: "Taxes & Fees", href: "/taxes-fees" },
        { text: "Cookie Policy", href: "#" }
      ]
    },
    {
      title: "Popular Airlines",
      links: [
        { text: "American Airlines", href: "#" },
        { text: "Delta Air Lines", href: "#" },
        { text: "United Airlines", href: "#" },
        { text: "Southwest Airlines", href: "#" }
      ]
    },
    {
      title: "Popular Routes",
      links: [
        { text: "NYC to LA", href: "#" },
        { text: "Chicago to Miami", href: "#" },
        { text: "Dallas to New York", href: "#" },
        { text: "San Francisco to Seattle", href: "#" }
      ]
    },
    {
      title: "US Destinations",
      links: [
        { text: "Las Vegas", href: "#" },
        { text: "Orlando", href: "#" },
        { text: "Hawaii", href: "#" },
        { text: "New York", href: "#" }
      ]
    },
    {
      title: "International",
      links: [
        { text: "Cancun", href: "#" },
        { text: "London", href: "#" },
        { text: "Paris", href: "#" },
        { text: "Tokyo", href: "#" }
      ]
    },
    {
      title: "Airports",
      links: [
        { text: "JFK Airport", href: "#" },
        { text: "LAX Airport", href: "#" },
        { text: "ORD Airport", href: "#" },
        { text: "ATL Airport", href: "#" }
      ]
    },
    {
      title: "Cruise Deals",
      links: [
        { text: "Alaska Cruises", href: "#" },
        { text: "Caribbean Cruises", href: "#" },
        { text: "Mediterranean Cruises", href: "#" },
        { text: "Bahamas Cruises", href: "#" }
      ]
    }
  ];

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < fullStars
                ? "fill-yellow-400 text-yellow-400"
                : i === fullStars && hasHalfStar
                ? "fill-yellow-400/50 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 font-semibold text-gray-800">{rating}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Best Cruise Deals | Up to 25% Off Luxury Cruises"
        description="Book the best cruise deals with up to 25% off on Royal Caribbean, Carnival, Norwegian, Princess, and more. Exclusive cruise packages to Alaska, Caribbean, and Mediterranean destinations."
        canonicalUrl="https://cheapflights.com/cruise-deals"
        keywords="cruise deals, cheap cruises, Royal Caribbean, Carnival, Norwegian, Princess, Alaska cruise, Caribbean cruise, Mediterranean cruise"
      />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden" style={{
        background: "linear-gradient(135deg, #0077be 0%, #20c997 100%)"
      }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
          }} />
        </div>
        
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            The Hottest Cruise Deals to the Most Exotic Destinations
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8">
            Up to 25% off on Major Cruise Lines
          </p>
          <a href="tel:+1-315-625-6865">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Phone className="w-5 h-5 mr-2 animate-pulse" />
              Call Now
            </Button>
          </a>
        </div>
      </section>

      {/* Trust Badges Row */}
      <section className="py-8 bg-gray-50 border-y border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {trustBadges.map((badge, index) => (
              <a
                key={index}
                href={badge.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300 text-center"
              >
                <h3 className="font-semibold text-gray-800 mb-2">{badge.name}</h3>
                {renderStars(badge.rating)}
                <p className="text-xs text-gray-600 mt-2">{badge.text}</p>
                <p className="text-xs text-gray-500">Based on {badge.reviews} Reviews</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Handpicked Cruise Deals */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Handpicked Cruise Deals
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cruiseDeals.map((deal, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={deal.image}
                    alt={deal.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                    <span className="font-bold text-gray-800">{deal.cruiseLine}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-4 text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Ship className="w-4 h-4" />
                      <span className="text-sm">Cruise</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{deal.title.split(" ")[0]} {deal.title.split(" ")[1]}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2">
                    {deal.title}
                  </h3>
                  
                  <div className="mb-4">
                    <span className="text-sm text-gray-500">From</span>
                    <span className="text-3xl font-bold text-blue-600 ml-2">${deal.price}</span>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {deal.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  
                  <a href="tel:+1-315-625-6865" className="block">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white">
                      <Phone className="w-4 h-4 mr-2" />
                      Call to Book
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8">
            Sail with Handpicked Cruise Deals
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="mb-6">
              Embark on the vacation of a lifetime with our handpicked cruise deals. Whether you're dreaming of glaciers in Alaska, crystal-clear waters in the Caribbean, or the historic shores of the Mediterranean, we've curated the best cruise packages from the world's most renowned cruise lines.
            </p>
            <p className="mb-6">
              Our exclusive partnerships with Royal Caribbean, Carnival, Norwegian, Celebrity, Princess, and Holland America allow us to offer you unbeatable prices with added perks like free gratuities, onboard credits, and exclusive discounts for second guests. From budget-friendly getaways to luxurious voyages, there's a perfect cruise waiting for you.
            </p>
            <p className="mb-6">
              Experience world-class dining, entertainment, and amenities while visiting breathtaking destinations. Our travel experts are available 24/7 to help you find the perfect cruise that fits your budget and preferences. Don't miss out on these limited-time offers – call now to secure your spot on the cruise of your dreams!
            </p>
            <p>
              With flexible booking options and our best price guarantee, you can book with confidence knowing you're getting the best value for your vacation. Start your journey today and create memories that will last a lifetime.
            </p>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-teal-500">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Subscribe to our Newsletter
          </h2>
          <p className="text-white/90 mb-8">
            Get latest offers from Cheapflightsfares
          </p>
          
          <div className="bg-white rounded-xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8">
                Subscribe
              </Button>
            </div>
            
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="offers"
                  checked={agreeOffers}
                  onCheckedChange={(checked) => setAgreeOffers(checked as boolean)}
                />
                <label htmlFor="offers" className="text-sm text-gray-600">
                  I would like to receive email from Cheapflightsfares.com with the latest offers and promotions.{" "}
                  <Link to="/privacy-policy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I have read and agree to the{" "}
                  <Link to="/terms" className="text-blue-600 hover:underline">
                    terms and conditions
                  </Link>
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-8">
            {footerColumns.map((column, index) => (
              <div key={index}>
                <h3 className="font-semibold text-white mb-4 text-sm">{column.title}</h3>
                <ul className="space-y-2">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      {link.href.startsWith("/") ? (
                        <Link
                          to={link.href}
                          className="text-xs text-gray-400 hover:text-white transition-colors"
                        >
                          {link.text}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          className="text-xs text-gray-400 hover:text-white transition-colors"
                        >
                          {link.text}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 text-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} ChyeapFlights. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CruiseDeals;
