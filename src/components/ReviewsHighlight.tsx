import { useEffect, useState } from 'react';
import { StarRating } from './StarRating';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface Review {
  id: string;
  display_name: string;
  rating: number;
  body: string;
  created_at: string;
}

export const ReviewsHighlight = () => {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetchTopReviews();
  }, []);

  const fetchTopReviews = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/site-reviews-get?filter=highest&limit=20`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        }
      );
      
      const data = await response.json();
      if (data.data) {
        setReviews(data.data);
        setAverageRating(data.averageRating || 0);
        setTotalReviews(data.totalReviews || 0);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  useEffect(() => {
    if (reviews.length > 0) {
      const interval = setInterval(nextReview, 5000);
      return () => clearInterval(interval);
    }
  }, [reviews.length]);

  if (reviews.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50/50 via-blue-50/30 to-cyan-50/50 dark:from-purple-950/20 dark:via-blue-950/10 dark:to-cyan-950/20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-5 py-2.5 rounded-full border border-purple-200/50 dark:border-purple-800/30">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-primary">
                {t('reviews.trustedBy')} {totalReviews.toLocaleString()}+ {t('reviews.travelers')}
              </span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {t('reviews.whatTravelersSay')}
            </h2>
            
            <div className="flex items-center justify-center gap-3">
              <StarRating rating={averageRating} readonly size="lg" showNumber />
              <span className="text-muted-foreground">
                ({totalReviews.toLocaleString()} {t('reviews.verifiedReviews')})
              </span>
            </div>
          </div>

          {/* Review Carousel */}
          <div className="relative">
            <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-lg">
              <div className="mb-6">
                <StarRating rating={reviews[currentIndex].rating} readonly size="md" />
              </div>
              
              <blockquote className="text-lg md:text-xl text-foreground mb-6 leading-relaxed">
                "{reviews[currentIndex].body}"
              </blockquote>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                  {reviews[currentIndex].display_name[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {reviews[currentIndex].display_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('reviews.verifiedTraveler')}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevReview}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-background border border-border rounded-full p-3 hover:bg-accent transition-colors shadow-lg"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={nextReview}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-background border border-border rounded-full p-3 hover:bg-accent transition-colors shadow-lg"
              aria-label="Next review"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {reviews.slice(0, 5).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex % 5 ? 'w-8 bg-primary' : 'w-2 bg-border'
                }`}
                aria-label={`Go to review ${idx + 1}`}
              />
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Button asChild size="lg" className="gap-2">
              <Link to="/reviews">
                {t('reviews.readAllReviews')}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};