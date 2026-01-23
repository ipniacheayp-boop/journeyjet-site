import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User, Share2 } from "lucide-react";
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
            <p className="text-muted-foreground mb-6">
              The article you're looking for doesn't exist.
            </p>
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
    return content
      .split("\n")
      .map((line, index) => {
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
              )
            )}
          </p>
        );
      });
  };

  return (
    <>
      <SEOHead
        title={`${post.title} | ChyeapFlights Blog`}
        description={post.excerpt}
        keywords={post.tags.join(", ")}
        canonicalUrl={`https://chyeap.lovable.app/blog/${post.slug}`}
        ogType="article"
      />

      <Header />

      <main className="min-h-screen bg-background">
        {/* Hero Image */}
        <section className="relative h-[40vh] md:h-[50vh] overflow-hidden">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          
          {/* Back Button */}
          <div className="absolute top-4 left-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("/blog")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Button>
          </div>
        </section>

        {/* Article Content */}
        <article className="container mx-auto px-4 -mt-20 md:-mt-32 relative z-10">
          <div className="max-w-3xl mx-auto">
            {/* Article Header */}
            <div className="bg-card rounded-lg shadow-lg p-6 md:p-8 mb-8">
              <Badge className="mb-4">{post.category}</Badge>
              
              <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
                {post.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.readTime} min read</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 ml-auto"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback>
                    {post.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{post.author.name}</p>
                  <p className="text-sm text-muted-foreground">{post.author.bio}</p>
                </div>
              </div>
            </div>

            {/* Article Body */}
            <div className="bg-card rounded-lg shadow-lg p-6 md:p-8 mb-8 prose prose-slate max-w-none">
              {renderContent(post.content)}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-12">
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
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              Related Articles
            </h2>
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
