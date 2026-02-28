import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SitemapSection from "@/components/sitemap/SitemapSection";
import AirlineList from "@/components/sitemap/AirlineList";
import DestinationGrid from "@/components/sitemap/DestinationGrid";
import { siteMapData } from "@/data/sitemapData";
import { Helmet } from "react-helmet";
import {
  Plane,
  Info,
  Shield,
  Phone,
  Rss,
  Lock,
  FileText,
  Briefcase,
  CreditCard,
  Ticket,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Sitemap() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Existing sitemap sections (Traveler Assistance etc.)
  const otherSections = siteMapData.filter(
    (s) =>
      s.title !== "Domestic Flight Cities" &&
      s.title !== "International Flight Cities"
  );

  return (
    <>
      <Helmet>
        <title>Sitemap – Cheap Flights, Airlines & Destinations | Chyeap</title>
        <meta
          name="description"
          content="Browse our complete site map. Find cheap flights to 50+ destinations, compare 30+ airlines, and discover travel deals."
        />
      </Helmet>

      <Header />

      <main className="container mx-auto px-4 py-10 pt-24 pb-20 max-w-7xl">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Site Map</h1>
        <p className="text-muted-foreground mb-8">
          Explore all destinations, airlines, and pages on Chyeap.
        </p>

        {/* Airlines */}
        <SitemapSection
          title="Airlines"
          icon={<Plane className="w-5 h-5 text-primary" />}
        >
          <AirlineList />
        </SitemapSection>

        {/* Unified Destinations */}
        <DestinationGrid />

        {/* Legacy sitemap sections */}
        {otherSections.map((section) => {
          const hideArrow = section.title === "Traveler Assistance";
          return (
            <SitemapSection key={section.title} title={section.title}>
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2">
                {section.links.map((item: any, index: number) => {
                  if (typeof item === "object" && item.label) {
                    const Icon = item.icon;
                    return (
                      <li key={item.label + index}>
                        <Link
                          to={item.href}
                          className="group flex items-center gap-2 text-sm text-muted-foreground py-1 transition-colors hover:text-primary"
                        >
                          {!hideArrow && (
                            <span className="opacity-60 text-xs">&gt;</span>
                          )}
                          {Icon && (
                            <Icon
                              size={14}
                              className="transition-transform duration-200 group-hover:translate-x-0.5"
                            />
                          )}
                          <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                            {item.label}
                          </span>
                        </Link>
                      </li>
                    );
                  }
                  return (
                    <li
                      key={String(item) + index}
                      className="text-sm text-muted-foreground py-1"
                    >
                      {!hideArrow && (
                        <span className="opacity-60 mr-1 text-xs">&gt;</span>
                      )}
                      {item}
                    </li>
                  );
                })}
              </ul>
            </SitemapSection>
          );
        })}

        {/* FAQ */}
        <SitemapSection title="Frequently Asked Questions">
          <Accordion type="single" collapsible className="max-w-2xl">
            <AccordionItem value="q1">
              <AccordionTrigger className="text-sm">
                How do I find the cheapest flights?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Use our search tool to compare prices across 30+ airlines. We
                automatically show the lowest fares first and highlight the best
                deals.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q2">
              <AccordionTrigger className="text-sm">
                Can I book international flights?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Yes! We cover 50+ international destinations including London,
                Paris, Tokyo, Dubai, and more. Browse our International
                Destinations section above.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q3">
              <AccordionTrigger className="text-sm">
                Are prices shown per person?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Yes, all prices shown are per person for one-way economy class
                unless otherwise noted. Taxes and fees are included in the
                displayed price.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q4">
              <AccordionTrigger className="text-sm">
                How far in advance should I book?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                For domestic flights, booking 1–3 months ahead often yields the
                best prices. For international flights, 2–5 months in advance is
                recommended.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </SitemapSection>
      </main>

      <Footer />
    </>
  );
}
