import { Home, Search, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";

const NotFound = () => {
  return (
    <>
      <SEOHead
        title="404 - Page Not Found | Tripile.com"
        description="The page you are trying to access does not exist. Return to Tripile homepage to continue searching flights, hotels, and car rentals."
        canonicalUrl="https://tripile.com/404"
        noIndex
      />
      <main className="min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-b from-muted/50 to-background px-4">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Error 404</p>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Page not found</h1>
        <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-xl">
          The link may be outdated or incorrect. You can return home or start a fresh search.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg shadow hover:bg-primary/90 transition"
          >
            <Home className="w-4 h-4" />
            Go Back Home
          </Link>
          <Link
            to="/flights"
            className="inline-flex items-center gap-2 px-6 py-3 border border-border bg-background font-medium rounded-lg hover:bg-muted transition"
          >
            <Search className="w-4 h-4" />
            Start Search
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

export default NotFound;
