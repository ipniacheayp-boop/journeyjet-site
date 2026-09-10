import { useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Phone, Ship, Calendar, MapPin, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SEOHead from "@/components/SEOHead";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import FAQSchema from "@/components/seo/FAQSchema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cruiseDestinations, getCruiseDestination } from "@/data/cruiseDestinations";

const SITE = "https://tripile.com";

const CruiseDestinationPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const destination = slug ? getCruiseDestination(slug) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!destination) {
    return <Navigate to="/cruise-deals" replace />;
  }

  const url = `${SITE}/cruises/${destination.slug}`;
  const breadcrumbItems = [
    { name: "Home", url: `${SITE}/` },
    { name: "Cruise Deals", url: `${SITE}/cruise-deals` },
    { name: destination.name, url },
  ];
  const related = cruiseDestinations.filter((d) => d.slug !== destination.slug);

  return (
    <>
      <SEOHead
        title={destination.seoTitle}
        description={destination.metaDescription}
        keywords={destination.keywords}
        canonicalUrl={url}
        ogImage={destination.heroImage}
        ogType="website"
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      <FAQSchema faqs={destination.faqs} />

      <Header />

      <main className="min-h-screen bg-background pt-20">
        {/* Breadcrumb nav */}
        <nav aria-label="Breadcrumb" className="container mx-auto px-4 pt-6">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-primary">Home</Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5" />
            <li>
              <Link to="/cruise-deals" className="hover:text-primary">Cruise Deals</Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5" />
            <li className="font-medium text-foreground">{destination.name}</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="container mx-auto px-4 py-10">
          <div className="relative overflow-hidden rounded-3xl">
            <img
              src={destination.heroImage}
              alt={`${destination.name} — ${destination.tagline}`}
              className="h-[340px] w-full object-cover md:h-[420px]"
              loading="eager"
              width={1200}
              height={600}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 md:p-10 max-w-3xl">
              <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur">
                <Ship className="h-3.5 w-3.5" /> Cruise Deals
              </span>
              <h1 className="text-3xl font-bold leading-tight text-white md:text-5xl">
                {destination.h1}
              </h1>
              <p className="mt-3 text-lg text-white/90">{destination.tagline}</p>
              <Link to="/contact-us">
                <Button
                  size="lg"
                  className="mt-6 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-8 text-white hover:from-orange-600 hover:to-red-600"
                >
                  <Phone className="mr-2 h-5 w-5" /> Call to Book Your Cruise
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Intro content */}
        <section className="container mx-auto max-w-4xl px-4 pb-6">
          <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
            {destination.intro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>

        {/* Highlights */}
        <section className="container mx-auto px-4 py-10">
          <h2 className="mb-8 text-2xl font-bold text-foreground md:text-3xl">
            Top {destination.name} Itineraries & Regions
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {destination.highlights.map((h) => (
              <div
                key={h.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <h3 className="mb-2 text-lg font-semibold text-foreground">{h.title}</h3>
                <p className="text-sm text-muted-foreground">{h.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Best time + ports */}
        <section className="container mx-auto px-4 py-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-muted/40 p-6">
              <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-foreground">
                <Calendar className="h-5 w-5 text-primary" /> Best Time to Cruise
              </h2>
              <p className="text-sm text-muted-foreground">{destination.bestTimeToGo}</p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/40 p-6">
              <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-foreground">
                <MapPin className="h-5 w-5 text-primary" /> Popular Departure Ports
              </h2>
              <ul className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                {destination.popularPorts.map((port) => (
                  <li key={port} className="flex items-center gap-2">
                    <Check className="h-4 w-4 flex-shrink-0 text-green-500" /> {port}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="container mx-auto max-w-3xl px-4 py-12">
          <h2 className="mb-6 text-2xl font-bold text-foreground md:text-3xl">
            {destination.name} — Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible>
            {destination.faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Internal links to other cruises */}
        <section className="container mx-auto px-4 py-8">
          <h2 className="mb-6 text-xl font-bold text-foreground">Explore More Cruise Destinations</h2>
          <div className="flex flex-wrap gap-3">
            {related.map((d) => (
              <Link
                key={d.slug}
                to={`/cruises/${d.slug}`}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {d.name}
              </Link>
            ))}
            <Link
              to="/deals"
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Flight & Hotel Deals
            </Link>
            <Link
              to="/blog"
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Travel Blog
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-teal-500 py-14">
          <div className="container mx-auto max-w-2xl px-4 text-center">
            <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
              Ready to Set Sail on a {destination.name.replace(" Cruises", "")} Cruise?
            </h2>
            <p className="mb-6 text-white/90">
              Speak with a Tripile cruise expert for exclusive deals, onboard credit and free perks.
            </p>
            <Link to="/contact-us">
              <Button
                size="lg"
                className="rounded-full bg-white px-8 text-blue-700 hover:bg-white/90"
              >
                <Phone className="mr-2 h-5 w-5" /> Call Now to Book
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default CruiseDestinationPage;
