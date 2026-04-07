import React from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Globe2, Heart, Award, ShieldCheck, PlaneTakeoff } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col font-poppins bg-background text-foreground transition-colors duration-300">
      <Helmet>
        <title>About Tripile | Trusted US Travel Booking Platform</title>
        <meta
          name="description"
          content="Learn about Tripile.com — America's trusted travel booking platform. We help millions of travelers find the best deals on flights, hotels, and car rentals across the USA."
        />
        <meta
          name="keywords"
          content="about Tripile, US travel company, travel booking platform, flight deals company, trusted travel partner, Tripile.com"
        />
        <link rel="canonical" href="https://tripile.com/about" />
        <meta property="og:title" content="About Tripile | Trusted US Travel Booking Platform" />
        <meta property="og:description" content="Learn about Tripile.com — America's trusted travel booking platform helping millions find the best deals on flights, hotels, and car rentals." />
        <meta property="og:url" content="https://tripile.com/about" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "About Tripile",
            "url": "https://tripile.com/about",
            "description": "Learn about Tripile.com — America's trusted travel booking platform.",
            "mainEntity": {
              "@type": "Organization",
              "name": "Tripile.com",
              "url": "https://tripile.com",
              "foundingDate": "2023",
              "description": "Tripile.com helps travelers find the best flight deals, hotel discounts, and car rentals across the USA.",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-800-963-4330",
                "contactType": "customer service",
                "areaServed": "US",
                "availableLanguage": ["English", "Spanish"]
              }
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://tripile.com/" },
                { "@type": "ListItem", "position": 2, "name": "About", "item": "https://tripile.com/about" }
              ]
            }
          })}
        </script>
      </Helmet>

      <Header />

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden border-b border-border">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-20 right-0 w-[400px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="container relative mx-auto px-4 z-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-card/50 backdrop-blur-md rounded-2xl mb-6 border border-border shadow-2xl">
            <PlaneTakeoff className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className=" font-display text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-foreground drop-shadow-sm">
            About{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">Tripile</span>
          </h1>
          <p className="text-xl md:text-2xl font-light max-w-3xl mx-auto text-muted-foreground drop-shadow-sm leading-relaxed">
            We believe every journey can be life-changing — a chance to explore, unwind, and discover the beauty of the
            world.
          </p>
        </div>
      </div>

      <main className="flex-1 relative z-20 py-20 pb-32">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Intro Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div className="space-y-6">
              <h2 className=" font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                Passion for <span className="text-blue-500">Exploration</span>
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed font-medium">
                <p>
                  At Tripile, we're passionate about making travel dreams come true. Whether you're planning a relaxing
                  beach escape, a cultural adventure, or a quick weekend getaway, we're here to help you find the best
                  deals to make it happen.
                </p>
                <p>
                  Traveling within your budget shouldn't mean compromising on quality or comfort. That's why we bring
                  you unbeatable prices on flights, hotels, and rental cars from trusted global partners.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <div className="relative h-[350px] rounded-2xl overflow-hidden border border-border bg-card">
                <img
                  src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop"
                  alt="Traveling the world"
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                />
                {/* Fixed gradient to adapt to background */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              </div>
            </div>
          </div>

          {/* Mission Card */}
          <div className="relative mb-24 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
            <div className="relative bg-card/60 backdrop-blur-xl border border-border rounded-3xl p-8 md:p-14 shadow-2xl text-center overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]" />

              <div className="inline-flex items-center justify-center p-4 bg-indigo-500/20 rounded-full mb-8 border border-indigo-500/30">
                <Heart className="w-10 h-10 text-indigo-500" />
              </div>

              <h2 className=" font-display text-3xl md:text-5xl font-bold text-foreground mb-6 tracking-tight relative z-10">
                Our Mission
              </h2>

              <div className="max-w-3xl mx-auto space-y-6 text-xl text-muted-foreground font-medium leading-relaxed relative z-10">
                <p className="text-2xl text-foreground font-semibold flex items-center justify-center text-center">
                  "To make travel affordable, easy, and enjoyable for everyone."
                </p>
                <p>
                  With a deep understanding of what travelers need, Tripile offers a smooth, hassle-free booking
                  experience designed to save you time and money.
                </p>
                <p>
                  From comparing prices to securing last-minute deals, we handle the hard part so you can focus on your
                  next adventure.
                </p>
              </div>
            </div>
          </div>

          {/* Core Values / Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-24">
            <div className="bg-card/40 backdrop-blur-sm border border-border rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-300 hover:border-blue-500/30 group">
              <Globe2 className="w-10 h-10 text-blue-500 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-foreground mb-3">Global Reach</h3>
              <p className="text-muted-foreground font-medium">
                Access to thousands of destinations worldwide with just a few clicks.
              </p>
            </div>

            <div className="bg-card/40 backdrop-blur-sm border border-border rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-300 hover:border-emerald-500/30 group">
              <ShieldCheck className="w-10 h-10 text-emerald-500 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-foreground mb-3">Trusted Partners</h3>
              <p className="text-muted-foreground font-medium">
                We only collaborate with verified, top-tier airlines and hospitality brands.
              </p>
            </div>

            <div className="bg-card/40 backdrop-blur-sm border border-border rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-300 hover:border-amber-500/30 group">
              <Award className="w-10 h-10 text-amber-500 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-foreground mb-3">Best Price Guarantee</h3>
              <p className="text-muted-foreground font-medium">
                Unbeatable prices. If you find a better price elsewhere, we'll strive to beat it.
              </p>
            </div>
          </div>

          {/* Conclusion */}
          <div className="text-center bg-gradient-to-br from-blue-900/10 to-indigo-900/10 border border-border rounded-3xl p-10 md:p-16 relative overflow-hidden bg-card/30">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] dark:opacity-20 mix-blend-overlay" />
            <h3 className=" font-display text-2xl md:text-3xl font-bold text-foreground mb-6 relative z-10">
              Ready for your next adventure?
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 relative z-10">
              We're committed to providing exceptional service from the moment you book until you return home. Great
              journeys start with great fares.
            </p>
            <p className="text-muted-foreground mb-8 relative z-10 font-medium">
              Find a better deal? Email us at{" "}
              <a
                href="mailto:Support@Tripile.com"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors font-bold underline decoration-blue-500/30 underline-offset-4"
              >
                Support@Tripile.com
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
