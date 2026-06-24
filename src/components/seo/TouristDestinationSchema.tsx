import { Helmet } from "react-helmet";

interface TouristDestinationSchemaProps {
  name: string;
  description: string;
  url: string;
  /** ISO country code or country name. */
  country: string;
  image?: string;
  /** Optional list of notable attractions (TouristAttraction names). */
  attractions?: string[];
}

/**
 * Emits schema.org TouristDestination JSON-LD for city & country guide pages.
 * Helps Google understand the page as a destination resource and surfaces
 * rich destination/knowledge-panel features.
 */
const TouristDestinationSchema = ({
  name,
  description,
  url,
  country,
  image = "https://tripile.com/og-image.png",
  attractions = [],
}: TouristDestinationSchemaProps) => {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name,
    description,
    url,
    image,
    address: {
      "@type": "PostalAddress",
      addressCountry: country,
    },
  };

  if (attractions.length > 0) {
    data.includesAttraction = attractions.map((a) => ({
      "@type": "TouristAttraction",
      name: a,
    }));
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
};

export default TouristDestinationSchema;
