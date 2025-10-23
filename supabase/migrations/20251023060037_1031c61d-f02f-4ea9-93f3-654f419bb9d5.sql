-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, booking_id)
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view reviews"
  ON public.reviews
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON public.reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON public.reviews
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any review"
  ON public.reviews
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_reviews_booking_id ON public.reviews(booking_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);