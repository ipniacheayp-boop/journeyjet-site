import React from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const RefundPolicy = () => {
  const bannerImage =
    "https://d33v4339jhl8k0.cloudfront.net/docs/assets/592831430428634b4a337895/images/64d7cc3417822902c5ab960a/file-nwzcXbpfVh.png";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Helmet>
        <title>Refund &amp; Cancellation Policy | Tripile</title>
        <meta
          name="description"
          content="Learn about Tripile’s refund and cancellation policy, including 24-hour risk-free cancellation, airline rules, and refund processing timelines."
        />
        <link rel="canonical" href="https://tripile.com/refund-policy" />
      </Helmet>

      <Header />

      <main className="flex-1 pt-20 pb-16">
        {/* Banner */}
        <section
          aria-labelledby="refund-policy-title"
          className="relative overflow-hidden text-white"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.65), rgba(0,0,0,0.25)), url('${bannerImage}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="container mx-auto px-4 py-12 md:py-16 text-center">
            <h1
              id="refund-policy-title"
              className="text-3xl md:text-6xl font-bold tracking-tight"
            >
              Refund &amp; Cancellation Policy
            </h1>

            <p className="mt-4 text-base md:text-lg text-white/90 max-w-3xl mx-auto leading-relaxed">
              We understand travel plans can change. Please review our refund
              and cancellation terms below before making a reservation.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="container mx-auto px-4 mt-10">
          <div className="rounded-2xl border border-border bg-background p-6 md:p-10 shadow-sm">
            <div className="space-y-10">
              {/* 24 Hour Rule */}
              <article className="space-y-3">
                <h2 className="text-xl md:text-2xl font-bold">
                  24-Hour Risk-Free Cancellation
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  If your flight is booked at least <strong>7 days</strong>{" "}
                  before departure and canceled within{" "}
                  <strong>24 hours</strong> of booking, you may be eligible for a
                  full refund to your original form of payment, subject to
                  airline policy and U.S. Department of Transportation
                  regulations.
                </p>
              </article>

              {/* Airline Rules */}
              <article className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold">
                  Airline Ticket Refunds
                </h2>

                <p className="text-muted-foreground leading-relaxed">
                  Tripile acts as an independent travel agency. All tickets are
                  subject to the fare rules of the respective airline. Refund
                  eligibility depends on ticket type, cancellation timing, and
                  airline approval.
                </p>

                <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                  <li>
                    <strong>Non-refundable</strong> tickets may qualify for
                    airline credit minus applicable fees.
                  </li>
                  <li>
                    <strong>Refundable</strong> tickets may be eligible for a
                    full or partial refund.
                  </li>
                  <li>
                    Airline schedule changes or cancellations may qualify for a
                    refund (subject to airline rules).
                  </li>
                </ul>
              </article>

              {/* Schedule Changes */}
              <article className="space-y-3">
                <h2 className="text-xl md:text-2xl font-bold">
                  Airline Schedule Changes &amp; Cancellations
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  You may be eligible for a refund if your flight is canceled or
                  significantly delayed (<strong>3+ hours</strong> domestic /{" "}
                  <strong>6+ hours</strong> international). Refund approval is
                  subject to airline policies.
                </p>
              </article>

              {/* Service Fees */}
              <article className="space-y-3">
                <h2 className="text-xl md:text-2xl font-bold">
                  Tripile Service Fees
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Service fees may apply for voluntary cancellations, booking
                  modifications, and refund processing. Service fees are{" "}
                  <strong>non-refundable</strong> once services have been
                  rendered.
                </p>
              </article>

              {/* Processing Timeline */}
              <article className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold">
                  Refund Processing Timeline
                </h2>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-border p-4">
                    <p className="font-semibold">Credit card</p>
                    <p className="text-muted-foreground">7–14 business days</p>
                  </div>

                  <div className="rounded-xl border border-border p-4">
                    <p className="font-semibold">Debit card</p>
                    <p className="text-muted-foreground">10–20 business days</p>
                  </div>

                  <div className="rounded-xl border border-border p-4">
                    <p className="font-semibold">Other methods</p>
                    <p className="text-muted-foreground">Up to 20 business days</p>
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  Processing times depend on airline approval and your financial
                  institution.
                </p>
              </article>

              {/* How to Request */}
              <article className="space-y-3">
                <h2 className="text-xl md:text-2xl font-bold">
                  How to Request a Refund
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  To request a refund, please provide your{" "}
                  <strong>booking reference number</strong>,{" "}
                  <strong>passenger name</strong>, and{" "}
                  <strong>ticket number</strong>. Contact our support team for
                  assistance.
                </p>
              </article>

              {/* Disclaimer */}
              <article className="space-y-3">
                <h2 className="text-xl md:text-2xl font-bold">
                  Important Notice
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Tripile is an independent online travel agency and is not
                  affiliated with any airline. All refunds are subject to
                  airline fare rules and approval. Tripile is not responsible
                  for airline-imposed penalties or delays in refund processing.
                </p>
              </article>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default RefundPolicy;