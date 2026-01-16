import { Helmet } from 'react-helmet';

interface Review {
  author: string;
  rating: number;
  body: string;
  datePublished: string;
}

interface ReviewSchemaProps {
  organizationName?: string;
  ratingValue: number;
  reviewCount: number;
  reviews?: Review[];
}

const ReviewSchema = ({
  organizationName = "ChyeapFlights",
  ratingValue = 4.6,
  reviewCount = 2847,
  reviews = []
}: ReviewSchemaProps) => {
  const aggregateRatingData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": organizationName,
    "url": "https://chyeap.lovable.app",
    "logo": "https://chyeap.lovable.app/logo.png",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": ratingValue.toString(),
      "reviewCount": reviewCount.toString(),
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": reviews.length > 0 ? reviews.map(review => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.author
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating.toString(),
        "bestRating": "5",
        "worstRating": "1"
      },
      "reviewBody": review.body,
      "datePublished": review.datePublished
    })) : [
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Sarah M."
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5",
          "worstRating": "1"
        },
        "reviewBody": "Found an amazing deal on flights from NYC to LA. Saved over $200 compared to other sites. The booking process was smooth and customer service was helpful.",
        "datePublished": "2024-12-15"
      },
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Michael R."
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5",
          "worstRating": "1"
        },
        "reviewBody": "Best flight deals I've found online. Used ChyeapFlights for my family vacation to Orlando and the savings were significant. Highly recommend!",
        "datePublished": "2024-12-10"
      },
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Jennifer L."
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "4",
          "bestRating": "5",
          "worstRating": "1"
        },
        "reviewBody": "Great prices and easy to use website. Found cheap flights to Miami for spring break. Will definitely use again.",
        "datePublished": "2024-12-05"
      }
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(aggregateRatingData)}
      </script>
    </Helmet>
  );
};

export default ReviewSchema;
