/** JSON-LD for homepage — WebPage + AggregateRating for rich results */
const HomePageSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://tripile.com/#webpage",
        url: "https://tripile.com/",
        name: "Cheap Flights, Hotels & Car Rentals USA | Tripile",
        description:
          "Compare cheap flights, hotels, and car rentals across the United States. Price Match Guarantee, no hidden fees, 24/7 US-based support. Trusted by 50K+ travelers.",
        isPartOf: { "@id": "https://tripile.com/#website" },
        about: { "@id": "https://tripile.com/#organization" },
        inLanguage: "en-US",
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: "https://tripile.com/og-image.png",
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://tripile.com/#website",
        url: "https://tripile.com/",
        name: "Tripile",
        alternateName: "Tripile.com",
        publisher: { "@id": "https://tripile.com/#organization" },
        inLanguage: "en-US",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://tripile.com/flights?originLocationCode={origin}&destinationLocationCode={destination}",
          },
          "query-input": ["required name=origin", "required name=destination"],
        },
      },
      {
        "@type": "Organization",
        "@id": "https://tripile.com/#organization",
        name: "Tripile",
        legalName: "Trivoya Ventures LLC",
        url: "https://tripile.com/",
        logo: "https://tripile.com/favicon-tripile.png",
        description: "US-based online travel agency for flights, hotels, and car rentals.",
        address: {
          "@type": "PostalAddress",
          streetAddress: "5900 Balcones Drive STE 100",
          addressLocality: "Austin",
          addressRegion: "TX",
          postalCode: "78731",
          addressCountry: "US",
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+1-800-963-4330",
          contactType: "customer service",
          areaServed: "US",
          availableLanguage: ["English", "Spanish"],
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.5",
          reviewCount: "56000",
          bestRating: "5",
        },
        sameAs: [
          "https://facebook.com/tripile",
          "https://twitter.com/tripile",
          "https://instagram.com/tripile",
          "https://linkedin.com/company/tripile",
        ],
      },
      {
        "@type": "LodgingBusiness",
        name: "Tripile Hotel Search",
        url: "https://tripile.com/hotels",
        description: "Compare cheap hotels across the USA — from budget stays to luxury resorts in every major city.",
        areaServed: { "@type": "Country", name: "United States" },
        provider: { "@id": "https://tripile.com/#organization" },
      },
    ],
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
};

export default HomePageSchema;
