import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, Sparkles, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BlogPost } from "@/data/blogPosts";

interface BlogCardProps {
  post: BlogPost;
}

const BlogCard = ({ post }: BlogCardProps) => {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="group flex h-[950px] w-full flex-col overflow-hidden border-border/60 bg-card/85 shadow-[0_20px_60px_-30px_hsl(var(--foreground)/0.28)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_-35px_hsl(var(--foreground)/0.36)]">
      {/* Image Section - Fixed Aspect Ratio */}
      <div className="relative shrink-0 overflow-hidden aspect-[16/10]">
        <img
          src={post.featuredImage}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="flex items-center justify-between gap-3">
            <Badge className="border-none bg-background/90 text-foreground hover:bg-background">{post.category}</Badge>
            <div className="rounded-full bg-background/15 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur">
              {post.readTime} min read
            </div>
          </div>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col p-5 md:p-6 overflow-hidden">
        {/* Title - Fixed height for 2 lines */}
        <Link to={`/blog/${post.slug}`}>
          <h3 className="mb-3 text-xl font-semibold leading-tight text-foreground transition-colors group-hover:text-primary line-clamp-2 h-14">
            {post.title}
          </h3>
        </Link>

        {/* Hook - Fixed height for 3 lines */}
        <p className="mb-4 text-sm leading-6 text-muted-foreground line-clamp-3 h-[72px]">{post.summary.hook}</p>

        {/* Metadata */}
        <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground shrink-0">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span className="truncate max-w-[80px]">{post.author.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Main Content Highlights - Fixed height with hidden overflow */}
        <div className="mb-5 h-[160px] rounded-2xl border border-border/70 bg-muted/55 p-4 overflow-y-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Main Content
          </div>
          <ul className="space-y-2 text-sm text-foreground/85">
            {post.summary.highlights.slice(0, 3).map((item) => (
              <li key={item} className="flex gap-2 leading-5">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span className="line-clamp-2">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Visual Stats - Fixed height for the grid */}
        <div className="mb-5 grid grid-cols-3 gap-2 h-24">
          {post.summary.visualStats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col justify-center rounded-2xl border border-border/60 bg-[linear-gradient(180deg,hsl(var(--primary)/0.16),hsl(var(--card)/0.96))] px-2 py-3 text-center"
            >
              <div className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground truncate">
                {stat.label}
              </div>
              <div className="mt-1 text-xs font-semibold text-foreground line-clamp-2">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Takeaway - Fixed height */}
        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/8 p-4 h-28">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">Takeaway</p>
          <p className="mt-2 text-sm leading-5 text-foreground/85 line-clamp-3">{post.summary.takeaway}</p>
        </div>

        {/* CTA Button - Pushed to bottom */}
        <div className="mt-auto">
          <Link to={`/blog/${post.slug}`}>
            <Button size="sm" className="w-full justify-between rounded-full px-5">
              <span>{post.summary.ctaLabel}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogCard;
