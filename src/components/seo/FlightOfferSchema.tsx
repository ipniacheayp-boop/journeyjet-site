import { Helmet } from 'react-helmet';

interface FlightOfferSchemaProps {
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  price: number;
  currency?: string;
  airline?: string;
  departureDate?: string;
  returnDate?: string;
}

const FlightOfferSchema = ({
  origin,
  originCode,
  destination,
  destinationCode,
  price,
  currency = "USD",
  airline,
  departureDate,
  returnDate
}: FlightOfferSchemaProps) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `Flight from ${origin} to ${destination}`,
    "description": `Cheap flights from ${origin} (${originCode}) to ${destination} (${destinationCode}). Book now and save on airfare.`,
    "brand": {
      "@type": "Brand",
      "name": airline || "Multiple Airlines"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://chyeap.lovable.app/cheap-flights-from-${origin.toLowerCase().replace(/\s+/g, '-')}-to-${destination.toLowerCase().replace(/\s+/g, '-')}`,
      "priceCurrency": currency,
      "price": price,
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "ChyeapFlights"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.6",
      "reviewCount": "2847",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  // Add flight-specific data if dates are provided
  const flightData = departureDate ? {
    "@context": "https://schema.org",
    "@type": "Flight",
    "departureAirport": {
      "@type": "Airport",
      "name": `${origin} Airport`,
      "iataCode": originCode
    },
    "arrivalAirport": {
      "@type": "Airport",
      "name": `${destination} Airport`,
      "iataCode": destinationCode
    },
    "departureTime": departureDate,
    "provider": {
      "@type": "Organization",
      "name": airline || "Multiple Airlines"
    },
    "offers": {
      "@type": "Offer",
      "price": price,
      "priceCurrency": currency
    }
  } : null;

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      {flightData && (
        <script type="application/ld+json">
          {JSON.stringify(flightData)}
        </script>
      )}
    </Helmet>
  );
};

export default FlightOfferSchema;
