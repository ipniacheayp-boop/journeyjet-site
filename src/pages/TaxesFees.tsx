import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TaxesFees = () => {
  const feesAndTaxes = [
    {
      name: "Travel Facilities Tax",
      description: "This tax is applicable to specific flights routed to or from Alaska or Hawaii.",
      applicableTo: "U.S. Domestic and International",
      code: "US",
      price: "$9.90"
    },
    {
      name: "U.S. Federal Segment Fee",
      description: "This tax is applicable to flights per segment routed within the United States.",
      applicableTo: "U.S. Domestic and International",
      code: "ZP",
      price: "$4.50"
    },
    {
      name: "U.S. Excise Tax",
      description: "This tax is a small percentage of flights that is applicable to all flights routed within the United States. Also applicable to flights within the Canada/Mexico 225-mile buffer zones.",
      applicableTo: "U.S. Domestic and International",
      code: "US",
      price: "7.50%"
    },
    {
      name: "Passenger Facility Charge (PFC)",
      description: "This facility charge is a variable fee applicable on per itinerary for improvement of passenger facility at the airport.",
      applicableTo: "U.S. Domestic and International",
      code: "XF",
      price: "up to $18.00"
    },
    {
      name: "U.S. Passenger Civil Aviation Security Fee",
      description: "This is a security fee about $5.60 per one way based on the total number of passengers boarding the flight.",
      applicableTo: "U.S. Domestic and International",
      code: "AY",
      price: "$11.20"
    },
    {
      name: "U.S. International Transportation Tax",
      description: "This tax is applicable to all flights routed to and from the United States, U.S Virgin Islands or Puerto Rico.",
      applicableTo: "International",
      code: "US",
      price: "$19.70"
    },
    {
      name: "U.S. Animal and Plant Health Inspection Service Fee",
      description: "Applies to all flights originating abroad, except Canada, and landing in the United States, Puerto Rico, or the U.S. Virgin Islands.",
      applicableTo: "International",
      code: "XA",
      price: "$3.83"
    },
    {
      name: "U.S. Immigration and Naturalization Fee",
      description: "Applies to international arrivals to the United States, Puerto Rico, or the U.S. Virgin Islands.",
      applicableTo: "International",
      code: "XY",
      price: "$7.00"
    },
    {
      name: "U.S. Customs User Fee",
      description: "This fee is applicable to all international flights routed outside the customs territory.",
      applicableTo: "International",
      code: "YC",
      price: "$6.52"
    },
    {
      name: "International Taxes and Government or Airport-imposed fees",
      description: "This fee is applicable to cover the cost of inspection fees, security fees and various other taxes levied according to international norms.",
      applicableTo: "International",
      code: "Varies",
      price: "up to $349.00*"
    },
    {
      name: "Our Service Fees ‡",
      description: "Online Air Transaction Services Fees - Depending on the cabin type, trip type and certain other factors, a service fee of up to $100.00 is charged per person for all passenger types**",
      applicableTo: "U.S. Domestic and International",
      code: "Fees",
      price: "$0.00 to $100.00*"
    }
  ];

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
        <section className="bg-primary/5 border-b">
          <div className="container mx-auto px-4 py-8">
            <nav className="text-sm text-muted-foreground mb-4">
              <Link to="/" className="hover:text-primary">Home</Link>
              <span className="mx-2">&gt;</span>
              <span className="text-foreground">Taxes & Fees</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Taxes & Fees</h1>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Description of Fees & Taxes */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Description of Fees & Taxes</h2>
            
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/10">
                    <TableHead className="font-bold text-foreground min-w-[200px]">Description</TableHead>
                    <TableHead className="font-bold text-foreground min-w-[180px]">Applicable to</TableHead>
                    <TableHead className="font-bold text-foreground text-center">Code</TableHead>
                    <TableHead className="font-bold text-foreground text-right min-w-[120px]">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feesAndTaxes.map((fee, index) => (
                    <TableRow key={index} className={index % 2 === 0 ? "bg-muted/30" : ""}>
                      <TableCell>
                        <div className="font-semibold text-foreground mb-1">{fee.name}</div>
                        <div className="text-sm text-muted-foreground">{fee.description}</div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{fee.applicableTo}</TableCell>
                      <TableCell className="text-center font-mono">{fee.code}</TableCell>
                      <TableCell className="text-right font-semibold">{fee.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Disclaimers */}
            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              <p>* Approximate amount</p>
              <p>** Passenger types = Adult, child, senior, infant, student, military.</p>
              <p>‡ All transaction service fees are non-refundable and are subject to change without notice.</p>
              <p>Government imposed taxes and fees are subject to change without prior notice.</p>
              <p>Service fees will be converted in to your local currency.</p>
            </div>

            <ul className="mt-6 space-y-3 text-sm text-muted-foreground list-disc list-inside">
              <li>Trips where you visit multiple cities and return home/city of origin from the city you visited last - Up to $100.00 chargeable per passenger as service fee irrespective of the passenger type ticket.</li>
              <li>Multi airline trips / Cities with staggering rate of frauds - Up to $50.00 chargeable per passenger as service fee irrespective of the passenger type ticket.</li>
              <li>For certain airlines, a service fee of up to $40.00 per passenger can be charged.</li>
              <li>Nearby Airport & Alternative Date - Up to $50.00 chargeable per passenger as service fee.</li>
              <li>Fusion Fares - Up to $100.00 chargeable per passenger as service fee.</li>
              <li>Service fees on bookings made through customer care center - For bookings made through customer care center including round-the-world as well as complex multi-stop itineraries, the service fee chargeable may be higher than the one applicable when the bookings are made online. This service fee is between $10.00 and $200.00. Senior citizens are charged up to only $100.00. Premium package benefits are included in Contact Center bookings.</li>
            </ul>

            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                <strong>NOTE:</strong> All services fees are subject to change without notice. YOU WILL BE CHARGED THE FINAL TOTAL PRICE AS QUOTED REGARDLESS OF ANY CHANGES OR VARIANCE IN THE FEES. Kindly review the total final price carefully.
              </p>
            </div>
          </section>

          {/* Post-Ticketing Service Fees */}
          <section id="post-ticketing" className="mb-12 scroll-mt-20">
            <h2 className="text-2xl font-bold text-foreground mb-6">Post-Ticketing Service Fees ‡‡</h2>

            {/* Cancellation & Refund Within 4 hrs */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">Cancellation & Refund (Within 4 hrs)</h3>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/10">
                      <TableHead className="font-bold text-foreground">Service Type</TableHead>
                      <TableHead className="font-bold text-foreground text-right">Fee</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Agent Assisted Cancellation</TableCell>
                      <TableCell className="text-right font-semibold">Flat $25.00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Cancellation & Refund Within 4-24 hrs */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">Cancellation & Refund (Within 4-24 hrs)</h3>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/10">
                      <TableHead className="font-bold text-foreground">Ticket Cost</TableHead>
                      <TableHead className="font-bold text-foreground text-right">Fee</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="bg-muted/30">
                      <TableCell>$300.00</TableCell>
                      <TableCell className="text-right font-semibold">$25.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>$301.00 - $400.00</TableCell>
                      <TableCell className="text-right font-semibold">$35.00</TableCell>
                    </TableRow>
                    <TableRow className="bg-muted/30">
                      <TableCell>$401.00 - $500.00</TableCell>
                      <TableCell className="text-right font-semibold">$50.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>$501.00 - $750.00</TableCell>
                      <TableCell className="text-right font-semibold">$75.00</TableCell>
                    </TableRow>
                    <TableRow className="bg-muted/30">
                      <TableCell>Above $750.00</TableCell>
                      <TableCell className="text-right font-semibold">10% of Gross Ticket Amount</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Cancellation Beyond 24 hrs */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">Cancellation (beyond 24 hrs)</h3>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/10">
                      <TableHead className="font-bold text-foreground">Class</TableHead>
                      <TableHead className="font-bold text-foreground text-center">Domestic</TableHead>
                      <TableHead className="font-bold text-foreground text-center">International</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="bg-muted/30">
                      <TableCell className="font-medium">Air - Economy</TableCell>
                      <TableCell className="text-center font-semibold">$40.00</TableCell>
                      <TableCell className="text-center font-semibold">$40.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Air - Business/First</TableCell>
                      <TableCell className="text-center font-semibold">$75.00</TableCell>
                      <TableCell className="text-center font-semibold">$100.00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Refund Beyond 24 hrs */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">Refund (beyond 24 hrs)</h3>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/10">
                      <TableHead className="font-bold text-foreground">Class</TableHead>
                      <TableHead className="font-bold text-foreground text-center">Domestic</TableHead>
                      <TableHead className="font-bold text-foreground text-center">International</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="bg-muted/30">
                      <TableCell className="font-medium">Air - Economy</TableCell>
                      <TableCell className="text-center font-semibold">$100.00</TableCell>
                      <TableCell className="text-center font-semibold">$200.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Air - Business/First</TableCell>
                      <TableCell className="text-center font-semibold">$200.00</TableCell>
                      <TableCell className="text-center font-semibold">$200.00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Changes to Existing Tickets */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">Changes to Existing Tickets (Exchange)</h3>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/10">
                      <TableHead className="font-bold text-foreground">Timeframe</TableHead>
                      <TableHead className="font-bold text-foreground">Class</TableHead>
                      <TableHead className="font-bold text-foreground text-center">Domestic</TableHead>
                      <TableHead className="font-bold text-foreground text-center">International</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="bg-muted/30">
                      <TableCell rowSpan={2} className="font-medium align-middle">Within 10 days</TableCell>
                      <TableCell>Economy</TableCell>
                      <TableCell className="text-center font-semibold">$125.00</TableCell>
                      <TableCell className="text-center font-semibold">$200.00</TableCell>
                    </TableRow>
                    <TableRow className="bg-muted/30">
                      <TableCell>Business/First</TableCell>
                      <TableCell className="text-center font-semibold">$200.00</TableCell>
                      <TableCell className="text-center font-semibold">$200.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell rowSpan={2} className="font-medium align-middle">Beyond 10 days</TableCell>
                      <TableCell>Economy</TableCell>
                      <TableCell className="text-center font-semibold">$75.00</TableCell>
                      <TableCell className="text-center font-semibold">$175.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Business/First</TableCell>
                      <TableCell className="text-center font-semibold">$175.00</TableCell>
                      <TableCell className="text-center font-semibold">$175.00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Special Services - Agent Assisted Waivers */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">Special Services</h3>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/10">
                      <TableHead className="font-bold text-foreground">Service</TableHead>
                      <TableHead className="font-bold text-foreground">Class</TableHead>
                      <TableHead className="font-bold text-foreground text-center">Domestic</TableHead>
                      <TableHead className="font-bold text-foreground text-center">International</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="bg-muted/30">
                      <TableCell rowSpan={2} className="font-medium align-middle">Agent Assisted Waivers</TableCell>
                      <TableCell>Economy</TableCell>
                      <TableCell className="text-center font-semibold">$50.00</TableCell>
                      <TableCell className="text-center font-semibold">$75.00</TableCell>
                    </TableRow>
                    <TableRow className="bg-muted/30">
                      <TableCell>Business/First</TableCell>
                      <TableCell className="text-center font-semibold">$100.00</TableCell>
                      <TableCell className="text-center font-semibold">$150.00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Special Services List */}
            <div className="mb-8 p-6 bg-muted/30 rounded-lg border">
              <h4 className="font-semibold text-foreground mb-4">Fees for Agent Assistance Seeking Refund or Future Airline Credit for Listed Reasons:</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  "Death/Bereavement",
                  "Duplicate booking",
                  "Medical",
                  "Name Change",
                  "Name Correction",
                  "No Show",
                  "Routing Changes",
                  "UNMR",
                  "Visa Issues",
                  "Denied Boarding"
                ].map((reason, index) => (
                  <span key={index} className="px-3 py-1 bg-background border rounded-full text-sm">
                    {reason}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Other Terms & Conditions */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Other Terms & Conditions</h2>
            
            <div className="space-y-4 text-muted-foreground">
              <p>
                <sup>(1)</sup> All post-ticketing service fees mentioned above are per passenger, per transaction, and are in addition to any airline-imposed fees, fare differences, and applicable taxes. These fees are non-refundable regardless of whether the underlying ticket is refundable or not.
              </p>
              <p>
                <sup>(2)</sup> Refund processing times vary based on the original form of payment and airline policies. Credit card refunds typically take 7-14 business days after airline approval. ChyeapFlights is not responsible for delays caused by airlines or financial institutions.
              </p>
              <p>
                The fees listed above are subject to change without prior notice. Airlines reserve the right to modify their own change and cancellation policies at any time. Customers are advised to review the complete fare rules at the time of booking and before requesting any post-ticketing services.
              </p>
              <p>
                ChyeapFlights acts as an intermediary between customers and airlines. We do not control airline policies, schedules, or pricing. Any airline-imposed fees are collected on behalf of the respective carriers and are non-negotiable.
              </p>
              <p>
                For group bookings (10 or more passengers), different fee structures may apply. Please contact our dedicated group travel desk for accurate pricing and policy information.
              </p>
              <p>
                ‡‡ Post-ticketing service fees are charged per passenger per transaction and are in addition to any airline-imposed penalties or fare differences. All fees are non-refundable.
              </p>
            </div>
          </section>

          {/* Contact Support CTA */}
          <section className="text-center py-8 bg-primary/5 rounded-lg">
            <h3 className="text-xl font-semibold text-foreground mb-3">Need help understanding taxes and fees?</h3>
            <p className="text-muted-foreground mb-6">Our support team is available to answer any questions about charges and policies.</p>
            <Button asChild size="lg">
              <Link to="/support">Contact Support</Link>
            </Button>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TaxesFees;
