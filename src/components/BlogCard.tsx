import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCategoryBadgeColor, cn } from "@/lib/utils";
import type { BlogPost } from "@/data/blogPosts";

interface BlogCardProps {
  post: BlogPost;
}

const BlogCard = ({ post }: BlogCardProps) => {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Card className="group flex flex-col h-full overflow-hidden border-border/40 bg-card/60 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/5 rounded-[32px]">
      {/* Image Section */}
      <div className="relative shrink-0 overflow-hidden aspect-[16/10] sm:aspect-[4/3] lg:aspect-[16/10]">
        <img
          src={post.featuredImage}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />
        <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <Badge
              className={cn(
                "border font-semibold uppercase tracking-wider text-[10px] px-3 py-1.5 backdrop-blur-sm shadow-sm transition-colors",
                getCategoryBadgeColor(post.category),
              )}
            >
              {post.category}
            </Badge>
            <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-md border border-white/10">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime} min
            </div>
          </div>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col p-6 lg:p-7">
        {/* Title */}
        <Link to={`/blog/${post.slug}`} className="group-hover:text-primary transition-colors">
          <h3 className="mb-4 text-[19px] sm:text-xl font-bold leading-snug text-foreground line-clamp-2">
            {post.title}
          </h3>
        </Link>

        {/* Hook / Excerpt */}
        <p className="mb-6 text-[15px] leading-relaxed text-muted-foreground line-clamp-3">
          {post.summary.hook || post.excerpt}
        </p>

        {/* Metadata Footer */}
        <div className="mt-auto pt-5 border-t border-border/50">
          <div className="mb-5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border/50">
                <User className="w-3 h-3 text-foreground/50" />
              </div>
              <span className="truncate max-w-[100px] text-foreground/70">{post.author.name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-foreground/60">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <Link to={`/blog/${post.slug}`} className="block">
            <Button
              variant="outline"
              className="w-full justify-between rounded-full px-5 border-border/60 hover:border-primary/50 hover:bg-primary/5 group/btn transition-all h-12"
            >
              <span className="font-semibold text-[13px] tracking-wide text-foreground">Read Article</span>
              <div className="w-7 h-7 rounded-full bg-background flex items-center justify-center shadow-sm group-hover/btn:bg-primary group-hover/btn:text-primary-foreground transition-colors">
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
              </div>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogCard;
