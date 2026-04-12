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
      className={`w-4 h-4 ${i < rating ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.4)]" : "text-white/20 fill-transparent"}`}
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
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        },
      );
      const data = await response.json();
      if (data.data) {
        setAllReviews(data.data.map(mapDBReview));
        setTotalReviews(data.totalReviews || 0);
        setAverageRating(data.averageRating || 4.5);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
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
        <div className="text-center mt-8">
          <Button
            onClick={() => setShowReviewModal(true)}
            className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 hover:border-primary/50 transition-all rounded-full px-6 py-4 h-auto text-base gap-2 shadow-[0_0_15px_rgba(var(--primary),0.2)]"
          >
            <PenLine className="w-5 h-5" />
            Write a Review
          </Button>
        </div>
      </div>

      {/* ── Mobile: Swipeable Carousel ── */}
      <div className="flex w-full overflow-x-auto snap-x snap-mandatory px-4 pb-8 pt-4 gap-4 md:hidden scrollbar-hide">
        {allReviews.map((review, index) => (
          <div
            key={`${review.id}-${index}`}
            className="w-[300px] snap-center flex-shrink-0 bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-white/5 transition-all flex flex-col gap-4 shadow-2xl relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Stars + platform */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex gap-1">{renderStars(review.rating)}</div>
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${platformColor[review.platform] ?? "text-white/40"}`}
              >
                {review.platform}
              </span>
            </div>

            {/* Quote icon + text */}
            <div className="relative mt-2 z-10">
              <Quote className="absolute -top-2 -left-2 w-6 h-6 text-white/10" aria-hidden="true" />
              <p className="text-white/90 text-sm leading-relaxed pl-6 italic font-medium">{review.text}</p>
            </div>

            {/* Reviewer */}
            <div className="flex items-center gap-4 pt-4 mt-auto border-t border-white/10 relative z-10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center text-white font-bold text-sm shrink-0 border border-primary/20 shadow-inner">
                {review.name[0]?.toUpperCase() || "?"}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-white text-sm font-bold truncate">{review.name}</span>
                  <BadgeCheck
                    className="w-4 h-4 text-primary shrink-0 drop-shadow-[0_0_2px_rgba(var(--primary),0.5)]"
                    aria-label="Verified"
                  />
                </div>
                <span className="text-white/50 text-[11px] font-medium tracking-wide">
                  {review.location} · {review.timeAgo}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop: Continuous Marquee ── */}
      <div
        className="relative overflow-x-hidden hidden md:block group py-8"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <div className="flex w-max gap-6 px-4 animate-marquee group-hover:[animation-play-state:paused]">
          {duplicatedReviews.map((review, index) => (
            <div
              key={`${review.id}-${index}`}
              className="w-[360px] h-[320px] flex-shrink-0 bg-slate-900/40 hover:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-7 border border-white/5 hover:border-primary/30 transition-all duration-500 flex flex-col gap-4 shadow-xl hover:shadow-[0_0_30px_rgba(var(--primary),0.15)] hover:-translate-y-2 relative overflow-hidden group/card cursor-pointer"
            >
              {/* Background Glow on hover */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>

              {/* Stars + platform */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex gap-1">{renderStars(review.rating)}</div>
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider ${platformColor[review.platform] ?? "text-white/40"}`}
                >
                  {review.platform}
                </span>
              </div>

              {/* Quote icon + text */}
              <div className="relative mt-2 z-10">
                <Quote
                  className="absolute -top-2 -left-2 w-7 h-7 text-white/5 group-hover/card:text-primary/20 transition-colors duration-500"
                  aria-hidden="true"
                />
                <p className="text-white/90 text-[15px] leading-relaxed pl-6 italic font-medium">{review.text}</p>
              </div>

              {/* Reviewer */}
              <div className="flex items-center gap-4 pt-5 mt-auto border-t border-white/10 group-hover/card:border-white/20 transition-colors duration-500 relative z-10">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-white font-bold text-base shrink-0 border border-primary/20 shadow-inner group-hover/card:border-primary/50 transition-colors duration-500">
                  {review.name[0]?.toUpperCase() || "?"}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white text-[15px] font-bold truncate group-hover/card:text-primary-100 transition-colors duration-300">
                      {review.name}
                    </span>
                    <BadgeCheck
                      className="w-4 h-4 text-primary shrink-0 drop-shadow-[0_0_2px_rgba(var(--primary),0.5)]"
                      aria-label="Verified"
                    />
                  </div>
                  <span className="text-white/50 text-xs font-medium tracking-wide">
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
          title="Read all Tripile customer reviews"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white transition-colors"
        >
          Read all reviews on Trustpilot
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <WriteReviewModal open={showReviewModal} onOpenChange={setShowReviewModal} onReviewAdded={handleReviewAdded} />
    </section>
  );
};

export default CustomerReviewsDark;
