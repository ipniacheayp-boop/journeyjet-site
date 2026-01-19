52import { useState } from "react";
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
    { icon: Plane, title: "Check Booking Status", color: "from-support-sky to-blue-500" },
    { icon: FileText, title: "View / Email / Print Itinerary", color: "from-support-sunrise to-yellow-400" },
    { icon: DollarSign, title: "Refund Status", color: "from-support-green to-teal-500" },
    { icon: Ticket, title: "Check-in / Boarding Pass", color: "from-purple-500 to-pink-500" },
    { icon: RefreshCw, title: "Change Your Trip", color: "from-orange-500 to-red-500" },
    { icon: XCircle, title: "Cancel Your Trip", color: "from-red-500 to-rose-600" },
    { icon: Heart, title: "Special Assistance", color: "from-indigo-500 to-purple-600" },
  ];

  const enhanceServices = [
    { icon: Shield, title: "Traveler Protection", description: "Add insurance coverage" },
    { icon: CheckSquare, title: "Web Check-In", description: "Check in online" },
    { icon: Briefcase, title: "Extra Baggage", description: "Add more luggage" },
    { icon: PlusCircle, title: "Add a Seat", description: "Choose your seat" },
    { icon: Hotel, title: "Add Hotel Room", description: "Book accommodation" },
    { icon: Car, title: "Book Car Rental", description: "Rent a vehicle" },
    { icon: Leaf, title: "Plant a Tree", description: "Offset carbon footprint" },
    { icon: Bus, title: "Airport Transfer", description: "Book ground transport" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-poppins">
      <Helmet>
        <title>Customer Support | CheapFlights - 24/7 Travel Assistance</title>
        <meta
          name="description"
          content="Get 24/7 customer support for your travel bookings. Contact CheapFlights for help with flights, hotels, car rentals, refunds, and more."
        />
        <link rel="canonical" href="https://cheapflights.com/support" />
      </Helmet>
      <Header />

      {/* Hero Section */}
      <div
        className="relative h-[400px] bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(0, 0, 0, 0.35), transparent), url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&h=400&fit=crop')",
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <Cloud className="w-12 h-12 mb-4 opacity-60 animate-pulse" />
          <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">Customer Support</h1>
          <p className="text-xl md:text-2xl font-light max-w-2xl drop-shadow-md">
            We're here to help make your journey smooth.
          </p>
        </div>
      </div>

      <main className="flex-1 bg-gradient-to-b from-support-bg-light to-white">
        <div className="container mx-auto px-4 py-16">
          {/* Main Assistance Grid */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-center mb-4 text-foreground">How Can We Assist You?</h2>
            <p className="text-center text-muted-foreground mb-12 text-lg">Select a service below to get started</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {assistanceServices.map((service, index) => (
                <Card
                  key={index}
                  className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-0 overflow-hidden group"
                  onClick={() => handleServiceClick(service.title)}
                >
                  <div className={`h-2 bg-gradient-to-r ${service.color}`} />
                  <CardHeader className="text-center pb-4">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform duration-300 shadow-lg`}
                    >
                      <service.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Enhance Your Booking Section */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-center mb-4 text-foreground">Enhance Your Booking</h2>
            <p className="text-center text-muted-foreground mb-12 text-lg">Add more value to your travel experience</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {enhanceServices.map((service, index) => (
                <Card
                  key={index}
                  className="transition-all duration-300 hover:scale-105 hover:shadow-xl border-0 bg-white"
                >
                  <CardHeader className="text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-support-green to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                      <service.icon className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-base mb-2">{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center pb-6">
                    <Button
                      className="bg-support-green hover:bg-support-green/90 text-white rounded-full px-6"
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
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-2xl border-0 overflow-hidden">
              <div className="h-3 bg-gradient-to-r from-support-sky via-support-sunrise to-support-green" />
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl mb-3">Send Us a Message</CardTitle>
                <CardDescription className="text-base">
                  Fill out the form below and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-base">
                        Your Name
                      </Label>
                      <Input id="name" required className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-base">
                        Email Address
                      </Label>
                      <Input id="email" type="email" required className="h-12 rounded-xl" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-base">
                      Subject
                    </Label>
                    <Input id="subject" required className="h-12 rounded-xl" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-base">
                      Message
                    </Label>
                    <Textarea id="message" rows={6} required className="rounded-xl" />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 text-lg font-semibold rounded-xl shadow-lg"
                    style={{ background: "linear-gradient(135deg, hsl(212 100% 50%), hsl(180 100% 50%))" }}
                  >
                    Send Message
                  </Button>
                </form>

                {/* Contact Info */}
                <div className="mt-8 pt-8 border-t grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-support-sky/10 rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-support-sky" />
                    </div>
                    <p className="text-sm font-medium">Email Support</p>
                    <a href="mailto:help@chyeap.com" className="text-support-sky hover:underline text-sm">
                      help@chyeap.com
                    </a>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-support-green/10 rounded-full flex items-center justify-center">
                      <Phone className="w-6 h-6 text-support-green" />
                    </div>
                    <p className="text-sm font-medium">Call Us</p>
                    <a href="tel:+18002215246" className="text-support-green hover:underline text-sm">
                      +1-800-221-5246
                    </a>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-support-sunrise/10 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-support-sunrise" />
                    </div>
                    <p className="text-sm font-medium">Live Chat</p>
                    <button onClick={() => setShowChat(true)} className="text-support-sunrise hover:underline text-sm">
                      Chat with us instantly
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Contact Form Dialog */}
      <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Get Help with {selectedService}</DialogTitle>
            <DialogDescription>Tell us more about how we can assist you</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="dialog-name">Your Name</Label>
              <Input id="dialog-name" required className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dialog-email">Email Address</Label>
              <Input id="dialog-email" type="email" required className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dialog-message">Message</Label>
              <Textarea id="dialog-message" rows={5} required className="rounded-xl" />
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1 rounded-xl"
                style={{ background: "linear-gradient(135deg, hsl(212 100% 50%), hsl(180 100% 50%))" }}
              >
                Send Message
              </Button>
              <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setShowChat(true)}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Live Chat
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Floating Chat Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-support-sky to-blue-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 z-50 group"
        aria-label="Open chat"
      >
        <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-support-green rounded-full animate-pulse" />

        {/* Tooltip */}
        <span className="absolute bottom-full mb-2 right-0 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
          Chat with us instantly!
        </span>
      </button>

      {showChat && <ChatWindow onClose={() => setShowChat(false)} />}

      <Footer />
    </div>
  );
};

export default Support;
