import { Star, Quote, BadgeCheck } from "lucide-react";
import trustPilotImage from "@/assets/trustpilot1.png";
import TrustpilotSlider from "@/components/ReviewSlider";

const CustomerReviewsDark = () => {
  const reviews = [
    {
      id: 1,
      name: "James K.",
      location: "New York, USA",
      timeAgo: "2 days ago",
      rating: 5,
      image: "avatars/1.png",
      text: "Absolutely amazing experience! Found flights 40% cheaper than anywhere else. The booking process was seamless and customer support was incredibly helpful.",
    },
    {
      id: 2,
      name: "Sarah W.",
      location: "London, UK",
      timeAgo: "1 week ago",
      rating: 5,
      image: "avatars/2.png",
      text: "Best travel booking site I've ever used. Price alerts saved me $300 on my trip to Europe. Highly recommend to everyone!",
    },
    {
      id: 3,
      name: "Michael T.",
      location: "Toronto, Canada",
      timeAgo: "3 days ago",
      rating: 4,
      image: "avatars/3.png",
      text: "Great deals and easy to use interface. Booked my family vacation in minutes. The flight tracker feature is incredibly useful.",
    },
    {
      id: 4,
      name: "Emily R.",
      location: "Sydney, Australia",
      timeAgo: "5 days ago",
      rating: 5,
      image: "avatars/4.png",
      text: "I've been using ChyeapFlights for years now. Never disappointed! Their customer service team goes above and beyond every time.",
    },
    {
      id: 5,
      name: "Raunak S.",
      location: "Delhi, India",
      timeAgo: "1 day ago",
      rating: 5,
      image: "avatars/5.png",
      text: "Found an incredible last-minute deal for my anniversary trip. The mobile app notifications are a game changer!",
    },
    {
      id: 6,
      name: "Maria G.",
      location: "Berlin, Germany",
      timeAgo: "4 days ago",
      rating: 5,
      image: "avatars/6.png",
      text: "Exceptional service from start to finish. The price comparison tool helped me save over €200 on my business trip.",
    },
    {
      id: 7,
      name: "David P.",
      location: "Madrid, Spain",
      timeAgo: "6 days ago",
      rating: 5,
      image: "avatars/7.png",
      text: "Very impressed with the customer support. They helped me change my booking at the last minute with no hassle.",
    },
    {
      id: 8,
      name: "Linda C.",
      location: "Chicago, USA",
      timeAgo: "2 weeks ago",
      rating: 4,
      image: "avatars/8.png",
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
            <img src={trustPilotImage} alt="Trustpilot rating" className="h-32 md:h-36 object-contain" />
          </div>
          <TrustpilotSlider />
          <p className="text-white/70 mt-6 text-sm">Based on 9865+ verified reviews</p>
        </div>

        {/* Horizontal Scrolling Reviews */}
        <div className="relative overflow-x-auto scrollbar-hide lg:overflow-hidden group">
          <div className="flex w-max gap-4 animate-marquee group-hover:[animation-play-state:paused]">
            {duplicatedReviews.map((review, index) => (
              <div
                key={`${review.id}-${index}`}
                className="w-[320px] flex-shrink-0 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  {/* Avatar */}
                  <img
                    src={review.image}
                    alt={review.name}
                    className="w-14 h-14 rounded-full object-cover border border-white/20"
                  />

                  {/* Quote Icon */}
                  <Quote className="w-6 h-6 text-white/40" aria-hidden="true" />
                </div>

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
