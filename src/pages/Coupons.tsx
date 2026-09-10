import { useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Check, Copy, Plane, ShieldCheck, Tag } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchWidget from "@/components/SearchWidget";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { Button } from "@/components/ui/button";
import { availableCoupons } from "@/data/coupons";
import couponHero from "@/assets/deal-airlines.jpg";
import { toast } from "sonner";

const Coupons = () => {
  const [revealedCodes, setRevealedCodes] = useState<Set<string>>(new Set());
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const revealCode = (code: string) => {
    setRevealedCodes((current) => new Set(current).add(code));
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`${code} copied`);
      window.setTimeout(() => setCopiedCode((current) => (current === code ? null : current)), 2000);
    } catch {
      toast.error("Unable to copy the code. Please select it manually.");
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16 md:pt-[104px]">
      <Helmet>
        <title>Flight Coupons & Promo Codes | Tripile</title>
        <meta
          name="description"
          content="View current Tripile flight coupons and promo codes, copy an eligible offer, and search live fares for your next trip."
        />
        <link rel="canonical" href="https://tripile.com/coupons" />
        <meta property="og:title" content="Flight Coupons & Promo Codes | Tripile" />
        <meta
          property="og:description"
          content="View current Tripile travel coupons, copy an eligible promo code, and search live flight fares."
        />
        <meta property="og:url" content="https://tripile.com/coupons" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
      </Helmet>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://tripile.com/" },
          { name: "Coupons", url: "https://tripile.com/coupons" },
        ]}
      />

      <Header />

      <main>
        <section className="relative min-h-[300px] md:min-h-[390px] overflow-hidden" aria-labelledby="coupon-page-title">
          <img
            src={couponHero}
            alt="Passenger aircraft at an airport during sunset"
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-slate-950/55" aria-hidden="true" />
          <div className="container relative mx-auto flex min-h-[300px] md:min-h-[390px] items-center justify-center px-4 py-14 text-center">
            <div className="max-w-3xl text-primary-foreground">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-slate-950/30 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                <Tag className="h-4 w-4" aria-hidden="true" />
                Current Tripile offers
              </div>
              <h1 id="coupon-page-title" className="font-display text-4xl font-extrabold text-primary-foreground md:text-6xl">
                Flight Coupons & Promo Codes
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base text-primary-foreground/90 md:text-xl">
                Reveal a current code, search live fares, and apply your coupon during checkout.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-primary py-5" aria-label="Search for eligible flights">
          <div className="container mx-auto px-4">
            <SearchWidget defaultTab="flights" />
          </div>
        </section>

        <section className="py-12 md:py-16" aria-labelledby="available-coupons-title">
          <div className="container mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="mb-2 text-sm font-bold uppercase text-primary">Travel offers</p>
                  <h2 id="available-coupons-title" className="font-display text-3xl font-bold md:text-4xl">
                    Save with Tripile coupons
                  </h2>
                </div>
                <Link to="/deals" className="text-sm font-semibold text-primary hover:underline">
                  Browse live flight deals
                </Link>
              </div>

              <div className="space-y-4">
                {availableCoupons.map((coupon) => {
                  const isRevealed = revealedCodes.has(coupon.code);
                  const isCopied = copiedCode === coupon.code;
                  return (
                    <article key={coupon.code} className="rounded-lg border border-border bg-card p-5 shadow-md md:p-6">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-primary/40 bg-primary/5 text-primary">
                          <Tag className="h-9 w-9" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xl font-bold">{coupon.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">{coupon.description}</p>
                          <p className="mt-2 text-xs font-semibold text-foreground">
                            {coupon.minOrder > 0 ? `Minimum booking subtotal: $${coupon.minOrder}` : "No minimum booking subtotal"}
                          </p>
                        </div>
                        <div className="w-full shrink-0 sm:w-48">
                          {isRevealed ? (
                            <Button
                              type="button"
                              variant="outline"
                              className="h-12 w-full justify-between border-primary bg-primary/5 font-mono text-base text-primary"
                              onClick={() => void copyCode(coupon.code)}
                              aria-label={`Copy coupon code ${coupon.code}`}
                            >
                              {coupon.code}
                              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          ) : (
                            <Button type="button" className="h-12 w-full" onClick={() => revealCode(coupon.code)}>
                              Reveal code
                            </Button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <aside className="space-y-6" aria-label="Coupon instructions">
              <div className="rounded-lg border border-border bg-card p-6 shadow-md">
                <h2 className="text-2xl font-bold">How to apply a promo code</h2>
                <ol className="mt-5 space-y-4 text-sm text-muted-foreground">
                  {[
                    "Select Reveal code on an offer.",
                    "Copy the displayed promo code.",
                    "Search and choose your trip.",
                    "Enter traveler details and continue to Coupons.",
                    "Paste the code, apply it, and review your total before payment.",
                  ].map((step, index) => (
                    <li key={step} className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                        {index + 1}
                      </span>
                      <span className="pt-1">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-lg border border-border bg-muted/40 p-6">
                <div className="flex items-center gap-2 text-foreground">
                  <ShieldCheck className="h-5 w-5 text-success" aria-hidden="true" />
                  <h2 className="text-xl font-bold">Book with confidence</h2>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Eligible savings appear in your price summary before payment. Coupon availability and booking eligibility may apply.
                </p>
                <Button asChild variant="outline" className="mt-5 w-full">
                  <Link to="/flights">
                    <Plane className="mr-2 h-4 w-4" aria-hidden="true" />
                    Search flights
                  </Link>
                </Button>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Coupons;