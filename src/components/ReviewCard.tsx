import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StarRating } from './StarRating';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Edit2, X, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ReviewCardProps {
  review: {
    id: string;
    user_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    profiles?: {
      name: string | null;
      profile_image: string | null;
    };
  };
  currentUserId?: string;
  isAdmin?: boolean;
  onUpdate?: () => void;
}

export const ReviewCard = ({ review, currentUserId, isAdmin, onUpdate }: ReviewCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRating, setEditedRating] = useState(review.rating);
  const [editedComment, setEditedComment] = useState(review.comment || '');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const isOwner = currentUserId === review.user_id;
  const canEdit = isOwner;
  const canDelete = isOwner || isAdmin;

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase.functions.invoke('reviews-update', {
        body: {
          reviewId: review.id,
          rating: editedRating,
          comment: editedComment,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Review updated successfully',
      });
      setIsEditing(false);
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update review',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('reviews-delete', {
        body: { reviewId: review.id },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Review deleted successfully',
      });
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete review',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={review.profiles?.profile_image || undefined} />
            <AvatarFallback>
              {review.profiles?.name?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{review.profiles?.name || 'Anonymous'}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(review.created_at), 'MMM d, yyyy')}
                </p>
              </div>
              
              {(canEdit || canDelete) && !isEditing && (
                <div className="flex gap-2">
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <StarRating
                  rating={editedRating}
                  onRatingChange={setEditedRating}
                />
                <Textarea
                  value={editedComment}
                  onChange={(e) => setEditedComment(e.target.value)}
                  placeholder="Share your experience... (optional)"
                  maxLength={300}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleUpdate}
                    disabled={isUpdating}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedRating(review.rating);
                      setEditedComment(review.comment || '');
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <StarRating rating={review.rating} readonly />
                {review.comment && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {review.comment}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
