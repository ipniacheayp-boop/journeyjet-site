import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          
          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground mb-4">
                By accessing and using TravelBooking's services, you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Booking and Reservations</h2>
              <p className="text-muted-foreground mb-4">
                All bookings made through our platform are subject to availability and confirmation. Prices displayed 
                are subject to change without notice until payment is completed and confirmed.
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Bookings are confirmed only after successful payment processing</li>
                <li>Prices include all applicable taxes and fees unless stated otherwise</li>
                <li>Special requests are subject to availability and cannot be guaranteed</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Payment Terms</h2>
              <p className="text-muted-foreground mb-4">
                We accept major credit cards, debit cards, and other payment methods as indicated on our platform. 
                All payments must be made in full at the time of booking unless otherwise specified.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Cancellation and Refund Policy</h2>
              <p className="text-muted-foreground mb-4">
                Cancellation and refund policies vary depending on the service provider and type of booking:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Free cancellation within 24 hours of booking for most flights</li>
                <li>Refunds are processed according to the airline's or service provider's policy</li>
                <li>Cancellation fees may apply after the free cancellation period</li>
                <li>Non-refundable bookings cannot be cancelled for a refund</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Changes and Modifications</h2>
              <p className="text-muted-foreground mb-4">
                Changes to bookings are subject to availability and may incur additional fees. Contact our support 
                team for assistance with modifications to your reservation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. User Responsibilities</h2>
              <p className="text-muted-foreground mb-4">
                Users are responsible for:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Providing accurate and complete information</li>
                <li>Maintaining the security of their account credentials</li>
                <li>Complying with all applicable laws and regulations</li>
                <li>Ensuring valid travel documents (passport, visa, etc.)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-4">
                TravelBooking acts as an intermediary between travelers and service providers. We are not liable for 
                any delays, cancellations, or quality of services provided by airlines, hotels, or other third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Privacy and Data Protection</h2>
              <p className="text-muted-foreground mb-4">
                We are committed to protecting your privacy. Please refer to our Privacy Policy for information on 
                how we collect, use, and protect your personal data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Intellectual Property</h2>
              <p className="text-muted-foreground mb-4">
                All content on this website, including text, graphics, logos, and images, is the property of 
                TravelBooking or its content suppliers and is protected by copyright laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Changes to Terms</h2>
              <p className="text-muted-foreground mb-4">
                We reserve the right to modify these terms at any time. Continued use of our services after changes 
                constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">11. Contact Information</h2>
              <p className="text-muted-foreground mb-4">
                For questions about these Terms of Service, please contact us at:
              </p>
              <div className="text-muted-foreground">
                <p>Email: legal@travelbooking.com</p>
                <p>Phone: 1-800-123-4567</p>
                <p>Address: 123 Travel Street, Suite 100, City, State 12345</p>
              </div>
            </section>

            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Last Updated: October 7, 2025
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
