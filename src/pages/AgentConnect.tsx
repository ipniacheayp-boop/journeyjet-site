import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Home, Headset } from "lucide-react";

const AgentConnect = () => {
  const contactNumber = "+919876543210";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16 flex items-center justify-center animate-fade-in">
        <Card className="w-full max-w-lg mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Headset className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-3xl mb-2">Our Travel Agent Will Connect With You Shortly</CardTitle>
            <p className="text-muted-foreground text-lg">
              We've received your request. One of our representatives will contact you soon.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-secondary/50 p-6 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">Official Contact Number</p>
              <a 
                href={`tel:${contactNumber}`}
                className="text-3xl font-bold text-primary hover:underline flex items-center justify-center gap-2"
              >
                <Phone className="w-6 h-6" />
                +91 98765 43210
              </a>
            </div>
            
            <div className="flex flex-col gap-3">
              <a href={`tel:${contactNumber}`} className="w-full">
                <Button className="w-full" size="lg">
                  <Phone className="mr-2 h-5 w-5" />
                  Call Now
                </Button>
              </a>
              <Link to="/" className="w-full">
                <Button variant="outline" className="w-full" size="lg">
                  <Home className="mr-2 h-5 w-5" />
                  Back to Home
                </Button>
              </Link>
            </div>

            <div className="text-center text-sm text-muted-foreground pt-4 border-t">
              <p>Our agents are available 24/7 to assist you with your travel needs.</p>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default AgentConnect;
