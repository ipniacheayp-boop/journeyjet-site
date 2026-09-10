import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, ExternalLink, Sparkles, Building2, Briefcase } from "lucide-react";
import type { JobRole } from "@/data/careerRoles";

const GOOGLE_FORM_BASE =
  "https://docs.google.com/forms/d/e/1FAIpQLSeevvCiJ7JO6iQe9NkKQBgWJYrYOYYdJVUcTuS7SU36JFtSGg/viewform?usp=dialog";

interface JobCardProps {
  role: JobRole;
}

const getDepartmentColor = (dept: string) => {
  switch (dept.toLowerCase()) {
    case "engineering":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "product":
      return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    case "design":
      return "bg-pink-500/10 text-pink-500 border-pink-500/20";
    case "marketing":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "customer support":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "sales":
      return "bg-coral/10 text-coral border-coral/20";
    default:
      return "bg-primary/10 text-primary border-primary/20";
  }
};

const JobCard = ({ role }: JobCardProps) => {
  const applyUrl = `${GOOGLE_FORM_BASE}&entry.123456=${encodeURIComponent(role.title)}`;

  return (
    <Card className="group relative overflow-hidden border border-border/50 bg-card hover:bg-card/80 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 rounded-[24px]">
      {/* Decorative Gradient Background on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {role.isHot && (
        <div className="absolute top-4 right-4">
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 gap-1.5 shadow-sm animate-pulse">
            <Briefcase className="w-3 h-3" />
            Priority
          </Badge>
        </div>
      )}

      <CardContent className="p-6 flex flex-col h-full relative z-10">
        <div className="mb-4">
          <Badge
            variant="outline"
            className={`mb-3 px-3 py-1 font-semibold text-[11px] border ${getDepartmentColor(role.department)}`}
          >
            {role.department}
          </Badge>
          <h3 className="font-bold text-xl text-foreground leading-tight pr-6 group-hover:text-primary transition-colors">
            {role.title}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-5 text-sm font-medium text-muted-foreground">
          <span className="flex items-center gap-1.5 bg-muted/40 px-2.5 py-1 rounded-md border border-border/40">
            <MapPin className="w-4 h-4 text-primary/70" />
            {role.location}
          </span>
          <span className="flex items-center gap-1.5 bg-muted/40 px-2.5 py-1 rounded-md border border-border/40">
            <Users className="w-4 h-4 text-primary/70" />
            {role.openPositions} {role.openPositions > 1 ? "Openings" : "Opening"}
          </span>
        </div>

        <p className="text-sm line-clamp-3 text-muted-foreground leading-relaxed mb-6 flex-1">{role.description}</p>

        <Button
          asChild
          className="w-full gap-2 rounded-xl h-11 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300 font-semibold group-hover:shadow-md"
        >
          <a href={applyUrl} target="_blank" rel="noopener noreferrer">
            Apply Now
            <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};

export default JobCard;
