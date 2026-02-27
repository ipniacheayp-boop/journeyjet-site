import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Home, Headset } from "lucide-react";

const AgentConnect = () => {
  const contactNumber = "+18009634330";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Header />
      
      <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
        <div className="w-full max-w-2xl mx-4 space-y-6 animate-fade-in">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mb-6 shadow-lg animate-pulse">
                <Headset className="w-14 h-14 text-primary-foreground" />
              </div>
              <CardTitle className="text-4xl mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Our Travel Agent Will Contact You Shortly
              </CardTitle>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Thank you for choosing our services! One of our expert travel agents will reach out to you within the next few minutes.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 rounded-xl border border-primary/20 text-center">
                <p className="text-sm text-muted-foreground mb-3 uppercase tracking-wide">24/7 Support Hotline</p>
                <a 
                  href={`tel:${contactNumber}`}
                  className="text-4xl font-bold text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-3 group"
                >
                  <Phone className="w-8 h-8 group-hover:scale-110 transition-transform" />
                  1-800-963-4330
                </a>
                <p className="text-xs text-muted-foreground mt-3">Tap to call instantly</p>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-3">
                <a href={`tel:${contactNumber}`} className="w-full">
                  <Button className="w-full h-14 text-lg hover-scale" size="lg">
                    <Phone className="mr-2 h-6 w-6" />
                    Call Now
                  </Button>
                </a>
                <Link to="/" className="w-full">
                  <Button variant="outline" className="w-full h-14 text-lg hover-scale" size="lg">
                    <Home className="mr-2 h-6 w-6" />
                    Back to Home
                  </Button>
                </Link>
              </div>

              <div className="bg-secondary/30 p-6 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  What happens next?
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">1.</span>
                    <span>Our agent will call you within 5-10 minutes</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">2.</span>
                    <span>They'll confirm your booking details and preferences</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">3.</span>
                    <span>You'll receive ticket confirmation via email & SMS</span>
                  </li>
                </ul>
              </div>

              <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                <p className="font-medium">Need immediate assistance?</p>
                <p>Our agents are available <span className="text-primary font-semibold">24/7</span> to assist you with your travel needs.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AgentConnect;
