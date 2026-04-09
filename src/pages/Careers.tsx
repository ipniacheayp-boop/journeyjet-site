import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, ArrowDown, BriefcaseBusiness, Mail, Globe2, HeartPulse, GraduationCap, Laptop } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import JobCard from "@/components/careers/JobCard";
import JobFilters from "@/components/careers/JobFilters";
import { jobRoles, departments } from "@/data/careerRoles";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Careers = () => {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [location, setLocation] = useState("All Locations");
  const [currentPage, setCurrentPage] = useState(1);
  const ItemsPerPage = 10;

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

  useEffect(() => {
    setCurrentPage(1);
  }, [department, location, search]);

  const totalPages = Math.ceil(filtered.length / ItemsPerPage);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ItemsPerPage;
    const end = start + ItemsPerPage;
    return filtered.slice(start, end);
  }, [filtered, currentPage, ItemsPerPage]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section with Unsplash Background */}
      <section className="relative flex items-center justify-center min-h-screen mt-16 pt-20 pb-28 overflow-hidden">
        {/* Background Image & Overlays */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
            alt="Tripile Team Culture"
            className="w-full h-full object-cover object-[center_10%]"
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center max-w-4xl">
          <Badge className="mb-6 bg-primary/20 text-primary-foreground border border-primary/30 backdrop-blur-md px-4 py-1.5 text-sm uppercase tracking-widest font-semibold">
            <BriefcaseBusiness className="w-4 h-4 mr-2 inline-block" />
            Shape the Future of Travel
          </Badge>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight leading-[1.1]">
            Do the best work of{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">your life.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed max-w-2xl mx-auto font-medium">
            Join our mission to build seamless, magical travel experiences for millions of explorers worldwide.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={scrollToPositions}
              size="lg"
              className="w-full sm:w-auto px-8 py-6 text-base font-bold rounded-full bg-primary hover:bg-primary/95 text-white shadow-xl shadow-primary/20 transition-all hover:scale-105"
            >
              View {totalOpenings} Open Roles
              <ArrowDown className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Perks and Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">Why Tripile?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We take care of our team so they can take care of our travelers. From global stipends to comprehensive
              health, we've got you covered.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-border/50 bg-card hover:bg-accent/5 transition-colors border-none shadow-sm">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
                  <Globe2 className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">Work from Anywhere</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We are a remote-first team. Work from your home office, a café in Paris, or a beach in Bali.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card hover:bg-accent/5 transition-colors border-none shadow-sm">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
                  <HeartPulse className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">Premium Healthcare</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Top-tier medical, dental, and vision coverage for you and your dependents.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card hover:bg-accent/5 transition-colors border-none shadow-sm">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6">
                  <GraduationCap className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">Learning Stipend</h3>
                <p className="text-muted-foreground leading-relaxed">
                  $2,000 annual budget for courses, conferences, books, and your continued growth.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card hover:bg-accent/5 transition-colors border-none shadow-sm">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-2xl bg-coral/10 flex items-center justify-center mb-6">
                  <Laptop className="w-6 h-6 text-coral" />
                </div>
                <h3 className="text-xl font-bold mb-3">Home Office Setup</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get exactly what you need to be productive with a $1,000 allowance for your home workspace.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Department Quick Links */}
      <section className="py-12 border-y border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 md:top-20 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => {
                setDepartment("All Departments");
                scrollToPositions();
              }}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                department === "All Departments"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "border border-border/60 bg-background hover:bg-primary/5 hover:border-primary/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              View All
            </button>
            {Object.entries(deptCounts).map(([dept, count]) => (
              <button
                key={dept}
                onClick={() => {
                  setDepartment(dept);
                  scrollToPositions();
                }}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  department === dept
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "border border-border/60 bg-background hover:bg-primary/5 hover:border-primary/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                {dept}
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full ${department === dept ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Job Listings */}
      {/* Job Listings */}
      <section id="open-positions" className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-12">
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
            <>
              <div className="grid sm:grid-cols-2 gap-6">
                {/* CRITICAL CHANGE: Map through 'paginated' instead of 'filtered' */}
                {paginated.map((role) => (
                  <JobCard key={role.id} role={role} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-16">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage((prev) => prev - 1);
                      scrollToPositions();
                    }}
                    className="rounded-full px-6"
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        onClick={() => {
                          setCurrentPage(pageNum);
                          scrollToPositions();
                        }}
                        className={`w-10 h-10 rounded-full p-0 ${
                          currentPage === pageNum ? "shadow-lg shadow-primary/20" : ""
                        }`}
                      >
                        {pageNum}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage((prev) => prev + 1);
                      scrollToPositions();
                    }}
                    className="rounded-full px-6"
                  >
                    Next
                  </Button>
                </div>
              )}

              <p className="text-center text-sm text-muted-foreground mt-6">
                Showing page {currentPage} of {totalPages}
              </p>
            </>
          ) : (
            <div className="text-center py-20 bg-muted/20 rounded-[32px] border border-dashed border-border">
              <Briefcase className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-bold mb-2">No roles match your filters</h3>
              <p className="text-muted-foreground mb-6">
                We couldn't find any open positions matching your current search criteria.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setDepartment("All Departments");
                  setLocation("All Locations");
                }}
                className="rounded-full px-6"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.1),transparent_50%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.3)_100%)]">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto text-center border border-border/60 shadow-xl bg-card/80 backdrop-blur-xl rounded-[32px] overflow-hidden">
            <CardContent className="p-12 md:p-16">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">Don't see a fit?</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl mx-auto">
                We're always looking for brilliant minds. If you believe you belong here, drop your resume in our talent
                pool and we'll reach out when the right role opens up.
              </p>
              <Button asChild size="lg" className="rounded-full px-8 h-12 text-base">
                <a href="mailto:careers@tripile.com">Submit Speculative Application</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Careers;
