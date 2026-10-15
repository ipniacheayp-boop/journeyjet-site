import React from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const LAST_UPDATED = "October 15, 2026";

type Section = { id: string; title: string; body: React.ReactNode };

const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="mb-4 leading-relaxed text-muted-foreground">{children}</p>
);
const UL: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ul className="mb-4 ml-6 list-disc space-y-2 text-muted-foreground">{children}</ul>
);
const H3: React.FC<{ children: React.ReactNode; id?: string }> = ({ children, id }) => (
  <h3 id={id} className="legal-h3 mt-6 mb-2 text-lg scroll-mt-32">
    {children}
  </h3>
);
const B: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <strong className="text-foreground">{children}</strong>
);
const L: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <Link to={to} className="text-primary underline underline-offset-4">
    {children}
  </Link>
);
const Mail = () => (
  <a href="mailto:Support@Tripile.com" className="text-primary underline underline-offset-4">
    Support@Tripile.com
  </a>
);

const sections: Section[] = [
  {
    id: "scope",
    title: "Introduction and scope",
    body: (
      <>
        <P>
          This policy explains how cancellations and refunds work for bookings made on Tripile.com, operated by
          Trivoya Ventures LLC. It covers flights, hotels and car rentals booked through Tripile, and the payments made
          for them.
        </P>
        <P>
          Read it together with our <L to="/terms">Refund &amp; Cancellation Policy</L> and <L to="/privacy">Privacy Policy</L>.
          Where this policy and the rules of an airline, hotel or rental company differ, the supplier's rules decide
          whether a refund is due.
        </P>
      </>
    ),
  },
  {
    id: "eligibility",
    title: "Refund eligibility",
    body: (
      <>
        <P>Whether you can get money back depends on:</P>
        <UL>
          <li>the fare or rate you chose, and its conditions shown before you paid;</li>
          <li>the rules of the airline, hotel or rental company;</li>
          <li>the status of your booking (confirmed, pending, cancelled or used);</li>
          <li>when you ask to cancel; and</li>
          <li>the law that applies to your trip.</li>
        </UL>
        <H3>Refundable and non-refundable bookings</H3>
        <P>
          <B>Refundable</B> fares and rates can be cancelled for money back, sometimes minus a penalty set by the
          supplier. <B>Non-refundable</B> fares and rates usually return nothing on a voluntary cancellation, though
          some airlines refund certain taxes or offer credit. The conditions shown for your offer before payment apply.
        </P>
      </>
    ),
  },
  {
    id: "flights",
    title: "Flight cancellations and refunds",
    body: (
      <>
        <H3>How to ask for a cancellation</H3>
        <P>
          Flights are booked directly with the airline through our flight partner, Duffel. Cancellations are not
          self-service on the website at this time. Contact us at <Mail /> or 1-800-963-4330 with your booking
          reference and we will check the airline's rules and handle the request with you.
        </P>
        <H3>Airline fare rules decide</H3>
        <P>
          The airline's fare rules decide whether a refund is due and how much any penalty is. We will tell you what the
          airline will return before we cancel, so you can decide whether to go ahead. We never promise a full refund
          unless the fare and the situation allow it.
        </P>
        <H3>Voluntary vs airline-initiated cancellations</H3>
        <UL>
          <li>
            <B>You cancel:</B> the fare rules apply, including any penalty or the loss of a non-refundable fare.
          </li>
          <li>
            <B>The airline cancels or makes a major change:</B> you may be offered another flight or a refund,
            depending on the airline's rules and applicable law.
          </li>
        </UL>
        <H3>Partly used tickets, missed flights and no-shows</H3>
        <P>
          If you miss a flight without cancelling first, the airline may cancel the rest of your trip and the ticket may
          lose its value. Refunds for unused parts of a partly used ticket depend on the airline and are often limited
          to some taxes. Contact us before departure whenever you can.
        </P>
        <H3>Fees</H3>
        <P>
          Penalties charged by the airline are deducted from any refund. Tripile does not add its own cancellation fee
          on top of the price shown at checkout.
        </P>
      </>
    ),
  },
  {
    id: "disruptions",
    title: "Flight changes and schedule disruptions",
    body: (
      <>
        <P>
          Airlines sometimes change times or cancel flights. When the airline tells us about a change through Duffel,
          we update the booking and try to reach you by email. You can then accept the change, ask about another
          flight, or ask whether a refund is due.
        </P>
        <P>
          Other flights, refunds and any compensation are set by the airline's rules and the law that applies (for
          example, U.S. Department of Transportation rules for flights to, from or within the United States). Tripile
          does not pay compensation for airline disruptions itself, but we will help you make your request.
        </P>
      </>
    ),
  },
  {
    id: "hotels",
    title: "Hotel refunds",
    body: (
      <>
        <P>
          Each hotel and rate has its own cancellation rules, shown before you book. We do not apply one rule to every
          hotel.
        </P>
        <UL>
          <li>
            <B>Refundable rates:</B> cancel before the deadline shown for your rate to get money back. After the
            deadline, the hotel's penalty applies.
          </li>
          <li>
            <B>Non-refundable rates:</B> usually no money back if you cancel.
          </li>
          <li>
            <B>No-shows and leaving early:</B> usually charged in line with the hotel's rules. Unused nights are not
            normally refunded.
          </li>
          <li>
            <B>The hotel cancels:</B> if the hotel cannot honour your booking, you are eligible for a refund of what you
            paid for it.
          </li>
        </UL>
        <P>The same approach applies to car rentals: the rental company's conditions shown before booking apply.</P>
      </>
    ),
  },
  {
    id: "payment-issues",
    title: "Failed payments and unconfirmed bookings",
    body: (
      <>
        <P>Payment, booking confirmation and ticketing are separate steps:</P>
        <UL>
          <li>
            <B>Payment received</B> means your card was charged or authorised.
          </li>
          <li>
            <B>Booking confirmed</B> means the airline, hotel or rental company accepted the booking.
          </li>
          <li>
            <B>Ticket issued</B> (flights) means the airline has issued your ticket and booking reference.
          </li>
        </UL>
        <H3>What we do in each case</H3>
        <UL>
          <li>
            <B>Failed payment:</B> no booking is made. Any temporary hold on your card is released by your bank.
          </li>
          <li>
            <B>Pending confirmation:</B> if the airline or supplier has not answered yet, your booking shows as pending.
            We keep checking it automatically and email you when it is confirmed. Please do not book again in the
            meantime, to avoid paying twice.
          </li>
          <li>
            <B>Booking fails after payment:</B> if the booking cannot be completed, we refund the amount charged for it.
          </li>
          <li>
            <B>Duplicate charges:</B> tell us and we will check our records and refund any charge that did not result in
            a separate booking.
          </li>
          <li>
            <B>Unclear cases:</B> we investigate with the supplier and payment partner and keep you updated by email.
          </li>
        </UL>
      </>
    ),
  },
  {
    id: "roles",
    title: "Who does what",
    body: (
      <UL>
        <li>
          <B>The airline, hotel or rental company</B> sets the rules and decides whether a refund is due.
        </li>
        <li>
          <B>Duffel</B>, our flight partner, connects us to the airline and processes flight bookings, card payments
          and airline refunds.
        </li>
        <li>
          <B>Our secure payment partner</B> processes card payments and refunds for hotels and car rentals. It does not
          decide whether you are eligible.
        </li>
        <li>
          <B>Tripile</B> receives your request, checks it against the rules, sends it to the right party and keeps you
          updated. Refunds are reviewed by our team and are not issued automatically.
        </li>
      </UL>
    ),
  },
  {
    id: "timelines",
    title: "How long refunds take",
    body: (
      <>
        <P>A refund goes through several stages, and each can take a different amount of time:</P>
        <UL>
          <li>our team reviewing your request;</li>
          <li>the airline, hotel or rental company approving it, which can take from days to several weeks;</li>
          <li>Tripile or our partner sending the refund once it is approved; and</li>
          <li>your bank or card issuer adding it to your account, which usually takes 5–10 business days.</li>
        </UL>
        <P>We will tell you when a refund has been sent. If it has not arrived after that, contact your bank first and then us.</P>
      </>
    ),
  },
  {
    id: "method",
    title: "Refund method and charges",
    body: (
      <>
        <P>
          Approved refunds go back to the card you paid with, in the currency you paid in. Prices for hotels and cars
          are charged in U.S. dollars.
        </P>
        <P>
          Any supplier penalty and any non-refundable taxes or charges are deducted, as shown in the fare or rate
          conditions. Your bank may apply its own exchange rate, which Tripile does not control.
        </P>
      </>
    ),
  },
  {
    id: "promos",
    title: "Promo codes",
    body: (
      <P>
        If you used a Tripile promo code (see our <L to="/coupons">coupons page</L>), the refund is based on the amount
        you actually paid, not the price before the discount. A used promo code is not returned or exchanged for cash.
      </P>
    ),
  },
  {
    id: "request",
    title: "How to ask for a refund",
    body: (
      <div className="mb-4 rounded-2xl border border-primary/30 bg-primary/5 p-6">
        <ol className="ml-6 list-decimal space-y-3 text-muted-foreground">
          <li>
            Find your booking details in your confirmation email or under <L to="/my-bookings">My Bookings</L> if you
            have an account.
          </li>
          <li>
            Email <Mail /> or call 1-800-963-4330 (24/7).
          </li>
          <li>Give your booking reference, the lead traveller's name, the email used to book, and the reason.</li>
          <li>
            We check the rules, tell you what can be refunded and, with your approval, send the request to the supplier.
            We update you by email until it is done.
          </li>
        </ol>
      </div>
    ),
  },
  {
    id: "disputes",
    title: "Complaints and your rights",
    body: (
      <>
        <P>
          If you are unhappy with how a refund was handled, email <Mail /> with "Complaint" in the subject and we will
          review it. You can also contact the airline or supplier directly, or a consumer-protection body.
        </P>
        <P>Nothing in this policy limits any rights you have under consumer-protection law.</P>
      </>
    ),
  },
  {
    id: "contact",
    title: "Changes and contact",
    body: (
      <>
        <P>We may update this policy. Changes appear here with a new "Last updated" date.</P>
        <address className="not-italic mb-4 text-muted-foreground leading-relaxed">
          Tripile (operated by Trivoya Ventures LLC)
          <br />
          Austin, Texas, USA
          <br />
          Email: <Mail />
          <br />
          Phone (24/7): <a href="tel:+18009634330" className="text-primary underline underline-offset-4">1-800-963-4330</a>
        </address>
      </>
    ),
  },
];
export default function RefundPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SEOHead
        title="Refund Policy | Tripile"
        description="How cancellations and refunds work on Tripile for flights, hotels and car rentals: eligibility, airline rules, failed payments, timelines and how to ask for a refund."
        canonicalUrl="https://tripile.com/refund-policy"
      />
      <Header />
      <main className="flex-1 pt-20 md:pt-28 pb-16">
        <article className="legal-doc container mx-auto max-w-4xl px-4">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Refund &amp; Cancellation Policy</h1>
            <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
          </header>

          <nav aria-label="Contents" className="mb-10 rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-3 text-base font-semibold text-foreground">Contents</h2>
            <ol className="grid gap-2 sm:grid-cols-2 text-sm">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-primary hover:underline underline-offset-4">
                    {i + 1}. {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {sections.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="mb-10 scroll-mt-32">
              <h2 id={`${s.id}-h`} className="legal-h2 mb-5 text-2xl">
                {i + 1}. {s.title}
              </h2>
              {s.body}
            </section>
          ))}
        </article>
      </main>
      <Footer />
    </div>
  );
}
