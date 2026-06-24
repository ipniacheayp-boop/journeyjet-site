import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface RelatedLinkItem {
  label: string;
  href: string;
  sublabel?: string;
}

interface RelatedLinksProps {
  title?: string;
  description?: string;
  links: RelatedLinkItem[];
  /** Tailwind grid columns at md breakpoint. Defaults to 3. */
  columns?: 2 | 3;
}

/**
 * Reusable internal-linking / related-content widget.
 * Drives crawl depth and link equity between programmatic SEO pages
 * (city guides, country guides, route pages, hotels, car rentals).
 */
const RelatedLinks = ({
  title = "Related travel guides",
  description,
  links,
  columns = 3,
}: RelatedLinksProps) => {
  if (!links || links.length === 0) return null;

  const gridCols = columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="py-8" aria-label={title}>
      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1.5">{title}</h2>
      {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
      <nav aria-label={title}>
        <ul className={`grid grid-cols-1 ${gridCols} gap-3`} role="list">
          {links.map((link) => (
            <li key={link.href + link.label}>
              <Card className="h-full">
                <Link
                  to={link.href}
                  title={link.label}
                  className="group flex items-center justify-between gap-3 p-4 rounded-lg hover:bg-accent/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {link.label}
                    </span>
                    {link.sublabel && (
                      <span className="block text-xs text-muted-foreground truncate">{link.sublabel}</span>
                    )}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
};

export default RelatedLinks;
