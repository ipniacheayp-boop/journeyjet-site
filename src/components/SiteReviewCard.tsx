import { useState } from "react";
import { StarRating } from "./StarRating";
import { Button } from "./ui/button";
import { ThumbsUp, Edit, Trash2, CheckCircle2, Quote } from "lucide-react";
import { format } from "date-fns";
import { SiteReview } from "@/hooks/useSiteReviews";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "./ui/badge";

interface SiteReviewCardProps {
  review: SiteReview;
  onMarkHelpful: (reviewId: string) => void;
  onEdit: (review: SiteReview) => void;
  onDelete: (reviewId: string) => void;
  isAdmin?: boolean;
}

export const SiteReviewCard = ({ review, onMarkHelpful, onEdit, onDelete, isAdmin }: SiteReviewCardProps) => {
  const { user } = useAuth();
  const [hasMarkedHelpful, setHasMarkedHelpful] = useState(false);

  const isOwner = user?.id === review.user_id;
  const canModerate = isOwner || isAdmin;

  const handleMarkHelpful = async () => {
    if (hasMarkedHelpful) return;
    await onMarkHelpful(review.id);
    setHasMarkedHelpful(true);
  };

  return (
    <div className="group relative w-full rounded-2xl border border-border/50 bg-gradient-to-br from-card to-muted/20 p-6 md:p-8 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-primary/20 overflow-hidden">
      {/* Decorative Gradient Blob in Background */}
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/10 blur-3xl transition-transform duration-700 group-hover:scale-150 group-hover:bg-primary/20" />

      {/* Background Quote Icon */}
      <Quote className="absolute top-6 right-8 w-20 h-20 text-primary/5 -rotate-12 transition-all duration-500 group-hover:-rotate-6 group-hover:scale-110 group-hover:text-primary/10" />

      {review.demo && (
        <div className="mb-4 relative z-10">
          <Badge
            variant="outline"
            className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-orange-500/10 text-orange-600 border-orange-500/20 backdrop-blur-md"
          >
            Demo Review
          </Badge>
        </div>
      )}

      {/* Top Header: Rating and Date */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm p-1.5 px-3 rounded-full border border-border/50">
          <StarRating rating={review.rating} readonly size="sm" />
          <span className="text-sm font-semibold ml-1">{review.rating}.0</span>
        </div>

        {canModerate && (
          <div className="flex gap-1.5 bg-background/50 backdrop-blur-sm rounded-full p-1 border border-border/50">
            {isOwner && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(review)}
                  className="h-7 w-7 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
                >
                  <Edit className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(review.id)}
                  className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Main Review Content */}
      <div className="space-y-4 relative z-10 mb-8 max-w-[90%]">
        {review.title && (
          <h4 className="text-xl md:text-2xl font-bold tracking-tight text-foreground/90 leading-tight">
            "{review.title}"
          </h4>
        )}
        <p className="text-base md:text-lg leading-relaxed text-muted-foreground/90 font-medium whitespace-pre-line">
          {review.body}
        </p>
      </div>

      {/* Footer: User Info & Helpful Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-6 border-t border-border/50 gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center border-2 border-background shadow-sm ring-1 ring-border shadow-primary/10">
              <span className="text-primary font-bold text-lg">{review.display_name[0].toUpperCase()}</span>
            </div>
            {review.is_featured && !review.demo && (
              <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500 drop-shadow-sm" fill="bg-background" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{review.display_name}</span>
              {review.is_featured && !review.demo && (
                <span className="text-xs font-medium text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">
                  Verified Trip
                </span>
              )}
            </div>
            <div className="flex items-center text-xs md:text-sm text-muted-foreground mt-0.5 gap-2 flex-wrap">
              <span>{format(new Date(review.created_at), "MMM d, yyyy")}</span>
              {(review.country || review.travel_route || review.booking_type) && (
                <>
                  <div className="w-1 h-1 rounded-full bg-border" />
                  <span className="font-medium text-foreground/70">
                    {review.travel_route || (review.country ? `Traveled to ${review.country}` : review.booking_type)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <Button
          variant={hasMarkedHelpful ? "default" : "outline"}
          size="sm"
          onClick={handleMarkHelpful}
          disabled={hasMarkedHelpful || !user}
          className={`rounded-full shadow-sm transition-all duration-300 ${
            hasMarkedHelpful
              ? "bg-primary text-primary-foreground hover:bg-primary border-transparent"
              : "hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
          }`}
        >
          <ThumbsUp className={`w-4 h-4 mr-2 ${hasMarkedHelpful ? "fill-current" : ""}`} />
          <span className="font-semibold">
            {hasMarkedHelpful ? "Helpful!" : "Helpful"}
            {review.helpful_count > 0 && ` (${review.helpful_count})`}
          </span>
        </Button>
      </div>
    </div>
  );
};
