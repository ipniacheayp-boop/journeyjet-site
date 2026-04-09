import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { ArrowRight, BookOpen, Search, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import BlogCard from "@/components/BlogCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { blogPosts, getCategories } from "@/data/blogPosts";
import { getCategoryBadgeColor, cn } from "@/lib/utils";

const Blog = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>((location.state as any)?.category || null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = getCategories();

  const filteredPosts = blogPosts
    .filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory ? post.category === selectedCategory : true;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

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
        <section className="relative overflow-hidden border-b border-border/40 mt-16 pb-10">
          {/* Subtle Dynamic Background Gradients */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_50%),radial-gradient(circle_at_bottom_right,hsl(var(--gold)/0.08),transparent_40%),linear-gradient(180deg,hsl(var(--background)/1)_0%,transparent_100%)]" />

          <div className="container relative mx-auto px-4 py-20 md:py-28">
            <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
              {/* Left Content */}
              <div className="max-w-3xl">
                <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-primary shadow-sm backdrop-blur-md">
                  <Sparkles className="h-4 w-4" />
                  The Tripile Editorial
                </div>

                <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl leading-[1.1]">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
                    Stories to fuel
                  </span>{" "}
                  <br className="hidden md:block" />
                  <span className="opacity-90">your next adventure.</span>
                </h1>

                <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                  Dive into our collection of expert destination guides, flight dropping hacks, and curated itineraries
                  built for travelers who refuse to settle for ordinary.
                </p>

                {/* Search Bar Refinement */}
                <div className="relative mt-10 max-w-xl group ">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-primary/10 rounded-[32px] blur opacity-40 group-hover:opacity-70 transition duration-500" />
                  <div className="relative flex items-center bg-card/60 backdrop-blur-xl border border-border/80 hover:border-primary/50 transition-colors rounded-[32px] shadow-sm h-16">
                    <Search className="absolute left-6 text-muted-foreground w-5 h-5 transition-colors group-hover:text-primary" />
                    <Input
                      type="text"
                      placeholder="Search for guides, destinations, or topics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-full bg-transparent border-none outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none focus-visible:ring-offset-0 pl-16 pr-6 text-[15px] shadow-none placeholder:text-muted-foreground/70"
                    />
                  </div>
                </div>
              </div>

              {/* Right Content Bento Box */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                {/* Library Card */}
                <div className="group relative rounded-[32px] border border-border/50 bg-gradient-to-br from-card/80 to-card/20 p-7 shadow-sm backdrop-blur-md transition-all hover:border-border hover:shadow-md">
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                    Library
                  </p>
                  <p className="text-4xl font-bold text-foreground tracking-tight">{blogPosts.length}</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground/90">
                    Curated editorial articles spanning across global destinations.
                  </p>
                </div>

                {/* Topics Card */}
                <div className="group relative rounded-[32px] border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-7 shadow-sm backdrop-blur-md transition-all hover:border-primary/30 hover:shadow-md">
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Search className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-primary/80 mb-4">Topics</p>
                  <p className="text-4xl font-bold text-foreground tracking-tight">{categories.length}</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-foreground/70">
                    Discover targeted travel tips and trend-focused stories.
                  </p>
                </div>

                {/* Content Flow Card (Spans two columns) */}
                <div className="sm:col-span-2 group relative overflow-hidden rounded-[32px] border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent p-7 shadow-sm backdrop-blur-md transition-all hover:border-gold/40">
                  <div className="absolute right-0 top-0 w-64 h-64 bg-gold/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gold mb-3">Content Engine</p>
                  <div className="flex items-center gap-2 text-foreground font-semibold text-[15px] sm:text-[17px]">
                    Hook <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    Value <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    Proof <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    Action
                  </div>
                  <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground max-w-sm">
                    Our structured flow captures attention, delivers immense value reliably, builds unshakeable trust,
                    and drives action.
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
                  <div className="overflow-hidden rounded-[24px] border border-border/60 bg-card/85 shadow-md backdrop-blur">
                    <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
                      <div className="relative min-h-[240px] lg:min-h-full overflow-hidden">
                        <img
                          src={featuredPost.featuredImage}
                          alt={featuredPost.title}
                          className="absolute inset-0 h-full w-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:bg-gradient-to-r lg:from-black/80 lg:via-black/20 lg:to-transparent" />
                        <div className="absolute left-6 top-6">
                          <Badge className="border-none bg-background/90 text-foreground hover:bg-background shadow-sm">
                            Editor's pick
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-col justify-center p-6 md:p-8">
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span
                            className={cn(
                              "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-semibold text-xs",
                              getCategoryBadgeColor(featuredPost.category),
                            )}
                          >
                            <BookOpen className="h-3.5 w-3.5" />
                            {featuredPost.category}
                          </span>
                          <span className="text-xs font-medium">{featuredPost.readTime} min read</span>
                        </div>

                        <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                          {featuredPost.title}
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                          {featuredPost.summary.hook}
                        </p>

                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                          {featuredPost.summary.visualStats.map((stat) => (
                            <div key={stat.label} className="rounded-xl border border-border/60 bg-muted/40 px-3 py-3">
                              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                {stat.label}
                              </p>
                              <p className="mt-1.5 text-sm font-semibold text-foreground">{stat.value}</p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                            Quick takeaway
                          </p>
                          <p className="mt-1.5 text-sm leading-relaxed text-foreground/85 line-clamp-2">
                            {featuredPost.summary.takeaway}
                          </p>
                        </div>

                        <div className="mt-6">
                          <Button asChild size="sm" className="rounded-full px-5 h-10">
                            <Link to={`/blog/${featuredPost.slug}`} className="inline-flex items-center gap-2">
                              Read featured story
                              <ArrowRight className="h-3.5 w-3.5" />
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
