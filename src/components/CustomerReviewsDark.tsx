import { useState } from "react";
import { Star, Quote, BadgeCheck, ExternalLink, PenLine } from "lucide-react";
import { motion } from "framer-motion";
import trustPilotImage from "@/assets/trustpilot1.png";
import TrustpilotSlider from "@/components/ReviewSlider";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import WriteReviewModal from "@/components/WriteReviewModal";

const reviews = [
  {
    id: 1,
    name: "James K.",
    location: "New York, USA",
    timeAgo: "2 days ago",
    rating: 5,
    image: "avatars/1.png",
    text: "Absolutely amazing experience! Found flights 40% cheaper than anywhere else. The booking process was seamless and customer support was incredibly helpful.",
    platform: "Trustpilot",
  },
  {
    id: 2,
    name: "Sarah W.",
    location: "London, UK",
    timeAgo: "1 week ago",
    rating: 5,
    image: "avatars/2.png",
    text: "Best travel booking site I've ever used. Price alerts saved me $300 on my trip to Europe. Highly recommend to everyone!",
    platform: "Google",
  },
  {
    id: 3,
    name: "Michael T.",
    location: "Toronto, Canada",
    timeAgo: "3 days ago",
    rating: 4,
    image: "avatars/3.png",
    text: "Great deals and easy to use interface. Booked my family vacation in minutes. The flight tracker feature is incredibly useful.",
    platform: "Trustpilot",
  },
  {
    id: 4,
    name: "Emily R.",
    location: "Sydney, Australia",
    timeAgo: "5 days ago",
    rating: 5,
    image: "avatars/4.png",
    text: "I've been using Tripile for years now. Never disappointed! Their customer service team goes above and beyond every time.",
    platform: "Sitejabber",
  },
  {
    id: 5,
    name: "Raunak S.",
    location: "Delhi, India",
    timeAgo: "1 day ago",
    rating: 5,
    image: "avatars/5.png",
    text: "Found an incredible last-minute deal for my anniversary trip. The mobile app notifications are a total game changer for price tracking!",
    platform: "Google",
  },
  {
    id: 6,
    name: "Maria G.",
    location: "Berlin, Germany",
    timeAgo: "4 days ago",
    rating: 5,
    image: "avatars/6.png",
    text: "Exceptional service from start to finish. The price comparison tool helped me save over €200 on my business trip.",
    platform: "Trustpilot",
  },
  {
    id: 7,
    name: "David P.",
    location: "Madrid, Spain",
    timeAgo: "6 days ago",
    rating: 5,
    image: "avatars/7.png",
    text: "Very impressed with the customer support. They helped me change my booking at the last minute with no hassle at all.",
    platform: "Reviews.io",
  },
  {
    id: 8,
    name: "Linda C.",
    location: "Chicago, USA",
    timeAgo: "2 weeks ago",
    rating: 4,
    image: "avatars/8.png",
    text: "Great platform for finding deals. The interface is intuitive and the booking confirmation was instant. Will definitely use again.",
    platform: "Google",
  },
];

const platformColor: Record<string, string> = {
  Trustpilot: "text-emerald-400",
  Google: "text-blue-400",
  Sitejabber: "text-orange-400",
  "Reviews.io": "text-violet-400",
};

const renderStars = (rating: number) =>
  Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`w-3.5 h-3.5 ${i < rating ? "text-amber-400 fill-amber-400" : "text-white/20 fill-transparent"}`}
    />
  ));



const CustomerReviewsDark = () => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userReviews, setUserReviews] = useState<typeof reviews>([]);

  const allReviews = [...userReviews, ...reviews];
  const duplicatedReviews = [...allReviews, ...allReviews];

  const handleReviewAdded = (newReview: any) => {
    setUserReviews((prev) => [newReview, ...prev]);
  };

  return (
    <section className="py-16 md:py-24 bg-slate-950 overflow-hidden" aria-labelledby="reviews-dark-title">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Customer Reviews</p>
          <h2 id="reviews-dark-title" className="text-2xl md:text-3xl font-bold text-white mb-6">
            Real Stories from Real Travelers
          </h2>

          {/* Trustpilot + Slider row */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-4">
            <img src={trustPilotImage} alt="Trustpilot rating" className="h-24 md:h-28 object-contain" />
            <TrustpilotSlider />
          </div>

          {/* Summary stats strip */}
          <div className="flex flex-wrap justify-center items-center gap-5 mt-6 text-sm text-white/60">
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-white font-bold ml-1">4.5</span>
            </div>
            <span className="w-px h-4 bg-white/20 hidden sm:block" />
            <span>
              <strong className="text-white">56,000+</strong> verified reviews
            </span>
            <span className="w-px h-4 bg-white/20 hidden sm:block" />
            <span>#1 in US flight comparison</span>
          </div>
        </motion.div>

        {/* Write a Review Button */}
        <div className="text-center mt-6">
          <Button
            onClick={() => setShowReviewModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 gap-2"
          >
            <PenLine className="w-4 h-4" />
            Write a Review
          </Button>
        </div>
      </div>

      {/* ── Mobile: Swipeable Carousel ── */}
      <div className="flex w-full overflow-x-auto snap-x snap-mandatory px-4 pb-6 gap-4 md:hidden scrollbar-hide">
        {reviews.map((review, index) => (
          <div
            key={`${review.id}-${index}`}
            className="w-[280px] sm:w-[320px] snap-center flex-shrink-0 bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/8 transition-all flex flex-col gap-3"
          >
            {/* Stars + platform */}
            <div className="flex items-center justify-between">
              <div className="flex gap-0.5">{renderStars(review.rating)}</div>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wide ${platformColor[review.platform] ?? "text-white/40"}`}
              >
                {review.platform}
              </span>
            </div>

            {/* Quote icon + text */}
            <div className="relative">
              <Quote className="absolute -top-1 -left-1 w-5 h-5 text-white/15" aria-hidden="true" />
              <p className="text-white/80 text-sm leading-relaxed pl-4">{review.text}</p>
            </div>

            {/* Reviewer */}
            <div className="flex items-center gap-3 pt-1 mt-auto border-t border-white/8">
              <img
                src={review.image}
                alt={review.name}
                className="w-9 h-9 rounded-full object-cover border border-white/15 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-white text-xs font-semibold truncate">{review.name}</span>
                  <BadgeCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" aria-label="Verified" />
                </div>
                <span className="text-white/45 text-[10px]">
                  {review.location} · {review.timeAgo}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop: Continuous Marquee ── */}
      <div
        className="relative overflow-x-hidden hidden md:block group"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div className="flex w-max gap-4 px-4 animate-marquee group-hover:[animation-play-state:paused]">
          {duplicatedReviews.map((review, index) => (
            <div
              key={`${review.id}-${index}`}
              className="w-[330px] flex-shrink-0 bg-white/5 hover:bg-white/8 backdrop-blur-sm rounded-2xl p-5 border border-white/8 hover:border-white/16 transition-all duration-300 flex flex-col gap-3"
            >
              {/* Stars + platform */}
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wide ${platformColor[review.platform] ?? "text-white/40"}`}
                >
                  {review.platform}
                </span>
              </div>

              {/* Quote icon + text */}
              <div className="relative">
                <Quote className="absolute -top-1 -left-1 w-5 h-5 text-white/15" aria-hidden="true" />
                <p className="text-white/80 text-sm leading-relaxed pl-4">{review.text}</p>
              </div>

              {/* Reviewer */}
              <div className="flex items-center gap-3 pt-1 mt-auto border-t border-white/8">
                <img
                  src={review.image}
                  alt={review.name}
                  className="w-9 h-9 rounded-full object-cover border border-white/15 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-white text-xs font-semibold truncate">{review.name}</span>
                    <BadgeCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" aria-label="Verified" />
                  </div>
                  <span className="text-white/45 text-[10px]">
                    {review.location} · {review.timeAgo}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom link */}
      <div className="text-center mt-8">
        <Link
          to="/reviews"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white transition-colors"
        >
          Read all reviews on Trustpilot
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
};

export default CustomerReviewsDark;
