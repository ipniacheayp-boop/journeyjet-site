import { AlertTriangle, Home, Phone, Mail, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";

const ErrorPage = () => {
  return (
    <>
      <SEOHead
        title="Something Went Wrong | Tripile.com"
        description="An unexpected error occurred while loading this page. Go back home or try reloading."
        canonicalUrl="https://tripile.com/error"
        noIndex
      />
      <main className="min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-b from-muted/50 to-background px-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" aria-hidden="true" />
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Something went wrong</h1>
        <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-xl">
          We could not load this page right now. Please refresh or return to the homepage.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg shadow hover:bg-primary/90 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 border border-border bg-background font-medium rounded-lg hover:bg-muted transition"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2 text-foreground text-sm">
          <a href="tel:18009634330" className="inline-flex items-center gap-2 hover:underline">
            <Phone className="w-4 h-4 text-primary" />
            1-800-963-4330
          </a>
          <a href="mailto:Support@Tripile.com" className="inline-flex items-center gap-2 hover:underline">
            <Mail className="w-4 h-4 text-primary" />
            Support@Tripile.com
          </a>
        </div>
      </main>
    </>
  );
};

export default ErrorPage;
