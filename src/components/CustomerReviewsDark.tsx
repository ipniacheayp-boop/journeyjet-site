import { Star, Quote, BadgeCheck } from "lucide-react";
import trustPilotImage from "@/assets/label.png";

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

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-500"}`} />
    ));

  // Duplicate for infinite horizontal scroll
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

          <div className="flex justify-center mb-2">
            <img src={trustPilotImage} alt="Trustpilot rating" className="h-24 md:h-28 object-contain" />
          </div>

          <p className="text-white/70 text-sm">Based on 9865+ verified reviews</p>
        </div>

        {/* Horizontal Scrolling Reviews */}
        <div className="relative overflow-hidden group">
          <div className="flex w-max gap-4 animate-marquee group-hover:[animation-play-state:paused]">
            {duplicatedReviews.map((review, index) => (
              <div
                key={`${review.id}-${index}`}
                className="w-[320px] flex-shrink-0 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <Quote className="w-6 h-6 text-white/40 mb-3" aria-hidden="true" />

                <p className="text-white/90 text-sm leading-relaxed mb-4">“{review.text}”</p>

                <div className="flex items-center gap-1 mb-3">{renderStars(review.rating)}</div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{review.name}</span>
                    <BadgeCheck className="w-4 h-4 text-white/60" aria-label="Verified" />
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
    </section>
  );
};

export default CustomerReviewsDark;
