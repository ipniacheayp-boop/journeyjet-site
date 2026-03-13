import { Award, Shield, ThumbsUp, Users } from "lucide-react";

const TrustBadges = () => {
  const stats = [
    {
      icon: Users,
      value: "2M+",
      label: "Verified Travelers",
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      icon: ThumbsUp,
      value: "4.8/5",
      label: "Average Rating",
      color: "text-emerald-600",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      icon: Shield,
      value: "100%",
      label: "Secure Transactions",
      color: "text-indigo-600",
      bg: "bg-indigo-100 dark:bg-indigo-900/30",
    },
    {
      icon: Award,
      value: "15+",
      label: "Years Excellence",
      color: "text-amber-600",
      bg: "bg-amber-100 dark:bg-amber-900/30",
    },
  ];

  const platforms = [
    {
      name: "Trustpilot",
      rating: "4.4",
      reviews: "9,865 reviews",
      logo: "https://upload.wikimedia.org/wikipedia/commons/7/78/Trustpilot_Logo_%282022%29.svg",
    },
    {
      name: "Google",
      rating: "4.1",
      reviews: "1,605 reviews",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    },
    {
      name: "Sitejabber",
      rating: "4.7",
      reviews: "22,801 reviews",
      logo: "https://m.bbb.org/prod/ProfileImages/2023/ee858f63-8ffb-4758-94f1-80cd0b3c2fbc.png",
    },
    {
      name: "Reviews.io",
      rating: "4.1",
      reviews: "4,585 reviews",
      logo: "https://cdn.prod.website-files.com/642419dd2be643c50e400f66/66e00d77b400163fc0d831d0_4d3b0b51312903ee62e3ff7df64fc4af_reviewsio-logo.svg",
    },
    {
      name: "Facebook",
      rating: "4.4",
      reviews: "483 reviews",
      logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/Facebook_logo_%282023%29.svg",
    },
    {
      name: "ResellerRatings",
      rating: "4.6",
      reviews: "18,200 reviews",
      logo: "https://www.hubspot.com/hubfs/Reseller%20Ratings-2.svg",
    },
  ];

  return (
    <section
      className="py-20 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800"
      aria-labelledby="trust-badges-title"
    >
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 id="trust-badges-title" className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
            Trusted by Millions of Travelers
          </h2>

          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Our commitment to security, reliability, and service excellence has earned the trust of travelers worldwide.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto mb-20">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="group bg-white dark:bg-slate-950 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div
                  className={`mx-auto mb-5 w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} transition-transform duration-300 group-hover:scale-105`}
                >
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>

                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{stat.value}</div>

                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Reviews */}
        <div className="max-w-6xl mx-auto border-t border-slate-200 dark:border-slate-800 pt-16">
          <p className="text-center text-xs font-semibold tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-10">
            Verified Independent Reviews
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
            {platforms.map((item) => (
              <div
                key={item.name}
                className="group rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 text-center flex flex-col items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <img
                  src={item.logo}
                  alt={`${item.name} logo`}
                  className="h-6 object-contain mb-4 opacity-80 group-hover:opacity-100 transition-opacity"
                />

                <div className="text-slate-900 dark:text-white font-semibold text-sm mb-1">{item.rating} / 5</div>

                <div className="text-xs text-slate-500 dark:text-slate-400">{item.reviews}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
