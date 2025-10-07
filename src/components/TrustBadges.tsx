import { Award, Shield, ThumbsUp, Users } from "lucide-react";

const TrustBadges = () => {
  const stats = [
    {
      icon: Users,
      value: "2M+",
      label: "Happy Travelers",
      color: "text-primary"
    },
    {
      icon: ThumbsUp,
      value: "4.8/5",
      label: "Customer Rating",
      color: "text-success"
    },
    {
      icon: Shield,
      value: "100%",
      label: "Secure Booking",
      color: "text-accent"
    },
    {
      icon: Award,
      value: "15+",
      label: "Years of Service",
      color: "text-primary"
    }
  ];

  return (
    <section className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Trusted by Millions Worldwide</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're committed to providing you with the best travel booking experience
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-white mb-4 ${stat.color}`}>
                <stat.icon className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap justify-center items-center gap-8 opacity-70">
          <div className="text-sm font-medium">As featured on:</div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            <span className="font-semibold">Trustpilot</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <span className="font-semibold">SiteJabber</span>
          </div>
          <div className="flex items-center gap-2">
            <ThumbsUp className="w-5 h-5" />
            <span className="font-semibold">TripAdvisor</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
