import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';

const SITE_ORIGIN = "https://tripile.com";
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-image.png`;

/** Ensure share images work on Facebook, LinkedIn, Twitter (absolute HTTPS URL). */
function resolveAbsoluteImageUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${SITE_ORIGIN}${path}`;
}

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  /** Absolute HTTPS URL; if omitted, derived from the current path (avoids homepage canonical on inner pages). */
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
}

const SEOHead = ({
  title = "Tripile.com – Buy Cheap Flights, Hotels & Car Rentals | Best US Travel Deals",
  description =
    "Buy cheap flights, hotels & car rentals across the USA on Tripile.com. Compare 500+ airlines, get Price Match Guarantee, and save up to 46%. Trusted by 2M+ travelers.",
  keywords = "cheap flights USA, flight deals, book flights online, US travel deals, last-minute flights, discounted airline tickets, cheap hotels, car rentals USA, travel booking, airfare deals",
  canonicalUrl,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  noIndex = false
}: SEOHeadProps) => {
  const location = useLocation();
  const pathOnly = location.pathname.replace(/\/$/, "") || "/";
  const pathCanonical = pathOnly === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${pathOnly}`;
  const resolvedCanonical = canonicalUrl ?? pathCanonical;

  const absoluteOgImage = resolveAbsoluteImageUrl(ogImage);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://tripile.com/#organization",
        "name": "Tripile.com",
        "url": "https://tripile.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://tripile.com/og-image.png"
        },
        "sameAs": [
          "https://facebook.com/tripile",
          "https://twitter.com/tripile",
          "https://instagram.com/tripile"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+1-800-963-4330",
          "contactType": "customer service",
          "areaServed": "US",
          "availableLanguage": ["English", "Spanish"]
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://tripile.com/#website",
        "url": "https://tripile.com",
        "name": "Tripile.com",
        "description": description,
        "publisher": {
          "@id": "https://tripile.com/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://tripile.com/search-results?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Tripile.com" />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      <link rel="canonical" href={resolvedCanonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={resolvedCanonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteOgImage} />
      <meta property="og:image:secure_url" content={absoluteOgImage} />
      <meta property="og:site_name" content="Tripile.com" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteOgImage} />
      <meta name="twitter:site" content="@tripile" />
      <meta name="twitter:creator" content="@tripile" />

      {/* Additional SEO Tags */}
      <meta name="geo.region" content="US" />
      <meta name="geo.placename" content="United States" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="1 days" />
      <meta name="rating" content="general" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEOHead;
