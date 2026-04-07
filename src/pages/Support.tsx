import { useState } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWindow from "@/components/ChatWindow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Plane,
  FileText,
  DollarSign,
  Ticket,
  RefreshCw,
  XCircle,
  Heart,
  Shield,
  CheckSquare,
  Briefcase,
  PlusCircle,
  Hotel,
  Car,
  Leaf,
  Bus,
  MessageCircle,
  Phone,
  Mail,
  Cloud,
} from "lucide-react";
import { toast } from "sonner";

const Support = () => {
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [showChat, setShowChat] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setShowContactForm(false);
  };

  const handleServiceClick = (service: string) => {
    setSelectedService(service);
    setShowContactForm(true);
  };

  const assistanceServices = [
    {
      icon: Plane,
      title: "Check Booking Status",
      color: "from-blue-500/20 to-indigo-500/20",
      iconColor: "text-blue-500",
    },
    {
      icon: FileText,
      title: "View / Email / Print Itinerary",
      color: "from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-500",
    },
    {
      icon: DollarSign,
      title: "Refund Status",
      color: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-500",
    },
    {
      icon: Ticket,
      title: "Check-in / Boarding Pass",
      color: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-500",
    },
    {
      icon: RefreshCw,
      title: "Change Your Trip",
      color: "from-orange-500/20 to-red-500/20",
      iconColor: "text-orange-500",
    },
    { icon: XCircle, title: "Cancel Your Trip", color: "from-red-500/20 to-rose-600/20", iconColor: "text-red-500" },
    {
      icon: Heart,
      title: "Special Assistance",
      color: "from-indigo-500/20 to-purple-600/20",
      iconColor: "text-indigo-500",
    },
  ];

  const enhanceServices = [
    {
      icon: Shield,
      title: "Traveler Protection",
      description: "Add insurance coverage",
      glow: "hover:border-blue-500/50",
      iconColor: "group-hover:text-blue-500",
    },
    {
      icon: CheckSquare,
      title: "Web Check-In",
      description: "Check in online",
      glow: "hover:border-emerald-500/50",
      iconColor: "group-hover:text-emerald-500",
    },
    {
      icon: Briefcase,
      title: "Extra Baggage",
      description: "Add more luggage",
      glow: "hover:border-amber-500/50",
      iconColor: "group-hover:text-amber-500",
    },
    {
      icon: PlusCircle,
      title: "Add a Seat",
      description: "Choose your seat",
      glow: "hover:border-purple-500/50",
      iconColor: "group-hover:text-purple-500",
    },
    {
      icon: Hotel,
      title: "Add Hotel Room",
      description: "Book accommodation",
      glow: "hover:border-pink-500/50",
      iconColor: "group-hover:text-pink-500",
    },
    {
      icon: Car,
      title: "Book Car Rental",
      description: "Rent a vehicle",
      glow: "hover:border-teal-500/50",
      iconColor: "group-hover:text-teal-500",
    },
    {
      icon: Leaf,
      title: "Plant a Tree",
      description: "Offset carbon footprint",
      glow: "hover:border-green-500/50",
      iconColor: "group-hover:text-green-500",
    },
    {
      icon: Bus,
      title: "Airport Transfer",
      description: "Book ground transport",
      glow: "hover:border-orange-500/50",
      iconColor: "group-hover:text-orange-500",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col font-poppins bg-background text-foreground transition-colors duration-300">
      <Helmet>
        <title>Customer Support | Tripile.com - 24/7 Travel Assistance</title>
        <meta
          name="description"
          content="Get 24/7 customer support for your travel bookings. Contact Tripile.com for help with flights, hotels, car rentals, refunds, cancellations, and more."
        />
        <meta name="keywords" content="Tripile support, travel help, flight booking support, 24/7 travel assistance, refund help, booking cancellation" />
        <link rel="canonical" href="https://tripile.com/support" />
        <meta property="og:title" content="Customer Support | Tripile.com - 24/7 Travel Assistance" />
        <meta property="og:description" content="Get 24/7 customer support for your travel bookings with Tripile.com." />
        <meta property="og:url" content="https://tripile.com/support" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Tripile Customer Support",
            "url": "https://tripile.com/support",
            "description": "24/7 customer support for travel bookings, refunds, cancellations, and more.",
            "mainEntity": {
              "@type": "Organization",
              "name": "Tripile.com",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-800-963-4330",
                "contactType": "customer service",
                "areaServed": "US",
                "availableLanguage": ["English", "Spanish"]
              }
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://tripile.com/" },
                { "@type": "ListItem", "position": 2, "name": "Support", "item": "https://tripile.com/support" }
              ]
            }
          })}
        </script>
      </Helmet>
      <Header />

      {/* Hero Section */}
      <div
        className="relative h-[450px] bg-cover bg-center border-b border-border"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&h=450&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
          <div className="inline-flex items-center justify-center p-3 bg-card/50 backdrop-blur-md rounded-full mb-6 border border-border shadow-2xl">
            <Cloud className="w-8 h-8 text-blue-500 animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-foreground drop-shadow-sm">
            Customer{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">Support</span>
          </h1>
          <p className="text-xl md:text-2xl font-light max-w-2xl text-muted-foreground drop-shadow-sm">
            We're here to help make your journey smooth.
          </p>
        </div>
      </div>

      <main className="flex-1 relative z-20 -mt-10">
        <div className="container mx-auto px-4 pb-24">
          {/* Main Assistance Grid */}
          <div className="mb-24">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground tracking-tight">
                How Can We Assist You?
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-2xl mx-auto">
                Select a service below to get started and we'll guide you through the process
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {assistanceServices.map((service, index) => (
                <Card
                  key={index}
                  className="cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-xl border-border bg-card/50 backdrop-blur-xl overflow-hidden group"
                  onClick={() => handleServiceClick(service.title)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardHeader className="text-center pb-8 pt-8 relative z-10">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mx-auto mb-5 border border-border group-hover:scale-110 transition-transform duration-500 shadow-sm`}
                    >
                      <service.icon className={`w-8 h-8 ${service.iconColor} drop-shadow-sm`} />
                    </div>
                    <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Enhance Your Booking Section */}
          <div className="mb-24">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground tracking-tight">
                Enhance Your Booking
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-2xl mx-auto">
                Add more value and comfort to your travel experience
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {enhanceServices.map((service, index) => (
                <Card
                  key={index}
                  className={`transition-all duration-500 border-border bg-card/50 backdrop-blur-md group ${service.glow}`}
                >
                  <CardHeader className="text-center pt-8">
                    <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:border-primary/50 transition-colors shadow-sm">
                      <service.icon
                        className={`w-7 h-7 text-muted-foreground ${service.iconColor} transition-colors duration-500`}
                      />
                    </div>
                    <CardTitle className="text-lg font-semibold text-foreground mb-2">{service.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center pb-8">
                    <Button
                      variant="outline"
                      className="rounded-full px-8 bg-transparent border-border text-muted-foreground hover:bg-foreground hover:text-background transition-all hover:scale-105"
                      onClick={() => toast.info(`${service.title} feature coming soon!`)}
                    >
                      Add
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="max-w-5xl mx-auto">
            <Card className="border-border bg-card/80 backdrop-blur-2xl shadow-xl overflow-hidden rounded-3xl">
              <div className="grid lg:grid-cols-5 gap-0">
                {/* Contact Form Side */}
                <div className="lg:col-span-3 p-6 sm:p-8 md:p-12">
                  <h3 className="text-3xl font-bold mb-3 text-foreground">Send Us a Message</h3>
                  <p className="text-muted-foreground mb-8 font-medium">
                    Fill out the form below and our support team will get back to you within 24 hours.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="name" className="text-sm font-semibold text-foreground text-left block">
                          Your Name
                        </Label>
                        <Input
                          id="name"
                          required
                          className="h-12 rounded-xl bg-background border-border focus-visible:ring-primary text-foreground"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-sm font-semibold text-foreground text-left block">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          className="h-12 rounded-xl bg-background border-border focus-visible:ring-primary text-foreground"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="subject" className="text-sm font-semibold text-foreground text-left block">
                        Subject
                      </Label>
                      <Input
                        id="subject"
                        required
                        className="h-12 rounded-xl bg-background border-border focus-visible:ring-primary text-foreground"
                        placeholder="How can we help?"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="message" className="text-sm font-semibold text-foreground text-left block">
                        Message
                      </Label>
                      <Textarea
                        id="message"
                        rows={5}
                        required
                        className="rounded-xl bg-background border-border focus-visible:ring-primary text-foreground resize-none"
                        placeholder="Please describe your issue in detail..."
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-14 text-lg font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.02] text-white bg-blue-600 hover:bg-blue-500"
                    >
                      Send Message
                    </Button>
                  </form>
                </div>

                {/* Contact Info Side */}
                <div className="lg:col-span-2 bg-muted/50 p-8 md:p-12 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-border relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />

                  <h3 className="text-2xl font-bold mb-8 text-foreground relative z-10">Get In Touch</h3>

                  <div className="space-y-8 relative z-10 text-left">
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 shrink-0">
                        <Mail className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Email Support</p>
                        <a
                          href="mailto:Support@Tripile.com"
                          className="text-foreground hover:text-blue-500 font-semibold transition-colors break-all"
                        >
                          Support@Tripile.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 shrink-0">
                        <Phone className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Call Us (24/7)</p>
                        <a
                          href="tel:+18009634330"
                          className="text-foreground hover:text-emerald-500 font-semibold transition-colors"
                        >
                          +1-800-963-4330
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20 shrink-0">
                        <MessageCircle className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Live Chat</p>
                        <button
                          onClick={() => setShowChat(true)}
                          className="text-foreground hover:text-amber-500 font-semibold transition-colors"
                        >
                          Chat with us instantly
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Contact Form Dialog */}
      <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl bg-card border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">Help with {selectedService}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Tell us more about how we can assist you with this specific request.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 mt-4 text-left">
            <div className="space-y-2">
              <Label htmlFor="dialog-name" className="text-foreground">
                Your Name
              </Label>
              <Input id="dialog-name" required className="rounded-xl h-12 bg-background border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dialog-email" className="text-foreground">
                Email Address
              </Label>
              <Input id="dialog-email" type="email" required className="rounded-xl h-12 bg-background border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dialog-message" className="text-foreground">
                Message
              </Label>
              <Textarea
                id="dialog-message"
                rows={5}
                required
                className="rounded-xl bg-background border-border resize-none"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="submit"
                className="flex-1 rounded-xl h-12 text-white bg-blue-600 hover:bg-blue-500 shadow-md"
              >
                Send Message
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl h-12 bg-transparent border-border text-foreground hover:bg-muted"
                onClick={() => {
                  setShowContactForm(false);
                  setShowChat(true);
                }}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Live Chat instead
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Floating Chat Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 hover:bg-blue-500 transition-all duration-300 z-50 group"
        aria-label="Open chat"
      >
        <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-pulse border-2 border-background" />

        {/* Tooltip */}
        <span className="absolute bottom-full mb-3 right-0 bg-popover text-popover-foreground font-semibold text-sm px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none">
          Chat with us instantly!
        </span>
      </button>

      {showChat && <ChatWindow onClose={() => setShowChat(false)} />}

      <Footer />
    </div>
  );
};

export default Support;
