import { useEffect, useMemo, useState } from "react";
import { Star, BadgeCheck, ExternalLink, ChevronRight, ShieldCheck, Award, PlaneTakeoff, Lock, PenLine } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import WriteReviewModal from "@/components/WriteReviewModal";
import { supabase } from "@/integrations/supabase/client";

interface TravelerReview {
  id: string;
  name: string;
  avatarUrl?: string;
  rating: number;
  route: string;
  bookingType: string;
  datePublished: string;
  text: string;
}

interface ApiReview {
  id: string;
  display_name: string;
  rating: number;
  body: string;
  booking_type?: string | null;
  travel_route?: string | null;
  created_at: string;
}

const renderStars = (rating: number) =>
  Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`h-4 w-4 ${i < rating ? "fill-amber-400 text-amber-400" : "fill-transparent text-white/25"}`}
    />
  ));

const CustomerReviewsDark = () => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [expandedReviewIds, setExpandedReviewIds] = useState<Record<string, boolean>>({});
  const [reviews, setReviews] = useState<TravelerReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [totalReviews, setTotalReviews] = useState(108);
  const [averageRating, setAverageRating] = useState(4.8);

  const fetchVerifiedReviews = async () => {
    setLoadingReviews(true);
    try {
      const { data, error } = await supabase.functions.invoke("site-reviews-get", {
        body: { filter: "recent", limit: 20, include_demo: false },
      });
      if (error || !data?.data) {
        setReviews([]);
        return;
      }

      const mapped: TravelerReview[] = (data.data as ApiReview[]).map((review) => ({
        id: review.id,
        name: review.display_name,
        rating: review.rating,
        route: review.travel_route || "Verified flight booking",
        bookingType: review.booking_type || "Flight booking",
        datePublished: review.created_at,
        text: review.body,
      }));

      setReviews(mapped);
      if (typeof data.averageRating === "number") setAverageRating(data.averageRating);
      if (typeof data.totalReviews === "number") setTotalReviews(data.totalReviews);
    } catch {
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchVerifiedReviews();
  }, []);

  const aggregate = useMemo(() => {
    const total = totalReviews;
    const rating = averageRating;
    return { total, rating };
  }, [averageRating, totalReviews]);

  const reviewSchema = useMemo(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Tripile",
      url: "https://tripile.com",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: aggregate.rating.toFixed(1),
        reviewCount: aggregate.total,
        bestRating: "5",
        worstRating: "1",
      },
      review: reviews.map((review) => ({
        "@type": "Review",
        author: { "@type": "Person", name: review.name },
        datePublished: review.datePublished,
        reviewBody: review.text,
        itemReviewed: { "@type": "Service", name: "Tripile flight and travel booking platform" },
        reviewRating: {
          "@type": "Rating",
          ratingValue: review.rating.toString(),
          bestRating: "5",
          worstRating: "1",
        },
      })),
    };
    return JSON.stringify(schema);
  }, [aggregate.rating, aggregate.total, reviews]);

  const duplicatedReviews = useMemo(() => [...reviews, ...reviews], [reviews]);

  const travelTrustBlocks = [
    {
      title: "Why travelers trust Tripile",
      copy: "Verified booking data, transparent pricing, and responsive support build confidence from search to checkout.",
      icon: ShieldCheck,
    },
    {
      title: "Compare airfare prices from top airlines",
      copy: "Our flight comparison engine helps you evaluate routes, layovers, and fare rules to secure best airfare prices.",
      icon: PlaneTakeoff,
    },
    {
      title: "Best flight and hotel booking experience",
      copy: "Book flights, hotels, and add-ons in one place for a smoother trip planning workflow with fewer booking errors.",
      icon: Award,
    },
    {
      title: "Secure and transparent travel booking platform",
      copy: "Tripile protects your payments and clearly displays all major fare terms before you confirm your reservation.",
      icon: Lock,
    },
  ] as const;

  const toggleExpanded = (id: string) => {
    setExpandedReviewIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleReviewAdded = (review: {
    id: string;
    name: string;
    rating: number;
    location?: string;
    text: string;
    platform?: string;
  }) => {
    setReviews((prev) => [
      {
        id: review.id,
        name: review.name,
        rating: review.rating,
        route: review.location ? `${review.location} trip` : "Verified flight booking",
        bookingType: review.platform || "Flight booking",
        datePublished: new Date().toISOString(),
        text: review.text,
      },
      ...prev,
    ]);
    fetchVerifiedReviews();
  };

  return (
    <section className="overflow-hidden bg-[#060B1A] py-16 md:py-24" aria-labelledby="tripile-reviews-heading">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: reviewSchema }} />
      <article className="container mx-auto px-4">
        <header className="mx-auto mb-12 max-w-4xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">Verified Traveler Reviews</p>
          <h2
            id="tripile-reviews-heading"
            className="font-display text-balance text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl"
          >
            Trusted Flight Booking Reviews from Real Travelers
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-relaxed text-blue-100/75 md:text-base">
            Travelers choose Tripile to discover cheap flights, simplify flight booking, and unlock smarter travel deals.
            Our platform helps with airline ticket comparison, finding best airfare prices, and coordinating hotel and car
            rental bookings in one secure experience.
          </p>
        </header>


        <div className="md:hidden">
          <div className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="min-h-[320px] w-[290px] snap-center rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified
                  </span>
                </div>
                <p className="line-clamp-5 text-sm leading-relaxed text-blue-50/90">{review.text}</p>
                <div className="mt-4 space-y-1 border-t border-white/15 pt-4 text-xs text-blue-100/80">
                  <p className="font-semibold text-white">{review.route}</p>
                  <p>{review.bookingType}</p>
                  <p>{new Date(review.datePublished).toLocaleDateString()}</p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  {review.avatarUrl ? (
                    <img
                      src={review.avatarUrl}
                      alt={`${review.name} traveler profile`}
                      loading="lazy"
                      decoding="async"
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-white">
                      {review.name.charAt(0)}
                    </div>
                  )}
                  <p className="text-sm font-semibold text-white">{review.name}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div
          className="group relative hidden overflow-x-hidden py-5 md:block"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <div className="animate-marquee flex w-max gap-6 group-hover:[animation-play-state:paused]">
            {duplicatedReviews.map((review, index) => (
              <motion.article
                key={`${review.id}-${index}`}
                whileHover={{ y: -6 }}
                className="w-[360px] rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-blue-50/90">
                  {expandedReviewIds[`${review.id}-${index}`] ? review.text : `${review.text.slice(0, 145)}...`}
                </p>
                <button
                  type="button"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-300 hover:text-blue-200"
                  onClick={() => toggleExpanded(`${review.id}-${index}`)}
                >
                  {expandedReviewIds[`${review.id}-${index}`] ? "Read less" : "Read more"}
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>

                <div className="mt-4 grid gap-1 border-t border-white/15 pt-4 text-xs text-blue-100/80">
                  <p className="font-semibold text-white">{review.route}</p>
                  <p>{review.bookingType}</p>
                  <p>{new Date(review.datePublished).toLocaleDateString()}</p>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  {review.avatarUrl ? (
                    <img
                      src={review.avatarUrl}
                      alt={`${review.name} traveler profile`}
                      loading="lazy"
                      decoding="async"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 font-bold text-white">
                      {review.name.charAt(0)}
                    </div>
                  )}
                  <p className="text-sm font-semibold text-white">{review.name}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        <section aria-label="Tripile traveler trust highlights" className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
          {travelTrustBlocks.map((item) => (
            <article key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <item.icon className="mb-3 h-5 w-5 text-blue-300" />
              <h3 className="mb-2 text-lg font-semibold text-white">{item.title}</h3>
              <p className="text-sm leading-relaxed text-blue-100/80">{item.copy}</p>
            </article>
          ))}
        </section>

        <nav aria-label="Popular Tripile internal links" className="mt-10 flex flex-wrap items-center gap-3 text-sm">
          {[
            { label: "Flights", to: "/flights" },
            { label: "Hotels", to: "/hotels" },
            { label: "Car Rentals", to: "/car-rentals" },
            { label: "Flight Tracker", to: "/flight-tracker" },
            { label: "Deals", to: "/deals" },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-full border border-blue-300/30 bg-blue-500/10 px-4 py-2 text-blue-100 hover:bg-blue-500/20"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button onClick={() => setShowReviewModal(true)} className="rounded-xl bg-blue-600 px-6 hover:bg-blue-500">
            <PenLine className="mr-2 h-4 w-4" />
            Write Review
          </Button>
          <Link to="/reviews?filter=recent">
            <Button className="rounded-xl bg-blue-600 px-6 hover:bg-blue-500">Read More Reviews</Button>
          </Link>
          <Link to="/booking">
            <Button className="rounded-xl bg-blue-600 px-6 hover:bg-blue-500">Book Your Next Trip</Button>
          </Link>
          <Link to="/flights">
            <Button variant="outline" className="rounded-xl border-blue-400/40 bg-transparent px-6 text-blue-100 hover:bg-blue-500/20">
              Compare Flight Prices
            </Button>
          </Link>
          <Link to="/reviews?filter=recent" className="inline-flex items-center gap-1 text-sm font-medium text-blue-200 hover:text-white">
            See verified reviews <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
        {!loadingReviews && reviews.length === 0 && (
          <p className="mt-4 text-sm text-blue-100/70">No verified reviews yet. Sign in and add your first review.</p>
        )}

      </article>
      <WriteReviewModal open={showReviewModal} onOpenChange={setShowReviewModal} onReviewAdded={handleReviewAdded} />
    </section>
  );
};

export default CustomerReviewsDark;
