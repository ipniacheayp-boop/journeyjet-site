import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, ArrowDown, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import JobCard from "@/components/careers/JobCard";
import JobFilters from "@/components/careers/JobFilters";
import { jobRoles, departments } from "@/data/careerRoles";

const Careers = () => {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [location, setLocation] = useState("All Locations");

  const filtered = useMemo(() => {
    return jobRoles.filter((role) => {
      const matchesSearch =
        !search ||
        role.title.toLowerCase().includes(search.toLowerCase()) ||
        role.description.toLowerCase().includes(search.toLowerCase());
      const matchesDept = department === "All Departments" || role.department === department;
      const matchesLoc = location === "All Locations" || role.location === location;
      return matchesSearch && matchesDept && matchesLoc;
    });
  }, [search, department, location]);

  const totalOpenings = jobRoles.reduce((sum, r) => sum + r.openPositions, 0);

  const deptCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    departments.forEach((d) => {
      if (d !== "All Departments") {
        counts[d] = jobRoles.filter((r) => r.department === d).length;
      }
    });
    return counts;
  }, []);

  const scrollToPositions = () => {
    document.getElementById("open-positions")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20 md:py-28">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Badge variant="secondary" className="mb-4 gap-1.5 text-sm px-3 py-1">
            <Briefcase className="w-3.5 h-3.5" />
            {totalOpenings}+ Open Positions
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-5 tracking-tight">
            Careers at Tripile
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
            Join our team and help build seamless travel experiences for global customers.
          </p>
          <button
            onClick={scrollToPositions}
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white rounded-full bg-gradient-to-r from-[hsl(217,90%,60%)] to-[hsl(224,76%,53%)] hover:from-[hsl(217,90%,55%)] hover:to-[hsl(224,76%,48%)] hover:scale-[1.02] transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Explore Opportunities
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Department Quick Links */}
      <section className="py-10 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {Object.entries(deptCounts).map(([dept, count]) => (
              <button
                key={dept}
                onClick={() => {
                  setDepartment(dept);
                  scrollToPositions();
                }}
                className="px-4 py-2 rounded-full text-sm border border-border/50 bg-card hover:bg-primary/5 hover:border-primary/20 transition-colors text-muted-foreground hover:text-foreground"
              >
                {dept} <span className="text-xs text-muted-foreground/60">({count})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section id="open-positions" className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Open Positions</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Find your next opportunity and grow with us.
            </p>
          </div>

          <div className="mb-8">
            <JobFilters
              search={search}
              onSearchChange={setSearch}
              department={department}
              onDepartmentChange={setDepartment}
              location={location}
              onLocationChange={setLocation}
              totalResults={filtered.length}
            />
          </div>

          {filtered.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((role) => (
                <JobCard key={role.id} role={role} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg mb-2">No roles match your search.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setDepartment("All Departments");
                  setLocation("All Locations");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto text-center border-border/50">
            <CardContent className="p-10">
              <div className="inline-flex p-3 bg-primary/10 rounded-full mb-5">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Didn't Find the Right Role?</h2>
              <p className="text-muted-foreground mb-5 leading-relaxed">
                We're always looking for talented professionals. Send your CV and cover letter to:
              </p>
              <a
                href="mailto:Hr@tripile.com"
                className="inline-flex items-center gap-2 text-xl font-semibold text-primary hover:underline transition-colors"
              >
                <Mail className="w-5 h-5" />
                Hr@tripile.com
              </a>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Careers;
