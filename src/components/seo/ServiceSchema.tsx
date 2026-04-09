import { Helmet } from 'react-helmet';

interface ServiceSchemaProps {
  name: string;
  description: string;
  url: string;
  provider?: string;
  areaServed?: string;
  serviceType?: string;
}

const ServiceSchema = ({
  name,
  description,
  url,
  provider = "Tripile.com",
  areaServed = "US",
  serviceType = "Travel Booking",
}: ServiceSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": name,
    "description": description,
    "url": url,
    "serviceType": serviceType,
    "provider": {
      "@type": "Organization",
      "name": provider,
      "url": "https://tripile.com",
    },
    "areaServed": {
      "@type": "Country",
      "name": areaServed,
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default ServiceSchema;
