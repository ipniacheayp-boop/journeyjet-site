import { Star, Quote, BadgeCheck } from "lucide-react";
import trustPilotImage from "@/assets/trustpilot.jpeg";

const CustomerReviewsDark = () => {
  const reviews = [
    {
      id: 1,
      name: "Sarah M.",
      location: "New York, USA",
      timeAgo: "2 days ago",
      rating: 5,
      text: "Absolutely amazing experience! Found flights 40% cheaper than anywhere else. The booking process was seamless and customer support was incredibly helpful.",
    },
    {
      id: 2,
      name: "James K.",
      location: "London, UK",
      timeAgo: "1 week ago",
      rating: 5,
      text: "Best travel booking site I've ever used. Price alerts saved me $300 on my trip to Europe. Highly recommend to everyone!",
    },
    {
      id: 3,
      name: "Emily R.",
      location: "Toronto, Canada",
      timeAgo: "3 days ago",
      rating: 4,
      text: "Great deals and easy to use interface. Booked my family vacation in minutes. The flight tracker feature is incredibly useful.",
    },
    {
      id: 4,
      name: "Michael T.",
      location: "Sydney, Australia",
      timeAgo: "5 days ago",
      rating: 5,
      text: "I've been using ChyeapFlights for years now. Never disappointed! Their customer service team goes above and beyond every time.",
    },
    {
      id: 5,
      name: "Lisa C.",
      location: "Miami, USA",
      timeAgo: "1 day ago",
      rating: 5,
      text: "Found an incredible last-minute deal for my anniversary trip. The mobile app notifications are a game changer!",
    },
    {
      id: 6,
      name: "David P.",
      location: "Berlin, Germany",
      timeAgo: "4 days ago",
      rating: 5,
      text: "Exceptional service from start to finish. The price comparison tool helped me save over €200 on my business trip.",
    },
    {
      id: 7,
      name: "Maria G.",
      location: "Madrid, Spain",
      timeAgo: "6 days ago",
      rating: 5,
      text: "Very impressed with the customer support. They helped me change my booking at the last minute with no hassle.",
    },
    {
      id: 8,
      name: "Robert L.",
      location: "Chicago, USA",
      timeAgo: "2 weeks ago",
      rating: 4,
      text: "Great platform for finding deals. The interface is intuitive and the booking confirmation was instant.",
    },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-500"}`} />
    ));
  };

  // Duplicate reviews for seamless infinite scroll
  const duplicatedReviews = [...reviews, ...reviews];

  return (
    <section className="py-16 md:py-24 bg-[#013f3f] overflow-hidden" aria-labelledby="reviews-dark-title">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            id="reviews-dark-title"
            className="text-2xl md:text-4xl font-bold text-white mb-4 uppercase tracking-wider"
          >
            Customer Reviews That Speak for Themselves
          </h2>

          {/* Rating Summary */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-2">
            <div className="flex items-center justify-center">
              <img src={trustPilotImage} alt="Trustpilot rating" className="h-20 md:h-24 object-contain" />
            </div>
          </div>
          <p className="text-white/70 text-sm">Based on 9865+ verified reviews</p>
        </div>

        {/* Continuous Scrolling Reviews */}
        <div className="relative max-w-6xl mx-auto">
          <div className="h-[400px] md:h-[450px] overflow-hidden relative group">
            {/* Gradient overlays for smooth fade effect */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-teal-900 to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-emerald-900 to-transparent z-10 pointer-events-none" />

            {/* Scrolling container */}
            <div className="animate-scroll-up group-hover:[animation-play-state:paused] flex flex-col gap-4">
              {duplicatedReviews.map((review, index) => (
                <div
                  key={`${review.id}-${index}`}
                  className="flex-shrink-0 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 mx-2"
                >
                  {/* Quote Icon */}
                  <Quote className="w-6 h-6 text-teal-400/50 mb-3" aria-hidden="true" />

                  {/* Review Text */}
                  <p className="text-white/90 text-sm leading-relaxed mb-4">"{review.text}"</p>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">{renderStars(review.rating)}</div>

                  {/* Reviewer Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{review.name}</span>
                      <BadgeCheck className="w-4 h-4 text-teal-400" aria-label="Verified" />
                    </div>
                    <div className="text-right">
                      <span className="text-white/50 text-xs block">{review.location}</span>
                      <span className="text-white/40 text-xs">{review.timeAgo}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerReviewsDark;
