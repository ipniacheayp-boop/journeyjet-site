import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Share2, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import BlogCard from "@/components/BlogCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getBlogBySlug, getRelatedPosts } from "@/data/blogPosts";
import { toast } from "sonner";

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const post = slug ? getBlogBySlug(slug) : undefined;
  const relatedPosts = slug ? getRelatedPosts(slug, 3) : [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/blog")}>Back to Blog</Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  // Convert markdown-style content to HTML (basic conversion)
  const renderContent = (content: string) => {
    return content.split("\n").map((line, index) => {
      if (line.startsWith("# ")) {
        return (
          <h1 key={index} className="text-3xl font-bold mt-8 mb-4 text-foreground">
            {line.slice(2)}
          </h1>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={index} className="text-2xl font-semibold mt-6 mb-3 text-foreground">
            {line.slice(3)}
          </h2>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <h3 key={index} className="text-xl font-medium mt-4 mb-2 text-foreground">
            {line.slice(4)}
          </h3>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <li key={index} className="ml-6 text-muted-foreground">
            {line.slice(2)}
          </li>
        );
      }
      if (line.match(/^\d+\./)) {
        return (
          <li key={index} className="ml-6 text-muted-foreground list-decimal">
            {line.replace(/^\d+\.\s*/, "")}
          </li>
        );
      }
      if (line.trim() === "") {
        return <br key={index} />;
      }
      // Handle bold text
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = line.split(boldRegex);
      return (
        <p key={index} className="text-muted-foreground leading-relaxed mb-2">
          {parts.map((part, i) =>
            i % 2 === 1 ? (
              <strong key={i} className="text-foreground font-semibold">
                {part}
              </strong>
            ) : (
              part
            ),
          )}
        </p>
      );
    });
  };

  return (
    <>
      <SEOHead
        title={`${post.title} | Tripile.com Blog`}
        description={post.excerpt}
        keywords={post.tags.join(", ")}
        canonicalUrl={`https://tripile.com/blog/${post.slug}`}
        ogType="article"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt,
            image: post.featuredImage,
            datePublished: post.publishedAt,
            dateModified: post.publishedAt,
            author: {
              "@type": "Person",
              name: post.author.name,
              description: post.author.bio,
            },
            publisher: {
              "@type": "Organization",
              name: "Tripile.com",
              url: "https://tripile.com",
              logo: {
                "@type": "ImageObject",
                url: "https://tripile.com/favicon-tripile.png",
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://tripile.com/blog/${post.slug}`,
            },
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
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
              {
                "@type": "ListItem",
                position: 3,
                name: post.title,
                item: `https://tripile.com/blog/${post.slug}`,
              },
            ],
          })}
        </script>
      </Helmet>

      <Header />

      <main className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.35)_28%,hsl(var(--background))_100%)]">
        <section className="relative h-[40vh] overflow-hidden md:h-[50vh]">
          <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/15" />

          <div className="absolute top-4 left-4">
            <Button variant="secondary" size="sm" onClick={() => navigate("/blog")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Button>
          </div>
        </section>

        <article className="container mx-auto px-4 -mt-20 md:-mt-32 relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 rounded-[32px] border border-border/60 bg-card/90 p-6 shadow-[0_30px_90px_-55px_hsl(var(--foreground)/0.36)] backdrop-blur md:p-8">
              <Badge className="mb-4 border-none bg-primary/12 text-primary hover:bg-primary/12">{post.category}</Badge>

              <h1 className="mb-4 text-2xl font-bold text-foreground md:text-4xl">{post.title}</h1>

              <p className="mb-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">{post.summary.hook}</p>

              <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.readTime} min read</span>
                </div>
                <Button variant="ghost" size="sm" className="gap-2 ml-auto" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>

              <div className="flex flex-col gap-6 md:flex-column md:items-start">
                <div className="flex items-center justify-center gap-3 rounded-2xl bg-muted/55 p-4 mx-auto w-full max-w-[600px] text-center">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                    <AvatarFallback>
                      {post.author.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="text-left">
                    <p className="font-medium text-foreground">{post.author.name}</p>
                    <p className="text-sm text-muted-foreground">{post.author.bio}</p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-4 text-center mx-auto">
                  {post.summary.visualStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-border/60 bg-[linear-gradient(180deg,hsl(var(--primary)/0.16),hsl(var(--card)/0.96))] px-4 py-4 min-w-[110px]"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-5 text-foreground">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/8 p-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  Quick takeaway
                </div>
                <p className="mt-2 text-sm leading-6 text-foreground/85">{post.summary.takeaway}</p>
              </div>

              <div className="mt-6 rounded-2xl border border-border/70 bg-muted/55 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Why read this
                </p>
                <ul className="mt-3 space-y-2 text-sm text-foreground/85">
                  {post.summary.highlights.map((item) => (
                    <li key={item} className="flex gap-2 leading-6">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mb-8 rounded-[32px] border border-border/60 bg-card/90 p-6 shadow-[0_30px_90px_-55px_hsl(var(--foreground)/0.24)] backdrop-blur prose prose-slate dark:prose-invert max-w-none md:p-8">
              {renderContent(post.content)}
            </div>

            <div className="mb-8 rounded-[28px] border border-primary/20 bg-primary/8 p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">Call to action</p>
              <p className="mt-3 text-base leading-7 text-foreground/85">{post.summary.ctaText}</p>
              <div className="mt-5">
                <Button asChild className="rounded-full px-6">
                  <Link to="/" onClick={() => window.scrollTo(0, 0)}>
                    Explore Tripile
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mb-12 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Tags:</span>
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </article>

        <Separator className="my-8" />

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="container mx-auto px-4 py-12">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {relatedPosts.map((relatedPost) => (
                <BlogCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
};

export default BlogDetail;
