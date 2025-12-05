import { Helmet } from 'react-helmet';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
}

const SEOHead = ({
  title = "CheapFlights – Book Cheap Flights, Hotels & Car Rentals in the USA",
  description = "CheapFlights helps you find the best flight deals, hotel discounts, and car rentals across the USA. Compare thousands of fares instantly and save big on your next trip.",
  keywords = "cheap flights USA, flight deals, book flights online, US travel deals, last-minute flights, discounted airline tickets, cheap hotels, car rentals USA, travel booking, airfare deals",
  canonicalUrl = "https://cheapflights.com",
  ogImage = "/og-image.png",
  ogType = "website",
  noIndex = false
}: SEOHeadProps) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://cheapflights.com/#organization",
        "name": "CheapFlights",
        "url": "https://cheapflights.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://cheapflights.com/logo.png"
        },
        "sameAs": [
          "https://facebook.com/cheapflights",
          "https://twitter.com/cheapflights",
          "https://instagram.com/cheapflights"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+1-800-123-4567",
          "contactType": "customer service",
          "areaServed": "US",
          "availableLanguage": ["English", "Spanish"]
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://cheapflights.com/#website",
        "url": "https://cheapflights.com",
        "name": "CheapFlights",
        "description": description,
        "publisher": {
          "@id": "https://cheapflights.com/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://cheapflights.com/search-results?q={search_term_string}"
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
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="CheapFlights" />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="CheapFlights" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@cheapflights" />

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
