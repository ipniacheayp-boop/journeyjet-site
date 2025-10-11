import { useEffect } from "react";

const ErrorPage = () => {
  useEffect(() => {
    document.title = "Agent Support - Travel Booking";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-foreground mb-8">
          Our agent will call you soon.
        </h1>
        
        <div className="space-y-2 text-muted-foreground">
          <p className="text-sm">
            Email:{" "}
            <a 
              href="mailto:support@travelbooking.com" 
              className="text-primary hover:underline"
            >
              support@travelbooking.com
            </a>
          </p>
          <p className="text-sm">
            Phone:{" "}
            <a 
              href="tel:+18001234567" 
              className="text-primary hover:underline"
            >
              +1 800 123 4567
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
