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
    id: "acceptance",
    title: "Introduction and acceptance",
    body: (
      <>
        <P>
          Tripile (tripile.com) is an online travel service operated by Trivoya Ventures LLC, Austin, Texas, USA
          ("Tripile", "we", "us"). Tripile lets you search and compare flights, hotels and car rentals and book them
          with airlines and travel suppliers.
        </P>
        <P>
          These Terms apply when you use the website or make a booking. By using the site, or by ticking the Terms box
          at checkout, you agree to them. Our <L to="/privacy">Privacy Policy</L>, <L to="/refund-policy">Refund
          Policy</L> and <L to="/taxes-fees">Taxes &amp; Fees</L> page also apply, as do the rules of the airline or
          supplier you book with.
        </P>
      </>
    ),
  },
  {
    id: "definitions",
    title: "Definitions",
    body: (
      <UL>
        <li><B>"Booking"</B> — a flight, hotel or car rental reservation made through Tripile.</li>
        <li><B>"Supplier"</B> — the airline, hotel, rental company or other provider that delivers the travel service.</li>
        <li><B>"Offer"</B> — a price and itinerary returned by a supplier at the time of your search.</li>
        <li><B>"Traveler"</B> — any person named on a booking, including the person who books.</li>
        <li><B>"Booking reference"</B> — the code (for flights, a PNR) issued once a supplier confirms a booking.</li>
      </UL>
    ),
  },
  {
    id: "eligibility",
    title: "Eligibility and your responsibilities",
    body: (
      <UL>
        <li>You must be at least 18 and legally able to enter into a contract to make a booking.</li>
        <li>Billing for payments is available for United States billing addresses only.</li>
        <li>
          Searches and bookings involving Cuba, Iran, North Korea, Syria, Crimea, Donetsk or Luhansk are not offered,
          in line with sanctions rules.
        </li>
        <li>All information you give us must be accurate and complete.</li>
        <li>If you have an account, keep your password safe; you're responsible for activity on your account.</li>
        <li>If you book for other travelers, you confirm they've authorized you to do so and to share their details.</li>
      </UL>
    ),
  },
  {
    id: "services",
    title: "Description of services",
    body: (
      <>
        <P>It's important to understand the different stages of a booking:</P>
        <UL>
          <li><B>Search results</B> show live offers at that moment. They are not reservations and can change or disappear.</li>
          <li><B>A selected offer</B> is re-checked with the supplier before you pay. Its price or availability may change.</li>
          <li><B>A pending booking</B> means payment or supplier confirmation is still being verified. It is not yet confirmed.</li>
          <li><B>A confirmed booking</B> means the airline or supplier has accepted it and you receive a booking reference.</li>
          <li><B>Tickets and vouchers</B> are issued by the airline or supplier; timing depends on them.</li>
        </UL>
        <P>
          Tripile also provides travel guides, deals, flight status and tracking tools, an AI travel assistant, and
          24/7 customer support. Guide content and assistant answers are general information, not a guarantee of
          price, availability or entry rules.
        </P>
      </>
    ),
  },
  {
    id: "flights",
    title: "Flight booking terms",
    body: (
      <>
        <P>Flights are searched and booked through our flight partner, Duffel, directly with the airline. The process is:</P>
        <UL>
          <li>You search and select an offer. Before checkout we reload the offer to confirm it's still valid and to get its current price.</li>
          <li>You enter passenger details. If the price has changed, we show you the new price before you pay.</li>
          <li>You pay by card. Your bank may ask you to verify the payment (3D Secure).</li>
          <li>We create the order with the airline. The airline confirms it and issues a booking reference (PNR).</li>
          <li>If confirmation takes longer, your booking shows as pending while we check its status with the airline. We'll update you once it's confirmed or failed.</li>
        </UL>
        <P>
          A successful card authorization alone does not mean a ticket has been issued — only airline confirmation
          does. Prices, seats, schedules, baggage allowances and fare conditions are set by the airline and may change.
          The airline's conditions of carriage and fare rules apply to your trip. Offers expire; an expired offer
          cannot be booked.
        </P>
      </>
    ),
  },
  {
    id: "hotels",
    title: "Hotel and car rental booking terms",
    body: (
      <>
        <P>
          Hotel results show live availability and prices from our data partners. Information such as photos,
          location details and ratings may come from third parties like Google Places and can be incomplete. Displaying a
          hotel is not a reservation — a reservation exists only once checkout completes and you receive confirmation.
        </P>
        <P>
          Each property sets its own check-in and check-out times, age, deposit and ID requirements, local taxes or
          resort fees payable at the property, cancellation deadlines, and no-show rules. Non-refundable rates cannot
          be refunded. Check the rate details shown before you pay.
        </P>
        <P>Car rentals are subject to the rental company's terms, including driver age, license, deposit, mileage and fuel rules.</P>
      </>
    ),
  },
  {
    id: "taxes",
    title: "Pricing, taxes, currency and fees",
    body: (
      <>
        <P>
          Prices come from the airline or supplier and include the taxes and charges they return, as shown at
          checkout. The total you see at checkout is the amount you pay. Prices may change until payment is complete.
        </P>
        <UL>
          <li>Flights are charged in the currency shown at checkout.</li>
          <li>Hotel and car rental payments are charged in US dollars.</li>
          <li>Your bank may add foreign-transaction or conversion fees, which Tripile does not control.</li>
          <li>Some charges, such as hotel resort fees, city taxes or airline bag and seat fees, may be payable directly to the supplier.</li>
        </UL>
        <P>
          If a booking is made at an obvious pricing error or the offer is no longer available, we may cancel it and
          give a full refund of the amount paid, subject to applicable law. See <L to="/taxes-fees">Taxes &amp; Fees</L>.
        </P>
      </>
    ),
  },
  {
    id: "payments",
    title: "Payments and transactions",
    body: (
      <>
        <UL>
          <li><B>Flights</B> are paid by card through Duffel's secure payment form.</li>
          <li><B>Hotels and car rentals</B> are paid by card through our secure payment partner.</li>
        </UL>
        <P>
          Card details go directly to the payment provider and are not stored by Tripile. We confirm payment status
          with the provider on our servers rather than relying on your browser. Outcomes:
        </P>
        <UL>
          <li><B>Successful:</B> payment confirmed and the booking proceeds to supplier confirmation.</li>
          <li><B>Failed or declined:</B> no booking is made. Try again or use another card.</li>
          <li><B>Pending:</B> we're still verifying. Please don't pay again — contact support if unsure.</li>
          <li><B>Abandoned:</B> if you leave checkout before paying, no booking is made.</li>
        </UL>
        <P>
          If you think you were charged twice or charged without a booking, contact <Mail /> and we'll investigate
          with the payment provider. Your bank or card issuer may also have dispute rights.
        </P>
      </>
    ),
  },
  {
    id: "post-ticketing",
    title: "Cancellations, changes and refunds",
    body: (
      <>
        <P>
          To cancel or change a booking, contact our support team at <Mail /> or 1-800-963-4330. Whether you can
          change or cancel, and any penalty, depends on the airline's fare rules or the supplier's rate conditions.
          Many basic fares and non-refundable hotel rates cannot be refunded.
        </P>
        <UL>
          <li><B>Supplier cancellations or major schedule changes:</B> you may be entitled to a refund or alternative under the airline's or supplier's rules and applicable law; we'll help you request it.</li>
          <li><B>Failed bookings:</B> if you're charged but the booking is not confirmed, we'll refund the amount charged.</li>
          <li><B>Refund timing:</B> refunds go back to the original payment method. Timing depends on the supplier, payment provider and your bank.</li>
        </UL>
        <P>Full details are in our <L to="/refund-policy">Refund Policy</L>.</P>
      </>
    ),
  },
  {
    id: "documents",
    title: "Passenger details and travel documents",
    body: (
      <>
        <P>
          Names must match the traveler's government ID exactly. Errors may lead to denied boarding or airline
          correction fees.
        </P>
        <P>
          For international itineraries we ask for passport details at checkout. Domestic itineraries do not require
          them. You are responsible for checking and meeting passport, visa, transit, health and entry requirements
          for every country on your trip.
        </P>
      </>
    ),
  },
  {
    id: "promotions",
    title: "Promotional offers and discount codes",
    body: (
      <>
        <P>
          Tripile's current discount codes are listed on our <L to="/coupons">Coupons</L> page, with each code's
          minimum booking amount. Codes currently apply to hotel and car rental checkout only.
        </P>
        <UL>
          <li>One code per booking; codes can't be exchanged for cash.</li>
          <li>Welcome offers are for first eligible bookings only.</li>
          <li>Any refund is based on the amount actually paid after the discount.</li>
          <li>We may withdraw or change codes, or refuse misuse, at any time.</li>
        </UL>
      </>
    ),
  },
  {
    id: "third-parties",
    title: "Third-party providers",
    body: (
      <>
        <P>
          Your travel is provided by airlines, hotels and rental companies, not by Tripile. Tripile runs the website,
          search, checkout and customer support. Other services we use include:
        </P>
        <UL>
          <li>Duffel — flight search, booking and flight payments.</li>
          <li>Google Places — hotel location and listing information.</li>
        </UL>
        <P>
          Each provider has its own terms. We are not responsible for the services they deliver, but nothing in these
          Terms removes rights you have under consumer protection law that cannot be excluded.
        </P>
      </>
    ),
  },
  {
    id: "prohibited-use",
    title: "Website availability and prohibited use",
    body: (
      <>
        <P>You must not:</P>
        <UL>
          <li>Make fraudulent, speculative or false bookings, or use stolen payment details.</li>
          <li>Give false traveler or contact information.</li>
          <li>Try to access accounts, systems or data you're not authorized to.</li>
          <li>Scrape, overload, or interfere with the website, or introduce malicious code.</li>
          <li>Try to bypass prices, validation, sanctions rules or billing restrictions.</li>
        </UL>
        <P>
          We may suspend access or cancel bookings for suspected fraud, security reasons or breach of these Terms, and
          may take the site offline for maintenance, subject to applicable law.
        </P>
      </>
    ),
  },
  {
    id: "ip",
    title: "Intellectual property",
    body: (
      <P>
        The Tripile name, logo, design, content and software belong to Trivoya Ventures LLC or its licensors. You may
        use the site for personal, non-commercial travel planning. You may not copy, resell or commercially use our
        content without written permission. Airline, hotel and other brand names and logos belong to their owners.
      </P>
    ),
  },
  {
    id: "accuracy",
    title: "Accuracy and availability",
    body: (
      <P>
        Prices, availability, schedules and supplier information change frequently and come largely from third
        parties. We work to show accurate information but can't guarantee it's always error-free or that the site
        will be available without interruption. If we find a technical error affecting your booking, we'll contact
        you to fix it or offer a refund.
      </P>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability and indemnification",
    body: (
      <>
        <P>
          To the extent the law allows, Tripile is not liable for the acts or omissions of airlines, hotels or other
          suppliers, for delays, cancellations or events beyond our reasonable control, or for indirect or
          consequential losses. Our total liability for a booking is limited to the amount you paid Tripile for it.
          Nothing in these Terms limits liability that cannot be limited by law, such as for fraud or gross
          negligence.
        </P>
        <P>
          You agree to cover reasonable losses we suffer because you deliberately breach these Terms or misuse the
          website.
        </P>
      </>
    ),
  },
  {
    id: "communications",
    title: "Privacy and communications",
    body: (
      <P>
        We handle your information as described in our <L to="/privacy">Privacy Policy</L>. We'll send you
        transactional emails such as verification codes, booking confirmations and updates — these are part of the
        service. Marketing messages are sent only if you opt in, and you can unsubscribe at any time.
      </P>
    ),
  },
  {
    id: "law",
    title: "Governing law and disputes",
    body: (
      <P>
        These Terms are governed by the laws of the State of Texas, USA, without regard to conflict-of-law rules.
        Please contact us first so we can try to resolve any issue. If that fails, disputes may be brought in the
        state or federal courts in Travis County, Texas. If you live outside the US, you keep any mandatory
        protections and rights to bring claims under the law of your country of residence.
      </P>
    ),
  },
  {
    id: "accounts",
    title: "Accounts and termination",
    body: (
      <>
        <P>
          You can browse and book as a guest or create an account. Accounts require a verified email address. You
          can stop using your account at any time and ask us to close it by emailing <Mail />.
        </P>
        <P>
          We may suspend or close accounts that break these Terms, are used for fraud, or put other users or our
          systems at risk. Closing an account doesn't cancel bookings already confirmed; those stay subject to the
          supplier's rules.
        </P>
      </>
    ),
  },
  {
    id: "special-assistance",
    title: "Special assistance and accessibility",
    body: (
      <P>
        If a traveler needs wheelchair assistance, special meals, or other help, contact us after booking and we'll
        pass the request to the airline or supplier. Requests are not guaranteed — they depend on the supplier's
        ability to provide them. Please contact the supplier directly as well where possible.
      </P>
    ),
  },
  {
    id: "force-majeure",
    title: "Events outside our control",
    body: (
      <P>
        We are not responsible for failures or delays caused by events beyond our reasonable control, such as severe
        weather, natural disasters, strikes, airport or airspace closures, government action, pandemics, or outages
        at suppliers or payment networks. In these cases, the supplier's rules and applicable passenger-rights laws
        decide what refund or rebooking you're entitled to, and we'll help you request it.
      </P>
    ),
  },
  {
    id: "complaints",
    title: "Complaints",
    body: (
      <P>
        If something goes wrong, contact <Mail /> or call 1-800-963-4330 with your booking reference. We aim to
        acknowledge complaints promptly and work with the supplier to resolve them. Complaints about the travel
        service itself (for example, a delayed flight or a hotel room) may need to be handled by the supplier, and
        we'll tell you if so.
      </P>
    ),
  },
  {
    id: "general",
    title: "General",
    body: (
      <UL>
        <li>These Terms, together with the policies they reference, are the whole agreement between you and Tripile about using the site.</li>
        <li>If we don't enforce a right straight away, we can still enforce it later.</li>
        <li>You may not transfer your rights under these Terms; we may transfer ours to a successor business.</li>
        <li>These Terms are written in English, which is the version that applies.</li>
      </UL>
    ),
  },
  {
    id: "changes",
    title: "Changes to these Terms",
    body: (
      <P>
        We may update these Terms. Changes are published on this page with a new "Last updated" date and apply from
        that date. Bookings already made remain under the Terms in place when you booked. If any part of these Terms
        is found unenforceable, the rest stays in effect.
      </P>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <address className="not-italic mb-4 text-muted-foreground leading-relaxed">
        Tripile (operated by Trivoya Ventures LLC)
        <br />
        Austin, Texas, USA
        <br />
        Email: <Mail />
        <br />
        Phone (24/7): <a href="tel:+18009634330" className="text-primary underline underline-offset-4">1-800-963-4330</a>
      </address>
    ),
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SEOHead
        title="Terms & Conditions | Tripile"
        description="The terms for using Tripile and booking flights, hotels and car rentals: how bookings and payments work, cancellations and refunds, travel documents, and your rights."
        canonicalUrl="https://tripile.com/terms"
      />
      <Header />
      <main className="flex-1 pt-20 md:pt-28 pb-16">
        <article className="legal-doc container mx-auto max-w-4xl px-4">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Terms &amp; Conditions</h1>
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
