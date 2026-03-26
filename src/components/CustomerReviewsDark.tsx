import { useState, useEffect } from "react";
import { Star, Quote, BadgeCheck, ExternalLink, PenLine } from "lucide-react";
import { motion } from "framer-motion";
import trustPilotImage from "@/assets/trustpilot1.png";
import TrustpilotSlider from "@/components/ReviewSlider";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import WriteReviewModal from "@/components/WriteReviewModal";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface DBReview {
  id: string;
  display_name: string;
  rating: number;
  body: string;
  country: string | null;
  booking_type: string | null;
  created_at: string;
}

interface DisplayReview {
  id: string;
  name: string;
  location: string;
  timeAgo: string;
  rating: number;
  text: string;
  platform: string;
}

const platformColor: Record<string, string> = {
  Trustpilot: "text-emerald-400",
  Google: "text-blue-400",
  Direct: "text-cyan-400",
};

const renderStars = (rating: number) =>
  Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`w-3.5 h-3.5 ${i < rating ? "text-amber-400 fill-amber-400" : "text-white/20 fill-transparent"}`}
    />
  ));

const mapDBReview = (r: DBReview): DisplayReview => ({
  id: r.id,
  name: r.display_name,
  location: r.country || "USA",
  timeAgo: formatDistanceToNow(new Date(r.created_at), { addSuffix: true }),
  rating: r.rating,
  text: r.body,
  platform: r.booking_type || "Direct",
});

const CustomerReviewsDark = () => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [allReviews, setAllReviews] = useState<DisplayReview[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(4.5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/site-reviews-get?filter=highest&limit=20`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      const data = await response.json();
      if (data.data) {
        setAllReviews(data.data.map(mapDBReview));
        setTotalReviews(data.totalReviews || 0);
        setAverageRating(data.averageRating || 4.5);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const duplicatedReviews = [...allReviews, ...allReviews];

  const handleReviewAdded = (newReview: any) => {
    const mapped = mapDBReview(newReview);
    setAllReviews((prev) => [mapped, ...prev]);
    setTotalReviews((prev) => prev + 1);
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
              <span className="text-white font-bold ml-1">{averageRating.toFixed(1)}</span>
            </div>
            <span className="w-px h-4 bg-white/20 hidden sm:block" />
            <span>
              <strong className="text-white">{totalReviews.toLocaleString()}+</strong> verified reviews
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
        {allReviews.map((review, index) => (
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
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm shrink-0 border border-white/15">
                {review.name[0]?.toUpperCase() || "?"}
              </div>
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

      <WriteReviewModal
        open={showReviewModal}
        onOpenChange={setShowReviewModal}
        onReviewAdded={handleReviewAdded}
      />
    </section>
  );
};

export default CustomerReviewsDark;
