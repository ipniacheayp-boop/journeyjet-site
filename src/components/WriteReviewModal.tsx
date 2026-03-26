import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface WriteReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewAdded?: (review: any) => void;
}

const MAX_BODY = 1000;
const MIN_BODY = 20;

const WriteReviewModal = ({ open, onOpenChange, onReviewAdded }: WriteReviewModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [source, setSource] = useState("Direct");
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setLocation("");
    setRating(0);
    setHoverRating(0);
    setTitle("");
    setBody("");
    setSource("Direct");
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to write a review");
      onOpenChange(false);
      navigate("/login");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    if (body.trim().length < MIN_BODY) {
      toast.error(`Review must be at least ${MIN_BODY} characters`);
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("site-reviews-create", {
        body: {
          rating,
          title: title.trim() || undefined,
          body: body.trim(),
          displayName: name.trim(),
          country: location.trim() || undefined,
          bookingType: source,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Review added successfully! 🎉");

      // Optimistic UI: pass the new review up
      if (onReviewAdded && data?.data) {
        onReviewAdded({
          id: data.data.id,
          name: name.trim(),
          location: location.trim() || "Traveler",
          timeAgo: "Just now",
          rating,
          image: user?.user_metadata?.avatar_url || "",
          text: body.trim(),
          platform: source,
        });
      }

      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const activeRating = hoverRating || rating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-950 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">Write a Review</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Star Rating */}
          <div>
            <Label className="text-white/70 text-xs mb-1.5 block">Rating *</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      star <= activeRating
                        ? "text-amber-400 fill-amber-400"
                        : "text-white/20"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="text-white/50 text-sm ml-2 self-center">{rating}/5</span>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <Label className="text-white/70 text-xs mb-1.5 block">Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              maxLength={50}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
          </div>

          {/* Location */}
          <div>
            <Label className="text-white/70 text-xs mb-1.5 block">Location</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="New York, USA"
              maxLength={100}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
          </div>

          {/* Title */}
          <div>
            <Label className="text-white/70 text-xs mb-1.5 block">Review Title (optional)</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Great experience!"
              maxLength={100}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
          </div>

          {/* Body */}
          <div>
            <Label className="text-white/70 text-xs mb-1.5 block">Your Review *</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value.slice(0, MAX_BODY))}
              placeholder="Share your travel experience..."
              rows={4}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
            />
            <p className={`text-xs mt-1 ${body.length < MIN_BODY ? "text-white/30" : "text-white/50"}`}>
              {body.length}/{MAX_BODY} characters {body.length < MIN_BODY && `(min ${MIN_BODY})`}
            </p>
          </div>

          {/* Source */}
          <div>
            <Label className="text-white/70 text-xs mb-1.5 block">Source</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                <SelectItem value="Direct">Direct</SelectItem>
                <SelectItem value="Trustpilot">Trustpilot</SelectItem>
                <SelectItem value="Google">Google</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={submitting || rating === 0 || body.trim().length < MIN_BODY || !name.trim()}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WriteReviewModal;
