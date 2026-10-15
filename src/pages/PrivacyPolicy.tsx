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
const A: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">
    {children}
  </a>
);
const B: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <strong className="text-foreground">{children}</strong>
);
const Mail = () => (
  <a href="mailto:Support@Tripile.com" className="text-primary underline underline-offset-4">
    Support@Tripile.com
  </a>
);

const sections: Section[] = [
  {
    id: "introduction",
    title: "Introduction and scope",
    body: (
      <>
        <P>
          This Privacy Policy explains how Tripile ("Tripile", "we", "us") collects, uses, stores and shares personal
          information when you browse tripile.com, search for flights, hotels or car rentals, create an account, make a
          booking, or contact our support team. Tripile is operated by Trivoya Ventures LLC, Austin, Texas, USA.
        </P>
        <P>
          This policy covers the Tripile website and the communications we send you. It does not cover websites or
          services run by airlines, hotels, payment providers or other third parties, which have their own privacy
          policies (see section 17).
        </P>
      </>
    ),
  },
  {
    id: "children",
    title: "Children's privacy",
    body: (
      <>
        <P>
          Tripile is intended for adults. You must be at least 18 years old to create an account or make a booking.
          We do not knowingly collect personal information directly from children.
        </P>
        <P>
          When an adult books travel that includes children or infants, the booking adult provides the traveler
          details the airline or hotel requires (such as name, date of birth and, for some international flights,
          passport details). We use this information only to complete and service that booking. If you believe a
          child has given us personal information directly, contact <Mail /> and we will delete it where the law
          allows.
        </P>
      </>
    ),
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    body: (
      <>
        <H3>Account and contact information</H3>
        <UL>
          <li>Name, email address, mobile phone number and password (stored as a secure hash by our authentication provider).</li>
          <li>If you sign in with a third-party account, the name, email address and profile picture that account shares with us.</li>
          <li>Email and phone verification status, and whether you opted in to marketing messages.</li>
        </UL>
        <H3>Flight searches and bookings</H3>
        <UL>
          <li>Origin, destination, travel dates, cabin class and number of adults, children and infants.</li>
          <li>The offer you select, its price and fare conditions.</li>
          <li>
            Passenger details required by the airline: title, first and last name, date of birth, gender, email and
            phone number.
          </li>
          <li>
            Passport number, expiry date, issuing country and nationality — only for itineraries our system identifies
            as international. Domestic itineraries do not ask for passport details.
          </li>
        </UL>
        <H3>Hotel and car rental searches and bookings</H3>
        <UL>
          <li>Destination, check-in and check-out dates, room and guest counts, pickup locations and dates.</li>
          <li>Lead guest or driver name, email and phone number.</li>
        </UL>
        <H3>Transaction records</H3>
        <UL>
          <li>Booking references, amounts, currency, payment status, refund status and timestamps.</li>
          <li>
            Payment identifiers issued by our payment providers (for example a payment or transaction ID). We do not
            receive or store your full card number or security code.
          </li>
        </UL>
        <H3>Device and usage information</H3>
        <UL>
          <li>IP address, browser and device type, pages visited, and approximate location derived from your IP address (for example, to apply billing and sanctions rules).</li>
          <li>Server and security logs, error and diagnostic information.</li>
        </UL>
        <H3>Support and feedback</H3>
        <UL>
          <li>Messages you send through chat, email or phone, and reviews or feedback you submit.</li>
          <li>Questions you ask our on-site travel assistant.</li>
        </UL>
      </>
    ),
  },
  {
    id: "information-you-provide",
    title: "Information you provide",
    body: (
      <>
        <P>Most of the information we hold comes directly from you:</P>
        <UL>
          <li><strong className="text-foreground">Registration:</strong> when you create an account or sign in with a third-party account.</li>
          <li><strong className="text-foreground">Searches:</strong> the routes, destinations, dates and traveler numbers you enter.</li>
          <li><strong className="text-foreground">Checkout:</strong> traveler, contact and billing details, and acceptance of our Terms.</li>
          <li><strong className="text-foreground">Support:</strong> anything you share when you contact us or use the travel assistant.</li>
        </UL>
        <P>
          If you provide information about other travelers, you confirm you have their permission to share it for
          their booking.
        </P>
        <P>We also receive information back from our partners, such as airline booking references, ticket and order status, schedule changes, and payment confirmations.</P>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and similar technologies",
    body: (
      <>
        <P>We use a small number of cookies and browser storage technologies:</P>
        <UL>
          <li><strong className="text-foreground">Essential:</strong> keeping you signed in, remembering your cookie choice, and protecting checkout.</li>
          <li><strong className="text-foreground">Functional (local and session storage):</strong> saving your language, recent searches, the flight offer you selected, and booking progress so you don't lose details if you go back a step.</li>
          <li><strong className="text-foreground">Payment security:</strong> our payment providers' secure card forms may set their own cookies for fraud prevention and card authentication (3D Secure).</li>
        </UL>
        <P>
          We do not currently use advertising or cross-site tracking cookies. If we add analytics in the future, it
          will load only after you accept cookies in our banner.
        </P>
        <P>
          You can delete or block cookies and site storage in your browser settings. Blocking essential storage may
          stop sign-in or checkout from working.
        </P>
      </>
    ),
  },
  {
    id: "analytics",
    title: "Third-party tracking and analytics",
    body: (
      <P>
        Tripile does not currently run third-party advertising pixels or behavioral tracking. Our site includes
        optional support for an analytics tool, which is turned off and, if enabled, will only load after you accept
        cookies. If that changes, we will update this section and name the provider.
      </P>
    ),
  },
  {
    id: "how-we-use",
    title: "How we use information",
    body: (
      <UL>
        <li>Running flight, hotel and car rental searches and showing live prices.</li>
        <li>Creating, confirming, changing and cancelling bookings with airlines, hotels and suppliers.</li>
        <li>Processing payments, verifying payment status, and handling refunds.</li>
        <li>Verifying your email and phone number and keeping your account secure.</li>
        <li>Sending booking confirmations, updates and support replies.</li>
        <li>Preventing fraud and enforcing billing, sanctions and legal restrictions.</li>
        <li>Fixing errors and improving the website.</li>
        <li>Sending marketing messages, only if you opted in.</li>
        <li>Meeting legal, tax, accounting and regulatory obligations.</li>
      </UL>
    ),
  },
  {
    id: "sharing",
    title: "How we share information",
    body: (
      <>
        <P>We share personal information only as needed for the purposes above. We do not sell your personal information.</P>
        <UL>
          <li><strong className="text-foreground">Airlines and travel suppliers:</strong> the airline, hotel or car rental company that provides your booking receives the traveler details it needs.</li>
          <li><strong className="text-foreground">Duffel:</strong> our flight search and booking provider. Duffel receives your search, passenger and passport details (where required) and passes them to the airline. See <A href="https://duffel.com/privacy-policy">Duffel's privacy policy</A>.</li>
          <li><strong className="text-foreground">Hotel and car data providers:</strong> Google Places (hotel location and listing information) receives the search details needed to return results.</li>
          <li><strong className="text-foreground">Payment providers:</strong> Duffel for flight payments, and our secure payment partner for hotel and car payments (see section 9).</li>
          <li><strong className="text-foreground">Service providers:</strong> cloud hosting, database and authentication, content delivery, email delivery, account sign-in, and an AI service that powers our travel assistant. These providers process data on our behalf.</li>
          <li><strong className="text-foreground">Legal and safety:</strong> government authorities, courts or others when required by law, or to protect rights, safety and prevent fraud. Airlines may also share passenger data with border and security authorities as required by law.</li>
          <li><strong className="text-foreground">Business transfers:</strong> a buyer or successor if Tripile is involved in a merger, acquisition or sale of assets.</li>
        </UL>
      </>
    ),
  },
  {
    id: "payments",
    title: "Payments and transactions",
    body: (
      <>
        <UL>
          <li><strong className="text-foreground">Flights:</strong> card payments are entered into Duffel's secure card form and authenticated with your bank (3D Secure) where required. Your card is charged when the airline confirms the order.</li>
          <li><strong className="text-foreground">Hotels and car rentals:</strong> card payments are processed by our secure payment partner in US dollars.</li>
        </UL>
        <P>
          Card numbers and security codes go directly to the payment provider and never reach Tripile's servers.
          Tripile keeps a record of the booking, amount, currency, payment status, provider reference and any refund,
          which we need for confirmation, customer support, reconciliation, disputes and accounting.
        </P>
      </>
    ),
  },
  {
    id: "communications",
    title: "Email, SMS and marketing communications",
    body: (
      <>
        <P>
          We send <strong className="text-foreground">transactional messages</strong> such as verification codes,
          booking confirmations, schedule-change notices and support replies. These are part of the service and can't
          be switched off while you have an active account or booking.
        </P>
        <P>
          We send <strong className="text-foreground">marketing messages</strong> only if you opted in. You can opt
          out at any time using the unsubscribe link in an email, by replying STOP to a text message where offered, or
          by contacting <Mail />.
        </P>
      </>
    ),
  },
  {
    id: "choices",
    title: "Your privacy choices",
    body: (
      <UL>
        <li>Manage cookies and site storage through your browser settings.</li>
        <li>Opt out of marketing messages as described above.</li>
        <li>Update your name and contact details from your <Link to="/account" className="text-primary underline underline-offset-4">account</Link>, or ask us to.</li>
        <li>Choose not to use optional features such as the travel assistant or third-party sign-in.</li>
      </UL>
    ),
  },
  {
    id: "access-deletion",
    title: "Access, correction and deletion",
    body: (
      <>
        <P>
          You can ask us for a copy of your personal information, ask us to correct it, or ask us to delete it by
          emailing <Mail /> or calling 1-800-963-4330. We will verify your identity before acting on a request.
        </P>
        <P>
          Some records must be kept even after a deletion request — for example booking and payment records needed for
          tax and accounting, fraud prevention, chargebacks, or obligations to airlines and authorities. Information
          already sent to an airline or hotel is held under that supplier's policy, and we can help you contact them.
        </P>
      </>
    ),
  },
  {
    id: "security",
    title: "Data security",
    body: (
      <P>
        We use reasonable technical and organizational safeguards, including encrypted HTTPS connections, access
        controls that limit who can view booking data, hashed passwords, and keeping card details with our payment
        providers. No online service is completely secure, and we cannot guarantee absolute security. If you believe
        your account has been compromised, contact us right away.
      </P>
    ),
  },
  {
    id: "retention",
    title: "Data retention",
    body: (
      <P>
        We keep personal information only as long as reasonably needed: account information while your account is
        active; booking and payment records for as long as tax, accounting and legal rules require and to resolve
        disputes; verification codes for a few minutes; and logs for a limited period for security and diagnostics.
        When information is no longer needed, we delete or anonymize it.
      </P>
    ),
  },
  {
    id: "international",
    title: "International data transfers",
    body: (
      <P>
        Tripile is based in the United States, and our service providers may process data in the United States and
        other countries. Booking an international trip necessarily means sharing traveler data with airlines and
        hotels in other countries. Where the law requires it, we rely on appropriate safeguards for these transfers,
        such as contractual protections offered by our providers.
      </P>
    ),
  },
  {
    id: "rights",
    title: "Privacy rights by jurisdiction",
    body: (
      <>
        <P>Depending on where you live, you may have some of the rights below. Not every law applies to every user.</P>
        <H3 id="california">United States, including California</H3>
        <P>
          Residents of California and other US states with consumer privacy laws may have the right to know what
          personal information we collect and how we use and share it, to access, correct or delete it, and to opt out
          of its sale or use for targeted advertising. Tripile does not sell personal information or share it for
          cross-context behavioral advertising. We will not discriminate against you for exercising your rights. You
          may use an authorized agent; we may ask them to prove they act for you.
        </P>
        <H3>European Economic Area and United Kingdom</H3>
        <P>
          If GDPR or UK GDPR applies, we process your data to perform our contract with you (your booking), to meet
          legal obligations, for our legitimate interests (such as security and fraud prevention), or with your consent
          (such as marketing). You may have the right to access, correct, delete, restrict or object to processing, to
          data portability, to withdraw consent, and to complain to your local data protection authority.
        </P>
        <H3>Canada</H3>
        <P>
          Under applicable Canadian privacy law, you may request access to and correction of your personal information
          and withdraw consent, subject to legal and contractual limits.
        </P>
        <H3>India</H3>
        <P>
          Where India's Digital Personal Data Protection Act applies, you may request information about, correction or
          erasure of your personal data, withdraw consent, nominate another person to exercise your rights, and raise a
          grievance with us at <Mail />.
        </P>
        <P>
          To exercise any right, email <Mail />. We will respond within the time the applicable law requires.
        </P>
      </>
    ),
  },
  {
    id: "third-parties",
    title: "Third-party websites and services",
    body: (
      <P>
        Our site links to airline websites (for example for web check-in), hotel and payment services, and other
        external sites. Those services have their own privacy policies, and we are not responsible for their
        practices. Please review their policies before giving them your information.
      </P>
    ),
  },
  {
    id: "sources",
    title: "Sources of personal information",
    body: (
      <>
        <P>We collect personal information from the following sources:</P>
        <UL>
          <li><B>You directly</B> — when you register, search, book, or contact us.</li>
          <li><B>Your device</B> — automatically, through your browser when you use the site (IP address, browser type, pages viewed).</li>
          <li><B>Sign-in providers</B> — if you choose to sign in with a third-party account.</li>
          <li><B>Travel partners</B> — Duffel and airlines, hotel and car data providers, which send booking references, order status, schedule changes and cancellations.</li>
          <li><B>Payment providers</B> — Duffel and our secure payment partner, which tell us whether a payment succeeded, failed, was refunded or disputed.</li>
        </UL>
      </>
    ),
  },
  {
    id: "legal-bases",
    title: "Legal bases for processing",
    body: (
      <>
        <P>Where laws such as the GDPR require a legal basis, we rely on:</P>
        <UL>
          <li><B>Performance of a contract</B> — to search, book, pay for and service your trip.</li>
          <li><B>Legal obligation</B> — to keep tax and accounting records, apply sanctions rules, and respond to lawful requests.</li>
          <li><B>Legitimate interests</B> — to secure the site, prevent fraud, fix errors and improve our services, balanced against your rights.</li>
          <li><B>Consent</B> — for marketing messages and any optional cookies. You can withdraw consent at any time without affecting earlier processing.</li>
        </UL>
      </>
    ),
  },
  {
    id: "sensitive",
    title: "Sensitive information",
    body: (
      <>
        <P>
          Passport numbers and dates of birth are treated as sensitive. We collect them only when the airline
          requires them, use them only to complete and service your booking, and restrict who can access them.
        </P>
        <P>
          We do not ask for health, religious, biometric or similar special-category data. If you choose to share it
          (for example, a meal or accessibility request in a support message), we use it only to handle that request
          and pass it to the relevant supplier.
        </P>
      </>
    ),
  },
  {
    id: "automated",
    title: "Automated decisions and AI assistant",
    body: (
      <>
        <P>
          We use automated checks to block fraudulent or restricted bookings — for example, non-US billing addresses
          or sanctioned destinations. If you believe a booking was blocked in error, contact us and a person will
          review it.
        </P>
        <P>
          Our travel assistant uses an AI service to answer questions. Do not share passport, payment or other
          sensitive details with the assistant. Its answers are general guidance and may not always be accurate.
        </P>
      </>
    ),
  },
  {
    id: "dnt",
    title: "Do Not Track and Global Privacy Control",
    body: (
      <P>
        Because Tripile does not currently use advertising or cross-site tracking, there is no tracking for Do Not
        Track or Global Privacy Control signals to switch off. If we introduce such technologies, we will honor
        Global Privacy Control signals as an opt-out where the law requires it and update this policy.
      </P>
    ),
  },
  {
    id: "breach",
    title: "Security incidents",
    body: (
      <P>
        If we learn of a security incident that affects your personal information, we will investigate, take steps
        to contain it, and notify you and the relevant authorities where the law requires us to do so.
      </P>
    ),
  },
  {
    id: "your-responsibilities",
    title: "Information about other travellers",
    body: (
      <>
        <P>
          When you book for other people, you give us their names, dates of birth and, for international flights,
          passport details. By doing so you confirm that you are allowed to share this information and that you have
          told them how it will be used under this policy.
        </P>
        <UL>
          <li>We use it only to make and manage that booking and to meet airline and government rules.</li>
          <li>The airline or supplier receives the details it needs to issue the ticket or reservation.</li>
          <li>Each traveller can contact us to see, correct or ask about their own information.</li>
        </UL>
      </>
    ),
  },
  {
    id: "support-records",
    title: "Customer support records",
    body: (
      <>
        <P>
          When you email or call us, we keep a record of the conversation, your booking reference and what we did to
          help. We use these records to resolve your request, handle refunds and complaints, and train our team.
        </P>
        <UL>
          <li>Calls may be noted in writing so we can follow up accurately.</li>
          <li>We keep support records for as long as needed to handle the booking and any related claims.</li>
        </UL>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <P>
        We may update this policy when our services or legal obligations change. We will publish the updated version
        on this page and change the "Last updated" date at the top. For significant changes, we may also notify you by
        email or on the website.
      </P>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    body: (
      <>
        <P>For privacy questions or requests, contact:</P>
        <address className="not-italic mb-4 text-muted-foreground leading-relaxed">
          Tripile (operated by Trivoya Ventures LLC)
          <br />
          Austin, Texas, USA
          <br />
          Email: <Mail />
          <br />
          Phone: <a href="tel:+18009634330" className="text-primary underline underline-offset-4">1-800-963-4330</a>
        </address>
      </>
    ),
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SEOHead
        title="Privacy Policy | Tripile"
        description="How Tripile collects, uses, shares and protects your personal information when you search and book flights, hotels and car rentals, and how to exercise your privacy rights."
        canonicalUrl="https://tripile.com/privacy"
      />
      <Header />
      <main className="flex-1 pt-20 md:pt-28 pb-16">
        <article className="legal-doc container mx-auto max-w-4xl px-4">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Privacy Policy</h1>
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
