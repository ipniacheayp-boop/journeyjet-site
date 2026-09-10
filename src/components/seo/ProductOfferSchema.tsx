import { Helmet } from 'react-helmet';

interface ProductOfferSchemaProps {
  name: string;
  description: string;
  url: string;
  image?: string;
  price: number;
  priceCurrency?: string;
  availability?: string;
  seller?: string;
  validFrom?: string;
  validThrough?: string;
  category?: string;
}

const ProductOfferSchema = ({
  name,
  description,
  url,
  image,
  price,
  priceCurrency = "USD",
  availability = "https://schema.org/InStock",
  seller = "Tripile.com",
  validFrom,
  validThrough,
  category = "Flight",
}: ProductOfferSchemaProps) => {
  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description,
    "url": url,
    "category": category,
    "brand": {
      "@type": "Organization",
      "name": seller,
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": priceCurrency,
      "price": price.toFixed(2),
      "availability": availability,
      "seller": {
        "@type": "Organization",
        "name": seller,
      },
      "url": url,
      ...(validFrom && { "validFrom": validFrom }),
      ...(validThrough && { "priceValidUntil": validThrough }),
    },
  };

  if (image) {
    schema.image = image;
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default ProductOfferSchema;
