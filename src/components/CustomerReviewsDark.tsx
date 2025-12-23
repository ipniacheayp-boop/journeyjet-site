import { useState } from "react";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

const CustomerReviewsDark = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const reviews = [
    {
      id: 1,
      name: "Sarah M.",
      timeAgo: "2 days ago",
      rating: 5,
      text: "Absolutely amazing experience! Found flights 40% cheaper than anywhere else. The booking process was seamless and customer support was incredibly helpful.",
    },
    {
      id: 2,
      name: "James K.",
      timeAgo: "1 week ago",
      rating: 5,
      text: "Best travel booking site I've ever used. Price alerts saved me $300 on my trip to Europe. Highly recommend to everyone!",
    },
    {
      id: 3,
      name: "Emily R.",
      timeAgo: "3 days ago",
      rating: 4,
      text: "Great deals and easy to use interface. Booked my family vacation in minutes. The flight tracker feature is incredibly useful.",
    },
    {
      id: 4,
      name: "Michael T.",
      timeAgo: "5 days ago",
      rating: 5,
      text: "I've been using ChyeapFlights for years now. Never disappointed! Their customer service team goes above and beyond every time.",
    },
    {
      id: 5,
      name: "Lisa C.",
      timeAgo: "1 day ago",
      rating: 5,
      text: "Found an incredible last-minute deal for my anniversary trip. The mobile app notifications are a game changer!",
    },
  ];

  const visibleReviews = 3;
  const maxIndex = Math.max(0, reviews.length - visibleReviews);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-500"}`}
      />
    ));
  };

  return (
    <section 
      className="py-16 md:py-24 bg-gradient-to-br from-teal-900 via-emerald-900 to-green-900"
      aria-labelledby="reviews-dark-title"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 
            id="reviews-dark-title" 
            className="text-2xl md:text-4xl font-bold text-white mb-4 uppercase tracking-wider"
          >
            Customer Reviews That Speak for Themselves
          </h2>
          
          {/* Rating Summary */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">Excellent</span>
              <div className="flex">{renderStars(5)}</div>
              <span className="text-xl font-semibold text-yellow-400">4.8</span>
            </div>
          </div>
          <p className="text-white/70 text-sm">
            Based on 50,000+ verified reviews
          </p>
        </motion.div>

        {/* Reviews Carousel */}
        <div className="relative max-w-6xl mx-auto">
          {/* Navigation Arrows */}
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full disabled:opacity-30 hidden md:flex"
            aria-label="Previous reviews"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={nextSlide}
            disabled={currentIndex === maxIndex}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full disabled:opacity-30 hidden md:flex"
            aria-label="Next reviews"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          {/* Reviews Grid */}
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-6"
              animate={{ x: `-${currentIndex * (100 / visibleReviews + 2)}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {reviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="flex-shrink-0 w-full md:w-[calc(33.333%-16px)] bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  {/* Quote Icon */}
                  <Quote className="w-8 h-8 text-teal-400/50 mb-4" aria-hidden="true" />

                  {/* Review Text */}
                  <p className="text-white/90 text-sm leading-relaxed mb-4 min-h-[80px]">
                    "{review.text}"
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {renderStars(review.rating)}
                  </div>

                  {/* Reviewer Info */}
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">{review.name}</span>
                    <span className="text-white/50 text-xs">{review.timeAgo}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Mobile Navigation Dots */}
          <div className="flex justify-center gap-2 mt-6 md:hidden">
            {Array.from({ length: reviews.length }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(Math.min(i, maxIndex))}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentIndex ? "bg-white w-6" : "bg-white/30"
                }`}
                aria-label={`Go to review ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerReviewsDark;
