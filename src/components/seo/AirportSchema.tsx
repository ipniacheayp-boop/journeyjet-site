import { Helmet } from 'react-helmet';

interface AirportSchemaProps {
  airportName: string;
  airportCode: string;
  cityName: string;
  stateName: string;
  samplePrice: number;
  sampleRoute: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

const AirportSchema = ({
  airportName,
  airportCode,
  cityName,
  stateName,
  samplePrice,
  sampleRoute,
  coordinates,
}: AirportSchemaProps) => {
  // Airport structured data
  const airportData = {
    "@context": "https://schema.org",
    "@type": "Airport",
    "name": airportName,
    "iataCode": airportCode,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": cityName,
      "addressRegion": stateName,
      "addressCountry": "US"
    },
    ...(coordinates && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": coordinates.lat,
        "longitude": coordinates.lng
      }
    })
  };

  // Flight offer structured data
  const flightOfferData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `Flights from ${cityName} (${airportCode})`,
    "description": `Find cheap flights departing from ${airportName} (${airportCode}) in ${cityName}, ${stateName}. Compare prices from multiple airlines.`,
    "brand": {
      "@type": "Brand",
      "name": "CheapFlights"
    },
    "offers": {
      "@type": "AggregateOffer",
      "url": `https://cheapflights.com/cheap-flights-from-${cityName.toLowerCase().replace(/\s+/g, '-')}-${stateName.toLowerCase().substring(0, 2)}-${airportCode.toLowerCase()}`,
      "priceCurrency": "USD",
      "lowPrice": samplePrice,
      "highPrice": samplePrice * 3,
      "offerCount": "50+",
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "CheapFlights"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "1847",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  // Sample flight offer
  const sampleFlightData = {
    "@context": "https://schema.org",
    "@type": "Flight",
    "departureAirport": {
      "@type": "Airport",
      "name": airportName,
      "iataCode": airportCode
    },
    "arrivalAirport": {
      "@type": "Airport",
      "name": `${sampleRoute} Airport`,
      "iataCode": sampleRoute.match(/\(([A-Z]{3})\)/)?.[1] || ""
    },
    "provider": {
      "@type": "Organization",
      "name": "Multiple Airlines"
    },
    "offers": {
      "@type": "Offer",
      "price": samplePrice,
      "priceCurrency": "USD"
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(airportData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(flightOfferData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(sampleFlightData)}
      </script>
    </Helmet>
  );
};

export default AirportSchema;
