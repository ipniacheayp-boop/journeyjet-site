-- Create site_reviews table for users to review the website itself
CREATE TABLE public.site_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  helpful_count INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view non-deleted reviews
CREATE POLICY "Anyone can view active site reviews"
  ON public.site_reviews
  FOR SELECT
  USING (is_deleted = false);

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create site reviews"
  ON public.site_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update their own site reviews"
  ON public.site_reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can update any review
CREATE POLICY "Admins can update any site review"
  ON public.site_reviews
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can soft-delete their own reviews
CREATE POLICY "Users can delete their own site reviews"
  ON public.site_reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can soft-delete any review
CREATE POLICY "Admins can delete any site review"
  ON public.site_reviews
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_site_reviews_updated_at
  BEFORE UPDATE ON public.site_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create table to track helpful votes (one per user per review)
CREATE TABLE public.site_review_helpful (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.site_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- Enable RLS
ALTER TABLE public.site_review_helpful ENABLE ROW LEVEL SECURITY;

-- Anyone can view helpful votes
CREATE POLICY "Anyone can view helpful votes"
  ON public.site_review_helpful
  FOR SELECT
  USING (true);

-- Authenticated users can add helpful votes
CREATE POLICY "Authenticated users can add helpful votes"
  ON public.site_review_helpful
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_site_reviews_rating ON public.site_reviews(rating);
CREATE INDEX idx_site_reviews_created_at ON public.site_reviews(created_at DESC);
CREATE INDEX idx_site_reviews_is_featured ON public.site_reviews(is_featured) WHERE is_featured = true;
CREATE INDEX idx_site_review_helpful_review_id ON public.site_review_helpful(review_id);