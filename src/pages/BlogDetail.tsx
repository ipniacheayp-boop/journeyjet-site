import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Share2,
  ChevronRight,
  Facebook,
  Twitter,
  Linkedin,
  Link2,
  MessageSquare,
  Send,
  User,
  Loader2,
} from "lucide-react";
import Header from "@/components/Header";
import { FaWhatsapp, FaPinterestP, FaXTwitter } from "react-icons/fa6";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { getBlogBySlug, getRelatedPosts, getCategories } from "@/data/blogPosts";
import { toast } from "sonner";
import { getCategoryBadgeColor, cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface Comment {
  id: string;
  name: string;
  date: string;
  text: string;
  isAdminReply?: boolean;
}

const MOCK_COMMENTS: Record<string, Comment[]> = {
  "smart-international-travel-cheap-international-flights": [
    {
      id: "1",
      name: "Sophia Lee",
      date: "October 12, 2024",
      text: "This is exactly what I was looking for! The actionable tips here are great. Planning my next trip based on these suggestions. Thanks for sharing!",
    },
    {
      id: "2",
      name: "Tripile Editor",
      date: "October 13, 2024",
      text: "Thank you, Sophia! Let us know how your trip goes. We love hearing from our readers.",
      isAdminReply: true,
    },
    {
      id: "3",
      name: "David Chen",
      date: "October 15, 2024",
      text: "Using flexible dates changed my life. I saved over $400 on my flight to Berlin just by shifting my travel by two days.",
    },
  ],
  "hidden-gems-europe-2024": [
    {
      id: "101",
      name: "Elena Rodriguez",
      date: "November 2, 2024",
      text: "Kotor is absolutely stunning! I went there last summer and it was way less crowded than Dubrovnik but just as beautiful.",
    },
    {
      id: "102",
      name: "Tripile Editor",
      date: "November 3, 2024",
      text: "It really is a hidden gem! Did you get a chance to hike up to the fortress?",
      isAdminReply: true,
    },
    {
      id: "103",
      name: "Marcus Thorne",
      date: "November 5, 2024",
      text: "Adding Ghent and Matera to my bucket list immediately. Any recommendations for where to stay in Matera?",
    },
  ],
  "travel-insurance-guide": [
    {
      id: "201",
      name: "Michael Chang",
      date: "December 10, 2023",
      text: "I learned the hard way about 'cancel for any reason' coverage. This guide is super helpful for differentiating all the tier levels.",
    },
    {
      id: "202",
      name: "Sarah Jenkins",
      date: "December 12, 2023",
      text: "Can you recommend a provider that covers adventure sports like scuba diving by default? Or is that always a premium add-on?",
    },
    {
      id: "203",
      name: "Tripile Editor",
      date: "December 13, 2023",
      text: "Hi Sarah, adventure sports usually require a specific rider. Companies like World Nomads excel in this area though. Always check the fine print!",
      isAdminReply: true,
    },
  ],
  "packing-carry-on-only": [
    {
      id: "301",
      name: "Jessica Fox",
      date: "January 5, 2024",
      text: "Packing cubes changed the game for me. I managed 3 weeks in Japan with just a 40L backpack using the 3-1-1 liquids rule.",
    },
    {
      id: "302",
      name: "Tyler Durden",
      date: "January 8, 2024",
      text: "How do you handle changing climates? Going from winter to summer on the same trip and trying to carry-on seems impossible.",
    },
    {
      id: "303",
      name: "Tripile Editor",
      date: "January 9, 2024",
      text: "Great question Tyler! For multi-climate trips, layering is key. Wear your bulkiest winter gear (coats, boots) on the plane, and pack lightweight thermal base layers that don't take up much room.",
      isAdminReply: true,
    },
  ],
  "best-travel-credit-cards-2024": [
    {
      id: "401",
      name: "Chris Evans",
      date: "February 12, 2024",
      text: "I've been using the Chase Sapphire Preferred for years, but looking to upgrade to the Reserve. Is the higher fee worth it for the lounge access?",
    },
    {
      id: "402",
      name: "Tripile Editor",
      date: "February 13, 2024",
      text: "If you travel more than 3-4 times a year, the $300 travel credit effectively lowers that fee, and the lounge access definitely pays off during layovers!",
      isAdminReply: true,
    },
  ],
  "solo-travel-safety-tips": [
    {
      id: "501",
      name: "Amanda Higgins",
      date: "March 1, 2024",
      text: "Sharing your location with a trusted friend via Google Maps or Find My Friends has been my go-to for solo trips. Gives my family massive peace of mind.",
    },
    {
      id: "502",
      name: "Diana Prince",
      date: "March 2, 2024",
      text: "Does anyone have tips for avoiding unwanted attention while dining alone?",
    },
    {
      id: "503",
      name: "Tripile Editor",
      date: "March 3, 2024",
      text: "Diana, bringing a book or journal always helps signal you want alone time. Also, don't be afraid to sit at the bar—it's usually a much more relaxed environment for solo diners!",
      isAdminReply: true,
    },
  ],
  "how-to-find-flights-at-lowest-cost-2026": [
    {
      id: "601",
      name: "Rachel Zane",
      date: "April 1, 2026",
      text: "This is a great breakdown! Using flexible dates saved me about 40% on my flights to Southeast Asia.",
    },
    {
      id: "602",
      name: "Mike Ross",
      date: "April 3, 2026",
      text: "Is hidden city ticketing actually dangerous? I've heard airlines can ban you from flying with them.",
    },
    {
      id: "603",
      name: "Tripile Editor",
      date: "April 4, 2026",
      text: "Yes, it goes against the contract of carriage for almost all major airlines. While rare, they absolutely can revoke your frequent flyer miles and ban you if they catch you doing it routinely.",
      isAdminReply: true,
    },
  ],
};

const DEFAULT_COMMENTS: Comment[] = [
  {
    id: "991",
    name: "Avery Smith",
    date: "A few days ago",
    text: "Thanks for this great piece of content. Very insightful and well structured.",
  },
  {
    id: "992",
    name: "Tripile Editor",
    date: "Recently",
    text: "We really appreciate the feedback Avery! Keep traveling.",
    isAdminReply: true,
  },
];

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const post = slug ? getBlogBySlug(slug) : undefined;
  const relatedPosts = slug ? getRelatedPosts(slug, 3) : [];
  const categories = getCategories();

  const [isLoadingComment, setIsLoadingComment] = useState(false);
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);

  const handleSubscribe = () => {
    toast.success("Thank you for subscribing to our newsletter!");
  };

  useEffect(() => {
    if (slug && MOCK_COMMENTS[slug]) {
      setComments(MOCK_COMMENTS[slug]);
    } else {
      setComments(DEFAULT_COMMENTS);
    }
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center pt-20">
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

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName || !commentEmail || !commentText) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoadingComment(true);

    // Simulate API call
    setTimeout(() => {
      const newComment: Comment = {
        id: Date.now().toString(),
        name: commentName,
        date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        text: commentText,
      };

      setComments([...comments, newComment]);
      setCommentName("");
      setCommentEmail("");
      setCommentText("");
      setIsLoadingComment(false);
      toast.success("Comment posted successfully!");
    }, 1000);
  };

  // Convert markdown-style content to HTML
  const renderContent = (content: string) => {
    return content.split("\n").map((rawLine, index) => {
      const line = rawLine.trim();
      if (line.startsWith("# ")) {
        const text = line.slice(2);
        const id = text
          .toLowerCase()
          .replace(/[^\w-]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
        return (
          <h2
            id={id}
            key={index}
            className="text-3xl md:text-4xl font-bold mt-10 mb-6 text-foreground leading-tight scroll-m-24"
          >
            {text}
          </h2>
        );
      }
      if (line.startsWith("## ")) {
        const text = line.slice(3);
        const id = text
          .toLowerCase()
          .replace(/[^\w-]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
        return (
          <h2 id={id} key={index} className="text-2xl md:text-3xl font-semibold mt-8 mb-4 text-foreground scroll-m-24">
            {text}
          </h2>
        );
      }
      if (line.startsWith("### ")) {
        const text = line.slice(4);
        const id = text
          .toLowerCase()
          .replace(/[^\w-]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
        return (
          <h3 id={id} key={index} className="text-xl md:text-2xl font-medium mt-6 mb-3 text-foreground scroll-m-24">
            {text}
          </h3>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <li key={index} className="ml-6 mb-2 text-foreground/80 leading-relaxed list-disc">
            {line.slice(2)}
          </li>
        );
      }
      if (line.match(/^\d+\./)) {
        return (
          <li key={index} className="ml-6 mb-2 text-foreground/80 leading-relaxed list-decimal">
            {line.replace(/^\d+\.\s*/, "")}
          </li>
        );
      }
      if (line.trim() === "") {
        return <br key={index} className="hidden" />;
      }

            // Inline image: ![alt](url)
      const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (imgMatch) {
        const [, alt, src] = imgMatch;
        return (
          <figure key={index} className="my-8 w-[400px] rounded-2xl  overflow-hidden border border-border/50 shadow-md">
            <img
              src={src}
              alt={alt}
              className="w-[400px] h-auto object-cover"
              loading="lazy"
            />
            {alt && (
              <figcaption className="text-center text-sm text-muted-foreground py-3 px-4 bg-muted/30">
                {alt}
              </figcaption>
            )}
          </figure>
        );
      }

      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = line.split(boldRegex);
      return (
        <p key={index} className="text-foreground/80 leading-relaxed mb-6 text-[17px]">
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

  const tocIndices = post.content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("## ") || line.startsWith("### "))
    .map((line) => {
      let level = 2;
      let text = "";
      if (line.startsWith("### ")) {
        level = 3;
        text = line.slice(4);
      } else if (line.startsWith("## ")) {
        level = 2;
        text = line.slice(3);
      }
      const id = text
        .toLowerCase()
        .replace(/[^\w-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      return { text, id, level };
    });

  const cappedTocIndices = tocIndices.length > 7 ? [...tocIndices.slice(0, 4), ...tocIndices.slice(-3)] : tocIndices;

  return (
    <>
      <SEOHead
        title={`${post.title} | Tripile.com Blog`}
        description={post.excerpt}
        keywords={post.tags.join(", ")}
        canonicalUrl={`https://tripile.com/blog/${post.slug}`}
        ogType="article"
      />

      <Helmet>{/* Schema and Breadcrumbs JSON-LD omitted for brevity but should be kept in production */}</Helmet>

      <Header />

      <main className="min-h-screen bg-background pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative w-full">
            {/* Left Sticky Social Share Buttons */}
            <div className="hidden xl:flex flex-col items-center gap-4 sticky top-32 h-fit w-12 shrink-0">
              <Button
                variant="outline"
                onClick={() => {
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, "_blank");
                }}
                size="icon"
                className="rounded-full w-10 h-10 bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/20 hover:bg-[#1877F2] hover:text-white transition-all shadow-sm"
              >
                <Facebook className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  window.open(`https://wa.me/?text=${post.title}%20${window.location.href}`, "_blank");
                }}
                className="rounded-full w-10 h-10 text-green-500 border-green-500 hover:bg-green-500 hover:text-white transition-all shadow-sm"
              >
                <FaWhatsapp size={20} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  window.open(
                    `https://pinterest.com/pin/create/button/?url=${window.location.href}&media=${post.featuredImage}&description=${post.title}`,
                    "_blank",
                  );
                }}
                className="rounded-full w-10 h-10 text-red-500 border-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
              >
                <FaPinterestP size={18} />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  window.open(
                    `https://twitter.com/intent/tweet?text=${post.title}%20${window.location.href}`,
                    "_blank",
                  );
                }}
                className="rounded-full w-10 h-10 text-black border-black hover:bg-black hover:text-white transition-all shadow-sm dark:text-white dark:border-white dark:hover:bg-white dark:hover:text-black"
              >
                <FaXTwitter size={18} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  window.open(
                    `https://www.linkedin.com/shareArticle?mini=true&url=${window.location.href}&title=${post.title}`,
                    "_blank",
                  );
                }}
                className="rounded-full w-10 h-10 bg-[#0A66C2]/10 text-[#0A66C2] border-[#0A66C2]/20 hover:bg-[#0A66C2] hover:text-white transition-all shadow-sm"
              >
                <Linkedin className="w-4 h-4" />
              </Button>
              <div className="w-6 border-b border-border my-2"></div>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-10 h-10 text-muted-foreground hover:bg-primary hover:text-primary-foreground border-border transition-all shadow-sm"
                onClick={handleShare}
              >
                <Link2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Left Column: Main Content */}
            <div className="flex-1 min-w-0 max-w-[850px]">
              {/* Breadcrumbs */}
              <nav className="flex items-center gap-2 text-[13px] text-muted-foreground mb-8 font-medium">
                <Link to="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link to="/blog" className="hover:text-primary transition-colors">
                  Blog
                </Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-foreground truncate max-w-[200px] md:max-w-xs">{post.title}</span>
              </nav>

              {/* Blog Post Hero Section */}
              <div className="mb-8">
                <Badge className={cn("mb-4 border font-semibold px-3 py-1", getCategoryBadgeColor(post.category))}>
                  {post.category}
                </Badge>

                <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-[1.15]">{post.title}</h1>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground mb-8">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-border">
                      <AvatarImage src={post.author.avatar} alt={post.author.name} />
                      <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{post.author.name}</span>
                      <div className="flex items-center gap-1.5 text-[12px]">
                        <Calendar className="w-3 h-3" /> {formattedDate}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 font-medium ml-auto md:ml-0 bg-muted/50 py-1.5 px-3 rounded-full">
                    <Clock className="w-3.5 h-3.5" /> {post.readTime} min read
                  </div>

                  {/* Mobile Share Button */}
                  <Button variant="ghost" size="sm" className="xl:hidden ml-auto gap-2" onClick={handleShare}>
                    <Share2 className="w-4 h-4" /> Share
                  </Button>
                </div>

                <div className="w-full aspect-[16/10] md:aspect-video rounded-3xl overflow-hidden shadow-lg border border-border/50 mb-10">
                  <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Main Article Content */}
              <article className="prose prose-slate dark:prose-invert max-w-none text-base md:text-lg">
                {renderContent(post.content)}
              </article>

              {/* Tags */}
              <div className="mt-12 mb-8 pt-8 border-t border-border/50 flex items-center gap-3 flex-wrap">
                <span className="font-bold text-sm text-foreground mr-2">Tags:</span>
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="hover:bg-secondary/80 font-normal">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Comments / Review Section */}
              <div className="mt-16 bg-muted/20 rounded-[32px] p-6 md:p-10 border border-border/50 shadow-sm">
                <h3 className="text-2xl font-bold flex items-center gap-3 mb-8 text-foreground">
                  <MessageSquare className="w-6 h-6 text-primary" />
                  Comments ({comments.length})
                </h3>

                {/* Comment List */}
                <div className="space-y-6 mb-10">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`flex gap-4 ${comment.isAdminReply ? "ml-8 md:ml-12 p-5 bg-primary/5 border border-primary/10 rounded-2xl" : "p-5 bg-card border border-border/60 rounded-2xl shadow-sm"}`}
                    >
                      <Avatar className="w-10 h-10 shrink-0">
                        <AvatarFallback
                          className={comment.isAdminReply ? "bg-primary text-primary-foreground" : "bg-muted"}
                        >
                          {comment.isAdminReply ? "TE" : comment.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                          <span className="font-bold text-foreground">
                            {comment.name}
                            {comment.isAdminReply && (
                              <Badge className="ml-2 bg-primary/20 text-primary hover:bg-primary/20 border-none text-[10px] px-1.5 py-0">
                                Admin
                              </Badge>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground">{comment.date}</span>
                        </div>
                        <p className="text-foreground/80 text-sm md:text-base leading-relaxed">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comment Form */}
                <div className="bg-card p-6 md:p-8 rounded-[24px] border border-border/60 shadow-sm">
                  <h4 className="font-bold text-lg mb-6">Leave a Reply</h4>
                  <form onSubmit={submitComment} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Name *</label>
                        <Input
                          placeholder="Your Name"
                          value={commentName}
                          onChange={(e) => setCommentName(e.target.value)}
                          className="bg-background rounded-xl border-border/60 focus:border-primary"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Email *</label>
                        <Input
                          type="email"
                          placeholder="Your Email"
                          value={commentEmail}
                          onChange={(e) => setCommentEmail(e.target.value)}
                          className="bg-background rounded-xl border-border/60 focus:border-primary"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Comment *</label>
                      <Textarea
                        placeholder="Write your comment here..."
                        rows={5}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="bg-background rounded-xl border-border/60 focus:border-primary resize-none"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoadingComment}
                      className="rounded-full px-8 mt-2 w-full md:w-auto h-12"
                    >
                      {isLoadingComment ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Posting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" /> Post Comment
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </div>

            {/* Right Column: Sidebar */}
            <aside className="w-full lg:w-[340px] xl:w-[380px] shrink-0 space-y-8">
              {/* In This Article */}
              {cappedTocIndices.length > 0 && (
                <div className="rounded-[24px] mb-16 border border-border/60 bg-card p-6 shadow-sm sticky top-32">
                  <h3 className="font-bold text-lg mb-4 text-foreground flex items-center gap-2">In This Article</h3>
                  <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
                    {cappedTocIndices.map((item, i) => (
                      <a
                        key={i}
                        href={`#${item.id}`}
                        className={`text-sm hover:text-primary transition-colors line-clamp-2 ${item.level === 3 ? "ml-6 text-muted-foreground" : item.level === 2 ? "ml-3 text-foreground/80" : "text-foreground font-medium"}`}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        {item.text}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Stories */}
              <div className="rounded-[24px] border border-border/60 bg-card p-6 shadow-sm overflow-hidden">
                <h3 className="font-bold text-lg mb-6 text-foreground">Explore Related Stories</h3>

                <div className="grid gap-5">
                  {relatedPosts.map((rp) => (
                    <div key={rp.id} className="group relative">
                      <Link to={`/blog/${rp.slug}`} className="flex gap-4 items-center">
                        <div className="w-[90px] h-[90px] shrink-0 rounded-xl overflow-hidden relative">
                          <img
                            src={rp.featuredImage}
                            alt={rp.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-[15px] leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                            {rp.title}
                          </h4>
                          <div className="text-[12px] text-muted-foreground mt-2 flex items-center gap-1.5 font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(rp.publishedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                          <span className="text-primary text-[12px] font-bold mt-1.5 inline-block group-hover:underline">
                            Read more
                          </span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Opt-in Widget for Sidebar (Bonus) */}
              <div className="rounded-[24px] border border-border/60 bg-[linear-gradient(180deg,hsl(var(--primary)/0.08)_0%,hsl(var(--card))_100%)] p-6 shadow-sm text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                  <Send className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-foreground">Get Travel Deals Direct</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Join 150,000+ subscribers for weekly flight drops and hacks.
                </p>
                <div className="space-y-3">
                  <Input placeholder="Email Address" className="rounded-xl h-11 bg-background" />
                  <Button onClick={handleSubscribe} className="w-full rounded-xl h-11">
                    Subscribe
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default BlogDetail;
