import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Phone, Mail, MessageCircle, HelpCircle } from "lucide-react";
import { toast } from "sonner";

const Support = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
  };

  const faqs = [
    {
      question: "How do I book a flight?",
      answer: "Use our search widget on the home page to enter your travel details, compare prices, and select the best deal. Click 'Book Now' to complete your reservation."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and PayPal for secure payments."
    },
    {
      question: "Can I cancel or change my booking?",
      answer: "Yes! You can cancel within 24 hours for a full refund. Changes depend on the airline's policy. Contact our support team for assistance."
    },
    {
      question: "How do I receive my tickets?",
      answer: "E-tickets will be sent to your email immediately after booking confirmation. You can also access them through your account dashboard."
    },
    {
      question: "Do you offer travel insurance?",
      answer: "Yes, we partner with leading insurance providers. You can add travel insurance during the booking process."
    },
    {
      question: "What if my flight is delayed or cancelled?",
      answer: "Contact our 24/7 support team immediately. We'll help you rebook or arrange a refund according to airline policies."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">How Can We Help?</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our support team is here to assist you 24/7 with any questions or concerns
            </p>
          </div>

          {/* Contact Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Call Us</CardTitle>
                <CardDescription>Available 24/7</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <a href="tel:+18001234567" className="text-primary font-semibold hover:underline">
                  1-800-123-4567
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Email Us</CardTitle>
                <CardDescription>Response within 24h</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <a href="mailto:help@chyeap.com" className="text-primary font-semibold hover:underline">
                  help@chyeap.com
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Live Chat</CardTitle>
                <CardDescription>Instant assistance</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button onClick={() => toast.info("Chat feature coming soon!")}>
                  Start Chat
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Send Us a Message
                  </CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4" id="contact">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input id="name" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" rows={6} required />
                    </div>

                    <Button type="submit" className="w-full">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* FAQs */}
            <div id="faq">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <HelpCircle className="w-6 h-6" />
                  Frequently Asked Questions
                </h2>
                <p className="text-muted-foreground">
                  Quick answers to common questions
                </p>
              </div>
              
              <Accordion type="single" collapsible className="space-y-2">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Support;
