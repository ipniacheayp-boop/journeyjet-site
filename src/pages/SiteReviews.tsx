import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/StarRating";
import { SiteReviewCard } from "@/components/SiteReviewCard";
import { useSiteReviews, SiteReview } from "@/hooks/useSiteReviews";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function SiteReviews() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("recent");
  const [page, setPage] = useState(1);
  const limit = 7;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<SiteReview | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Show only real reviews (demo=false) by default
  const { reviews, loading, averageRating, totalReviews, ratingDistribution, createReview, updateReview, markHelpful } =
    useSiteReviews(filter, false, page, limit);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [filter]);

  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    body: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a review",
        variant: "destructive",
      });
      return;
    }

    if (formData.body.length < 20) {
      toast({
        title: "Error",
        description: "Review must be at least 20 characters long",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      if (editingReview) {
        await updateReview(editingReview.id, formData);
      } else {
        await createReview(formData);
      }
      setIsDialogOpen(false);
      setFormData({ rating: 5, title: "", body: "" });
      setEditingReview(null);
    } catch (error) {
      // Error already handled in hook
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (review: SiteReview) => {
    setEditingReview(review);
    setFormData({
      rating: review.rating,
      title: review.title || "",
      body: review.body,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (reviewId: string) => {
    if (confirm("Are you sure you want to delete this review?")) {
      await updateReview(reviewId, { isDeleted: true });
    }
  };

  const ratingPercentages = Object.entries(ratingDistribution)
    .map(([rating, count]) => ({
      rating: parseInt(rating),
      count,
      percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0,
    }))
    .reverse();

  return (
    <div className="min-h-screen flex flex-col pt-10">
      <Header />

      <main className="flex-grow bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-background py-12 lg:py-16 border-b border-border/40">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

          <div className="container relative mx-auto px-4 z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="space-y-3">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
                  Customer <span className="text-primary">Reviews</span>
                </h1>
                <p className="text-3xl md:text-4xl font-extrabold tracking-tight text-muted-foreground">
                  Trusted by Travelers <span className="text-primary">"Worldwide"</span>
                </p>
                <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                  Discover why thousands of adventurers choose our platform for their unforgettable journeys.
                </p>
              </div>

              <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 shadow-lg shadow-primary/5 max-w-3xl mx-auto">
                {/* Score Column */}
                <div className="flex flex-col items-center">
                  <span className="text-6xl md:text-7xl font-black text-foreground tracking-tighter mb-2">
                    {averageRating.toFixed(1)}
                  </span>
                  <div className="flex flex-col items-center gap-1">
                    <StarRating rating={averageRating} readonly size="lg" />
                    <p className="text-sm font-medium text-muted-foreground mt-1">
                      Based on <span className="text-foreground font-bold">{totalReviews}</span> reviews
                    </p>
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="hidden md:block w-px h-28 bg-border/60" />

                {/* Rating Distribution Column */}
                <div className="flex flex-col w-full max-w-[280px] space-y-2.5">
                  {ratingPercentages.map(({ rating, count, percentage }) => (
                    <div key={rating} className="flex items-center gap-3 group">
                      <div className="flex items-center w-[100px] shrink-0 justify-end">
                        <StarRating rating={rating} readonly size="sm" />
                      </div>
                      <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden shrink-0 relative">
                        <div
                          className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground w-8 text-left group-hover:text-foreground transition-colors">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="mt-4 rounded-full px-8 py-6 text-lg font-semibold shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-1"
                    disabled={!user}
                  >
                    {user ? "Share Your Experience" : "Login to Write a Review"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>{editingReview ? "Edit Your Review" : "Write a Review"}</DialogTitle>
                    <DialogDescription>Share your experience with our travel booking service</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label>Rating *</Label>
                      <StarRating
                        rating={formData.rating}
                        onRatingChange={(rating) => setFormData({ ...formData, rating })}
                        size="lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Title (optional)</Label>
                      <Input
                        id="title"
                        placeholder="Sum up your experience"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        maxLength={100}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="body">Review *</Label>
                      <Textarea
                        id="body"
                        placeholder="Tell us about your experience (minimum 20 characters)"
                        value={formData.body}
                        onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                        rows={6}
                        maxLength={1000}
                        required
                      />
                      <p className="text-xs text-muted-foreground">{formData.body.length}/1000 characters</p>
                    </div>

                    <div className="flex gap-3 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setFormData({ rating: 5, title: "", body: "" });
                          setEditingReview(null);
                        }}
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {editingReview ? "Update Review" : "Submit Review"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-20 relative bg-background">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              {/* Modern Filters */}
              <div className="mb-10 flex justify-center">
                <Tabs value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
                  <TabsList className="grid w-full grid-cols-2 sm:flex sm:flex-row h-auto p-1.5 bg-background shadow-sm border border-border/40 rounded-xl sm:rounded-full">
                    <TabsTrigger
                      value="recent"
                      className="rounded-lg sm:rounded-full px-4 md:px-6 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
                    >
                      Most Recent
                    </TabsTrigger>
                    <TabsTrigger
                      value="top"
                      className="rounded-lg sm:rounded-full px-4 md:px-6 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
                    >
                      Most Helpful
                    </TabsTrigger>
                    <TabsTrigger
                      value="highest"
                      className="rounded-lg sm:rounded-full px-4 md:px-6 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
                    >
                      Highest Rated
                    </TabsTrigger>
                    <TabsTrigger
                      value="lowest"
                      className="rounded-lg sm:rounded-full px-4 md:px-6 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
                    >
                      Lowest Rated
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="p-4 rounded-full bg-primary/5">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  </div>
                  <p className="text-muted-foreground font-medium animate-pulse">Loading verified reviews...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-24 bg-card rounded-3xl border border-border/50 shadow-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 transition-opacity group-hover:opacity-100" />
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative z-10">
                    <StarRating rating={5} readonly size="lg" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3 relative z-10">No reviews yet</h3>
                  <p className="text-muted-foreground text-lg mb-8 max-w-sm mx-auto relative z-10">
                    Be the first to share your journey and help others discover amazing experiences!
                  </p>
                  <Button
                    onClick={() => (user ? setIsDialogOpen(true) : null)}
                    className="rounded-full shadow-md relative z-10"
                    disabled={!user}
                  >
                    {user ? "Write the first review" : "Login to write a review"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  {reviews.map((review) => (
                    <SiteReviewCard
                      key={review.id}
                      review={review}
                      onMarkHelpful={markHelpful}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}

                  {/* Pagination Controls */}
                  {totalReviews > limit && (
                    <div className="flex justify-center items-center space-x-6 pt-12 pb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                        className="rounded-full px-6 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                      >
                        Previous
                      </Button>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-muted-foreground bg-background px-5 py-2 rounded-full border border-border/50 shadow-sm">
                          Page <span className="text-foreground font-bold">{page}</span> of{" "}
                          {Math.ceil(totalReviews / limit)}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(Math.ceil(totalReviews / limit), p + 1))}
                        disabled={page >= Math.ceil(totalReviews / limit) || loading}
                        className="rounded-full px-6 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SEO Content Columns */}
        {/* <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {/* Top Reviews */}
        {/* <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Top Reviews</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Excellent service</li>
                  <li>Great prices</li>
                  <li>Easy booking</li>
                  <li>Reliable support</li>
                  <li>Quick response</li>
                </ul>
              </div> 

              {/* Travel by Interest */}
        {/* <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Travel by Interest</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Beach vacations</li>
                  <li>City breaks</li>
                  <li>Adventure travel</li>
                  <li>Luxury getaways</li>
                  <li>Family trips</li>
                </ul>
              </div> */}

        {/* Travel by Price */}
        {/* <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Travel by Price</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Budget deals</li>
                  <li>Mid-range options</li>
                  <li>Premium packages</li>
                  <li>Last minute offers</li>
                  <li>Early bird specials</li>
                </ul>
              </div>

              {/* US Destinations */}
        {/* <div className="space-y-4">
                <h3 className="font-semibold text-foreground">US Destinations</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>New York</li>
                  <li>Los Angeles</li>
                  <li>Miami</li>
                  <li>Las Vegas</li>
                  <li>San Francisco</li>
                </ul>
              </div> */}

        {/* International Destinations */}
        {/* <div className="space-y-4">
                <h3 className="font-semibold text-foreground">International</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Paris</li>
                  <li>London</li>
                  <li>Tokyo</li>
                  <li>Dubai</li>
                  <li>Barcelona</li>
                </ul>
              </div> */}

        {/* Popular Routes */}
        {/* <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Popular Routes</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>NYC to LA</li>
                  <li>London to Paris</li>
                  <li>Dubai to Mumbai</li>
                  <li>SF to Tokyo</li>
                  <li>Miami to Cancun</li>
                </ul>
              </div>
            </div>
          </div>
        </section> */}
      </main>

      <Footer />
    </div>
  );
}
