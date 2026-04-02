import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, ExternalLink, Flame } from "lucide-react";
import type { JobRole } from "@/data/careerRoles";

const GOOGLE_FORM_BASE = "https://docs.google.com/forms/d/e/1FAIpQLSeevvCiJ7JO6iQe9NkKQBgWJYrYOYYdJVUcTuS7SU36JFtSGg/viewform?usp=dialog";

interface JobCardProps {
  role: JobRole;
}

const JobCard = ({ role }: JobCardProps) => {
  const applyUrl = `${GOOGLE_FORM_BASE}&entry.123456=${encodeURIComponent(role.title)}`;

  return (
    <Card className="group relative overflow-hidden border border-border/50 bg-card hover:shadow-lg hover:border-primary/20 transition-all duration-300 hover:-translate-y-0.5">
      {role.isHot && (
        <div className="absolute top-3 right-3">
          <Badge className="bg-coral/10 text-coral border-coral/20 text-xs gap-1">
            <Flame className="w-3 h-3" />
            Actively Hiring
          </Badge>
        </div>
      )}
      <CardContent className="p-6 flex flex-col h-full">
        <h3 className="font-semibold text-lg text-foreground leading-tight mb-2 pr-8 group-hover:text-primary transition-colors">
          {role.title}
        </h3>

        <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {role.openPositions} Open Position{role.openPositions > 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {role.location}
          </span>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
          {role.description}
        </p>

        <Button asChild size="sm" className="w-full gap-1.5">
          <a href={applyUrl} target="_blank" rel="noopener noreferrer">
            Apply Now
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};

export default JobCard;
