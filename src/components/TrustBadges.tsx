import { Award, Shield, ThumbsUp, Users, Star } from "lucide-react";

const TrustBadges = () => {
  const stats = [
    {
      icon: Users,
      value: "2M+",
      label: "Verified Travelers",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-500/10",
      border: "border border-blue-100 dark:border-blue-500/20",
      glow: "hover:shadow-blue-500/10",
      subtleBg: "from-blue-50/50 to-transparent dark:from-blue-900/10",
    },
    {
      icon: ThumbsUp,
      value: "4.5/5",
      label: "Average Rating",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      border: "border border-emerald-100 dark:border-emerald-500/20",
      glow: "hover:shadow-emerald-500/10",
      subtleBg: "from-emerald-50/50 to-transparent dark:from-emerald-900/10",
    },
    {
      icon: Shield,
      value: "100%",
      label: "Secure Transactions",
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-500/10",
      border: "border border-violet-100 dark:border-violet-500/20",
      glow: "hover:shadow-violet-500/10",
      subtleBg: "from-violet-50/50 to-transparent dark:from-violet-900/10",
    },
    {
      icon: Award,
      value: "15+",
      label: "Years Excellence",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-500/10",
      border: "border border-amber-100 dark:border-amber-500/20",
      glow: "hover:shadow-amber-500/10",
      subtleBg: "from-amber-50/50 to-transparent dark:from-amber-900/10",
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto mb-20">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className={`group relative overflow-hidden bg-white dark:bg-slate-950 rounded-2xl p-6 md:p-8 text-center border border-slate-200 dark:border-slate-800 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl ${stat.glow} hover:border-slate-300 dark:hover:border-slate-700`}
              >
                {/* Subtle gradient background on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.subtleBg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative z-10">
                  {/* Icon Box */}
                  <div
                    className={`mx-auto mb-5 md:mb-6 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.border} shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <Icon
                      className={`w-7 h-7 md:w-8 md:h-8 ${stat.color} transition-transform duration-500 group-hover:scale-110`}
                      strokeWidth={1.5}
                    />
                  </div>

                  {/* Value */}
                  <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2 md:mb-3 tracking-tight group-hover:scale-[1.02] transition-transform duration-500">
                    {stat.value}
                  </div>

                  {/* Label */}
                  <div className="text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em]">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="max-w-6xl mx-auto border-t border-slate-200 dark:border-slate-800 pt-16">
          <p className="text-center text-xs font-semibold tracking-widest text-slate-500 uppercase mb-10">
            Verified Independent Reviews
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
            {platforms.map((item) => (
              <div
                key={item.name}
                className="group rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 text-center flex flex-col items-center justify-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/20 hover:shadow-primary/5"
              >
                {/* Logo Pill */}
                <div className="h-12 w-full px-2 flex items-center justify-center mb-4 bg-slate-50 dark:bg-slate-200 rounded-xl transition-colors duration-300 group-hover:bg-slate-100 dark:group-hover:bg-white">
                  <img
                    src={item.logo}
                    alt={`${item.name} logo`}
                    title={`${item.name} traveler reviews — Tripile trust ratings USA`}
                    className="h-5 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                {/* Rating & Stars */}
                <div className="flex flex-col items-center gap-1.5 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-900 dark:text-white font-extrabold text-base">{item.rating}</span>
                    <div className="flex -space-x-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < Math.round(Number(item.rating))
                              ? "fill-amber-400 text-amber-400"
                              : "fill-slate-100 text-slate-100 dark:fill-slate-800 dark:text-slate-800"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 uppercase tracking-widest">
                  {item.reviews}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
