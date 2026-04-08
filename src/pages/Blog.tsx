import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { ArrowRight, BookOpen, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import BlogCard from "@/components/BlogCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { blogPosts, getCategories } from "@/data/blogPosts";

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = getCategories();

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory ? post.category === selectedCategory : true;

    return matchesSearch && matchesCategory;
  });

  const [featuredPost, ...gridPosts] = filteredPosts;

  return (
    <>
      <SEOHead
        title="Travel Blog | Tripile.com - Tips, Guides & Inspiration"
        description="Explore our travel blog for expert tips, destination guides, flight deals, and travel inspiration. Plan your next adventure with insider knowledge from Tripile.com."
        keywords="travel blog, travel tips, destination guides, flight deals, travel inspiration, budget travel, Tripile blog"
        canonicalUrl="https://tripile.com/blog"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Tripile Travel Blog",
            description: "Expert travel tips, destination guides, and flight deal insights from Tripile.com.",
            url: "https://tripile.com/blog",
            publisher: {
              "@type": "Organization",
              name: "Tripile.com",
              url: "https://tripile.com",
            },
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://tripile.com/",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Blog",
                  item: "https://tripile.com/blog",
                },
              ],
            },
          })}
        </script>
      </Helmet>

      <Header />

      <main className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.4)_22%,hsl(var(--background))_100%)]">
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.16),transparent_34%),radial-gradient(circle_at_top_right,hsl(var(--gold)/0.12),transparent_28%),linear-gradient(180deg,hsl(var(--background)/0.94),hsl(var(--muted)/0.5))]" />
          <div className="container relative mx-auto px-4 py-16 md:py-24">
            <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary shadow-sm backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5" />
                  Fresh travel reads
                </div>
                <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                  <span className="text-primary">Blog</span> stories designed to be read fast and shared easily.
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                  Clear hooks, practical tips, visual summaries, and smart travel takeaways all in one place.
                </p>

                <div className="relative mt-8 max-w-xl">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 z-10 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search guides, destinations, or travel topics"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-14 rounded-full border-border/70 bg-card/85 pl-12 pr-4 text-base shadow-sm backdrop-blur"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-[28px] border border-border/60 bg-card/80 p-6 shadow-[0_25px_70px_-40px_hsl(var(--foreground)/0.34)] backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Library</p>
                  <p className="mt-3 text-3xl font-bold text-foreground">{blogPosts.length}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Editorial blog cards refreshed with hooks, highlights, and visual summaries.
                  </p>
                </div>
                <div className="rounded-[28px] border border-primary/20 bg-primary/90 p-6 text-primary-foreground shadow-[0_25px_70px_-40px_hsl(var(--primary)/0.55)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground/80">Topics</p>
                  <p className="mt-3 text-3xl font-bold">{categories.length}</p>
                  <p className="mt-2 text-sm leading-6 text-primary-foreground/85">
                    Browse travel tips, destinations, and trend-focused stories without the clutter.
                  </p>
                </div>
                <div className="rounded-[28px] border border-gold/25 bg-gold/10 p-6 shadow-[0_25px_70px_-40px_hsl(var(--gold)/0.3)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">Content Flow</p>

                  <p className="mt-3 text-lg font-semibold text-foreground">Hook → Value → Proof → CTA</p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    A structured flow that captures attention, delivers value, builds trust, and drives action.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sticky top-0 z-20 border-b border-border/60 bg-background/75 backdrop-blur">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-2 text-sm font-medium text-muted-foreground">Browse by:</span>
              <Badge
                variant={selectedCategory === null ? "default" : "outline"}
                className="cursor-pointer rounded-full px-4 py-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Badge>
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer rounded-full px-4 py-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            {filteredPosts.length > 0 ? (
              <div className="space-y-12">
                {featuredPost && (
                  <div className="overflow-hidden rounded-[32px] border border-border/60 bg-card/85 shadow-[0_30px_90px_-50px_hsl(var(--foreground)/0.34)] backdrop-blur">
                    <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
                      <div className="relative min-h-[320px] overflow-hidden">
                        <img
                          src={featuredPost.featuredImage}
                          alt={featuredPost.title}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
                        <div className="absolute left-6 top-6">
                          <Badge className="border-none bg-background/90 text-foreground hover:bg-background">
                            Editor's pick
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-col justify-center p-6 md:p-10">
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-foreground">
                            <BookOpen className="h-4 w-4" />
                            {featuredPost.category}
                          </span>
                          <span>{featuredPost.readTime} min read</span>
                        </div>

                        <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                          {featuredPost.title}
                        </h2>
                        <p className="mt-4 text-base leading-7 text-muted-foreground">{featuredPost.summary.hook}</p>

                        <div className="mt-6 grid gap-3 sm:grid-cols-3">
                          {featuredPost.summary.visualStats.map((stat) => (
                            <div key={stat.label} className="rounded-2xl border border-border/60 bg-muted/55 px-4 py-4">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                                {stat.label}
                              </p>
                              <p className="mt-2 text-sm font-semibold text-foreground">{stat.value}</p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/8 p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                            Quick takeaway
                          </p>
                          <p className="mt-2 text-sm leading-6 text-foreground/85">{featuredPost.summary.takeaway}</p>
                        </div>

                        <div className="mt-7">
                          <Button asChild className="rounded-full px-6">
                            <Link to={`/blog/${featuredPost.slug}`} className="inline-flex items-center gap-2">
                              Read featured story
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {gridPosts.length > 0 && (
                  <div>
                    <div className="mb-6 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                          Latest reads
                        </p>
                        <h2 className="mt-2 text-2xl font-bold text-foreground">
                          Practical travel stories with stronger visual rhythm
                        </h2>
                      </div>
                      <p className="text-sm text-muted-foreground">{gridPosts.length} articles</p>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {gridPosts.map((post) => (
                        <BlogCard key={post.id} post={post} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-border bg-card/70 py-16 text-center shadow-sm">
                <p className="text-lg text-muted-foreground">No articles found matching your search.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Blog;
