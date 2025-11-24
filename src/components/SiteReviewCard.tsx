import { useState } from 'react';
import { StarRating } from './StarRating';
import { Button } from './ui/button';
import { ThumbsUp, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { SiteReview } from '@/hooks/useSiteReviews';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from './ui/badge';

interface SiteReviewCardProps {
  review: SiteReview;
  onMarkHelpful: (reviewId: string) => void;
  onEdit: (review: SiteReview) => void;
  onDelete: (reviewId: string) => void;
  isAdmin?: boolean;
}

export const SiteReviewCard = ({
  review,
  onMarkHelpful,
  onEdit,
  onDelete,
  isAdmin,
}: SiteReviewCardProps) => {
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
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-start justify-between">
      <div className="space-y-2 flex-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
            {review.display_name[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-foreground">{review.display_name}</span>
              {review.is_featured && (
                <Badge variant="secondary" className="text-xs">Featured</Badge>
              )}
              {(review as any).demo && (
                <Badge variant="destructive" className="text-xs">
                  DEMO — Not a real customer review
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {format(new Date(review.created_at), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
        <StarRating rating={review.rating} readonly size="sm" />
      </div>
        
        {canModerate && (
          <div className="flex gap-2">
            {isOwner && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(review)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(review.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {review.title && (
        <h4 className="font-semibold text-foreground">{review.title}</h4>
      )}

      <p className="text-foreground leading-relaxed">{review.body}</p>

      <div className="flex items-center gap-4 pt-2 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMarkHelpful}
          disabled={hasMarkedHelpful || !user}
          className="gap-2"
        >
          <ThumbsUp className={`w-4 h-4 ${hasMarkedHelpful ? 'fill-current' : ''}`} />
          <span>Helpful ({review.helpful_count})</span>
        </Button>
      </div>
    </div>
  );
};
