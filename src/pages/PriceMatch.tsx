import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PriceMatch = () => {
  const bannerImage = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJx8ngdq6_7tqdVjuGpMRhRlAsEVGAL0KUug&s";

  const supportPhoneDisplay = "+1-800-963-4330";
  const supportPhoneTel = "+18009634330";

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Helmet>
        <title>Price Match Guarantee | Tripile</title>
        <meta
          name="description"
          content="Found a lower price for the same flight? Tripile offers a Price Match Guarantee on identical itineraries within 24 hours of booking."
        />
        <link rel="canonical" href="https://tripile.com/price-match" />
      </Helmet>

      <Header />

      <main className="flex-1 pt-20 pb-16">
        {/* Banner */}
        <section
          aria-labelledby="price-match-title"
          className="relative overflow-hidden text-white"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.65), rgba(0,0,0,0.25)), url('${bannerImage}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="container mx-auto px-4 py-12 md:py-16 text-center">
            <h1 id="price-match-title" className="text-3xl md:text-6xl font-bold tracking-tight">
              Price Match Guarantee
            </h1>
            <p className="mt-4 text-base md:text-lg text-white/90 max-w-3xl mx-auto leading-relaxed">
              Found a lower price? If it’s the same itinerary, we’ll match it.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="container mx-auto px-4 mt-10">
          <div className="rounded-2xl border border-border bg-background p-6 md:p-10 shadow-sm">
            <div className="space-y-10">
              {/* Overview */}
              <article className="space-y-3">
                <h2 className="text-xl md:text-2xl font-bold">Our Promise</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Tripile is committed to offering competitive travel pricing. If you find a lower{" "}
                  <strong>publicly available</strong> price for the <strong>exact same</strong> flight itinerary within{" "}
                  <strong>24 hours</strong> of booking with us, we will match the verified lower price.
                </p>
              </article>

              {/* Eligibility + Not Eligible (two-column on md+) */}
              <div className="grid gap-6 md:grid-cols-2">
                <article className="rounded-2xl border border-border p-5 md:p-6 space-y-4">
                  <h2 className="text-xl md:text-2xl font-bold">Eligibility Requirements</h2>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                    <li>
                      The itinerary must be identical (same airline, flight numbers, dates, cabin class, and fare type).
                    </li>
                    <li>The lower fare must be publicly available online and verifiable.</li>
                    <li>The request must be submitted within 24 hours of booking.</li>
                    <li>The booking must be confirmed and paid in full with Tripile.</li>
                  </ul>
                </article>

                <article className="rounded-2xl border border-border p-5 md:p-6 space-y-4">
                  <h2 className="text-xl md:text-2xl font-bold">Not Eligible</h2>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                    <li>Private, corporate, or member-only fares.</li>
                    <li>Prices that require coupon codes or promo discounts.</li>
                    <li>Bundled packages (flight + hotel).</li>
                    <li>Pricing errors or mistake fares.</li>
                  </ul>
                </article>
              </div>

              {/* How to Request */}
              <article className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold">How to Request a Price Match</h2>

                <p className="text-muted-foreground leading-relaxed">
                  To request a price match, please contact our support team with:
                </p>

                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>Your Tripile booking reference number</li>
                  <li>A screenshot or link showing the lower price</li>
                  <li>Date and time the lower price was found</li>
                </ul>

                <p className="text-muted-foreground leading-relaxed">
                  Our team will verify the request and respond promptly.
                </p>
              </article>

              {/* Resolution */}
              <article className="space-y-3">
                <h2 className="text-xl md:text-2xl font-bold">Resolution</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If approved, Tripile will refund the difference to your original form of payment. Refund processing
                  times may vary depending on your financial institution.
                </p>
              </article>

              {/* CTA */}
              <aside className="rounded-2xl border border-border p-5 md:p-6 bg-muted/20">
                <h2 className="text-xl md:text-2xl font-bold">Need Assistance?</h2>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  Call our travel experts for immediate assistance with your booking.
                </p>

                <div className="mt-4">
                  <a
                    className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-primary-foreground font-semibold hover:opacity-90 transition"
                    href={`tel:${supportPhoneTel}`}
                  >
                    Call Now: {supportPhoneDisplay}
                  </a>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PriceMatch;
