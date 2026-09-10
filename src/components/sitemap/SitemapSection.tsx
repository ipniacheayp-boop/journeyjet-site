import { ReactNode } from "react";

interface SitemapSectionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}

const SitemapSection = ({ title, icon, children }: SitemapSectionProps) => (
  <section className="mb-10">
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
    </div>
    {children}
  </section>
);

export default SitemapSection;
