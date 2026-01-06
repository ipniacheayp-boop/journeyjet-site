import { Link } from "react-router-dom";
import { siteMapData } from "@/data/sitemapData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Map, ExternalLink, Plane } from "lucide-react";

const Sitemap = () => {
  const mainPages = [
    { path: "/", label: "Home" },
    { path: "/deals", label: "Flight Deals" },
    { path: "/search-results", label: "Search Flights" },
    { path: "/reviews", label: "Customer Reviews" },
  ];

  const accountPages = [
    { path: "/login", label: "Login" },
    { path: "/account", label: "My Account" },
    { path: "/my-bookings", label: "My Bookings" },
  ];

  const supportPages = [
    { path: "/support", label: "Support" },
    { path: "/about", label: "About Us" },
    { path: "/careers", label: "Careers" },
  ];

  const legalPages = [
    { path: "/terms", label: "Terms & Conditions" },
    { path: "/privacy", label: "Privacy Policy" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title="Sitemap | CheapFlights"
        description="Browse all pages on CheapFlights. Find flights, deals, booking information, and more."
        canonicalUrl="/sitemap"
      />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Map className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Sitemap</h1>
          </div>
          
          <p className="text-muted-foreground mb-10">
            Navigate through all available pages on our website. Use this sitemap to quickly find what you're looking for.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Main Pages */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
                Main Pages
              </h2>
              <ul className="space-y-2">
                {mainPages.map((page) => (
                  <li key={page.path}>
                    <Link
                      to={page.path}
                      className="flex items-center gap-2 text-primary hover:text-primary/80 hover:underline transition-colors text-sm"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {page.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {/* Account Pages */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
                Account
              </h2>
              <ul className="space-y-2">
                {accountPages.map((page) => (
                  <li key={page.path}>
                    <Link
                      to={page.path}
                      className="flex items-center gap-2 text-primary hover:text-primary/80 hover:underline transition-colors text-sm"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {page.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {/* Support Pages */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
                Company
              </h2>
              <ul className="space-y-2">
                {supportPages.map((page) => (
                  <li key={page.path}>
                    <Link
                      to={page.path}
                      className="flex items-center gap-2 text-primary hover:text-primary/80 hover:underline transition-colors text-sm"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {page.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {/* Legal Pages */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
                Legal
              </h2>
              <ul className="space-y-2">
                {legalPages.map((page) => (
                  <li key={page.path}>
                    <Link
                      to={page.path}
                      className="flex items-center gap-2 text-primary hover:text-primary/80 hover:underline transition-colors text-sm"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {page.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Flight Destinations from siteMapData */}
          {siteMapData.map((section, index) => (
            <section key={index} className="mb-10">
              <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
                <Plane className="h-5 w-5" />
                {section.title}
              </h2>
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {/* XML Sitemap Link */}
          <section className="bg-muted/50 rounded-lg p-6 mt-8">
            <h3 className="font-medium text-foreground mb-2">For Search Engines</h3>
            <p className="text-sm text-muted-foreground">
              Looking for the XML sitemap? Visit{" "}
              <a
                href="/sitemap.xml"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                /sitemap.xml
              </a>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Sitemap;
