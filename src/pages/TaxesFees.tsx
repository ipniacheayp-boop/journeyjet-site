import { Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { AlertTriangle, Phone } from 'lucide-react';

const TaxesFees = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title="Airline Taxes, Fees & Post-Ticketing Charges | ChyeapFlights"
        description="Understand airline taxes, service fees, and post-ticketing charges including changes, cancellations, and refunds."
        canonicalUrl="https://chyeapflights.com/taxes-fees"
        keywords="airline taxes, flight fees, post-ticketing fees, cancellation fees, change fees, baggage fees, refund policy"
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary/5 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/taxes-fees">Taxes & Fees</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Post-Ticketing</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Taxes & Fees
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Post-Ticketing Charges & Airline Fees
            </p>
          </div>
        </section>

        {/* Content Sections */}
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Introduction */}
          <section className="mb-12">
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you purchase an airline ticket, the total price typically includes the base fare, 
              government-imposed taxes, and various airline fees. However, additional charges may apply 
              after your ticket has been issued, depending on changes you make or services you request.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              These post-ticketing fees vary significantly based on the airline, route, fare class, 
              and the specific terms and conditions of your ticket. It's important to understand these 
              potential charges before making any changes to your reservation.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Below you'll find detailed information about the types of fees you may encounter and 
              the circumstances under which they apply.
            </p>
          </section>

          {/* Post-Ticketing Fees Section */}
          <section id="post-ticketing" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 pb-2 border-b">
              Post-Ticketing Fees
            </h2>
            
            {/* Ticket Change Fees */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-foreground mb-3">Ticket Change Fees</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                If you need to modify your travel dates, times, or routing after your ticket has been 
                issued, you may be subject to change fees. These fees are charged by the airline and 
                can range from $0 to $500 or more per ticket, depending on:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mb-2">
                <li>The airline's policy</li>
                <li>Your fare class (economy, business, first class)</li>
                <li>Whether your ticket is refundable or non-refundable</li>
                <li>The route (domestic vs. international)</li>
              </ul>
              <p className="text-sm text-muted-foreground italic">
                Note: In addition to the change fee, you may also be required to pay any fare difference 
                if the new flight is more expensive.
              </p>
            </div>

            {/* Cancellation Fees */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-foreground mb-3">Cancellation Fees</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Cancellation fees apply when you decide to cancel your reservation after the ticket 
                has been issued. The amount depends on:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mb-2">
                <li>The fare rules associated with your ticket</li>
                <li>How far in advance you cancel</li>
                <li>Whether you purchased a refundable or non-refundable fare</li>
              </ul>
              <p className="text-sm text-muted-foreground italic">
                Some non-refundable tickets may only provide credit for future travel minus the 
                cancellation fee, while others may have no value upon cancellation.
              </p>
            </div>

            {/* No-Show Fees */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-foreground mb-3">No-Show Fees</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                If you fail to show up for your flight without canceling in advance, airlines typically 
                impose a no-show fee. In many cases, this results in:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mb-2">
                <li>Forfeiture of the entire ticket value</li>
                <li>Automatic cancellation of all remaining segments in your itinerary</li>
                <li>Additional fees to reinstate or rebook your travel</li>
              </ul>
              <p className="text-sm text-muted-foreground italic">
              Always contact the airline or your booking agent if you cannot make your flight to 
              explore available options.
            </p>
          </div>

          {/* Name Correction Fees */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-3">Name Correction Fees</h3>
            <p className="text-muted-foreground leading-relaxed mb-2">
              If there is an error in the passenger name on your ticket, airlines may charge a fee 
              to make corrections. The policy varies significantly:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mb-2">
              <li>Minor spelling corrections may be allowed at no charge</li>
              <li>Name changes (different person) are generally not permitted</li>
              <li>Some airlines charge a flat fee for any name correction</li>
              <li>International tickets may have stricter name policies</li>
            </ul>
            <p className="text-sm text-muted-foreground italic">
              Fees vary by airline and fare rules. Always verify the name exactly as it appears 
              on your government-issued ID before completing your booking.
            </p>
            </div>

            {/* Seat Selection Fees */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-foreground mb-3">Seat Selection Fees</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Many airlines now charge fees for advance seat selection, especially for preferred 
                seats such as:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mb-2">
                <li>Exit row seats with extra legroom</li>
                <li>Bulkhead seats</li>
                <li>Window or aisle seats in premium economy</li>
                <li>Seats near the front of the cabin</li>
              </ul>
              <p className="text-sm text-muted-foreground italic">
                Fees vary by airline and fare rules. These charges may be applied at the time of 
                booking or during online check-in.
              </p>
            </div>

            {/* Baggage Fees */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-foreground mb-3">Baggage Fees</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Most airlines charge for checked baggage, and fees can apply for:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mb-2">
                <li>First checked bag (on many carriers)</li>
                <li>Second and additional checked bags</li>
                <li>Overweight or oversized baggage</li>
                <li>Sports equipment and special items</li>
              </ul>
              <p className="text-sm text-muted-foreground italic">
                Baggage fees vary by airline and route. Pre-paying for baggage online is often 
                cheaper than paying at the airport.
              </p>
            </div>

            {/* Airline-Imposed Penalties */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-foreground mb-3">Airline-Imposed Penalties</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Each airline has its own set of rules and penalties that may apply to your booking. 
                These can include:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mb-2">
                <li>Reissue fees for ticket modifications</li>
                <li>Administrative charges for processing requests</li>
                <li>Penalties for fare rule violations</li>
                <li>Charges for missed connections due to passenger delays</li>
              </ul>
              <p className="text-sm text-muted-foreground italic">
                Fees vary by airline and fare rules. We strongly recommend reviewing your specific 
                airline's policies before making any changes to your reservation.
              </p>
            </div>
          </section>

          {/* Taxes & Government Fees */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 pb-2 border-b">
              Taxes & Government Fees
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Your airline ticket includes various government-imposed taxes and fees that are collected 
              on behalf of federal, state, and local authorities. These typically include:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
              <li><strong>Airport Taxes:</strong> Fees charged by airports for facility use and maintenance</li>
              <li><strong>Security Fees:</strong> Charges that fund airport security operations (e.g., TSA fees in the US)</li>
              <li><strong>International Departure/Arrival Taxes:</strong> Fees imposed by countries for international travel</li>
              <li><strong>Customs and Immigration Fees:</strong> Charges for processing international passengers</li>
              <li><strong>Passenger Facility Charges (PFC):</strong> Fees used for airport improvements</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Important:</strong> Government taxes and fees are generally non-refundable in most 
              cases, as they are collected by ChyeapFlights on behalf of the relevant authorities and 
              remitted accordingly.
            </p>
          </section>

          {/* Service Fees */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 pb-2 border-b">
              Service Fees (Agency Fees)
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              ChyeapFlights charges service fees for processing your booking and providing customer 
              support. These fees are separate from airline charges and government taxes.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
              <li>Service fees are charged per passenger or per transaction</li>
              <li>These fees are non-refundable once the booking is confirmed</li>
              <li>Additional service fees may apply for changes or cancellations processed through our platform</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Understanding the difference:</strong> Airline fees are set and collected by the 
              airline, while agency service fees are charged by ChyeapFlights for facilitating your 
              booking. Both may apply depending on the action taken on your reservation.
            </p>
          </section>

          {/* Refunds & Chargebacks */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 pb-2 border-b">
              Refunds & Chargebacks
            </h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">Refund Eligibility</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Refund eligibility depends on several factors:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>The type of ticket purchased (refundable vs. non-refundable)</li>
                <li>The airline's specific refund policies</li>
                <li>Whether the cancellation qualifies for an exception (medical emergency, airline cancellation, etc.)</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">Processing Timelines</h3>
              <p className="text-muted-foreground leading-relaxed">
                Refunds typically take 7-14 business days to process, though this can vary. Credit card 
                refunds may take an additional billing cycle to appear on your statement. Airline-initiated 
                refunds may take longer and are subject to the airline's processing times.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">Partial Refunds</h3>
              <p className="text-muted-foreground leading-relaxed">
                In some cases, you may be eligible for a partial refund minus applicable fees. This 
                typically occurs when cancellation fees or penalties reduce the refundable amount.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">Airline Approval Dependency</h3>
              <p className="text-muted-foreground leading-relaxed">
                All refund requests are subject to airline approval. ChyeapFlights acts as an intermediary 
                and cannot guarantee refund approval. The final decision rests with the airline based on 
                their fare rules and policies.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Chargeback Consequences</h3>
              <p className="text-muted-foreground leading-relaxed">
                Filing a chargeback with your credit card company instead of working through proper 
                refund channels can result in:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
                <li>Automatic cancellation of your booking by the airline</li>
                <li>Being placed on a no-fly list with certain carriers</li>
                <li>Difficulty booking future travel</li>
                <li>Additional fees and penalties</li>
              </ul>
            </div>
          </section>

          {/* Important Disclaimers */}
          <section className="mb-12">
            <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <AlertDescription className="text-foreground">
                <h3 className="font-semibold text-lg mb-3">Important Disclaimers</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• All fees and charges are subject to change without prior notice</li>
                  <li>• Airlines control all fare rules, and ChyeapFlights has no authority to modify them</li>
                  <li>• ChyeapFlights acts solely as a booking intermediary between you and the airline</li>
                  <li>• Customers are responsible for reviewing fare rules and conditions before completing a purchase</li>
                  <li>• The information provided on this page is for general guidance only and may not reflect the most current policies</li>
                </ul>
              </AlertDescription>
            </Alert>
          </section>

          {/* Contact & Support CTA */}
          <section className="text-center py-8 px-6 bg-muted/30 rounded-lg">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Need Help Understanding Fees?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Our support team is available to help clarify any questions about taxes, fees, 
              or charges related to your booking.
            </p>
            <Button asChild size="lg">
              <Link to="/support">
                <Phone className="mr-2 h-4 w-4" />
                Contact Support
              </Link>
            </Button>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TaxesFees;
