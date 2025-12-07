const TrustPartners = () => {
  const partners = [
    {
      name: "IATA",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/IATA_logo.svg/200px-IATA_logo.svg.png",
      alt: "IATA Member"
    },
    {
      name: "ASTA",
      logo: "https://www.asta.org/Portals/0/asta-logo-1.png",
      alt: "American Society of Travel Advisors"
    },
    {
      name: "GoDaddy Secured",
      logo: "https://img1.wsimg.com/isteam/ip/static/godaddy-verified-seal.svg",
      alt: "GoDaddy Verified & Secured"
    },
    {
      name: "TRUE",
      logo: "https://images.squarespace-cdn.com/content/v1/5e7a8c7c8d9b0a6e3e5c5e5e/1585149428507-TRUE-LOGO.png",
      alt: "TRUE Accredited Travel Agency"
    },
    {
      name: "Cloudflare",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Cloudflare_Logo.png/200px-Cloudflare_Logo.png",
      alt: "Protected by Cloudflare"
    },
    {
      name: "FlexPay",
      logo: "https://cdn.brandfetch.io/idpCXXxqEY/w/400/h/400/theme/dark/icon.png",
      alt: "FlexPay Payments"
    },
    {
      name: "Amazon Pay",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Amazon_Pay_logo.svg/200px-Amazon_Pay_logo.svg.png",
      alt: "Amazon Pay Accepted"
    }
  ];

  return (
    <section className="bg-background border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="container mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-foreground mb-2">
            Our Trusted Partners & Certifications
          </h3>
          <p className="text-sm text-muted-foreground">
            Your safety and trust are our highest priority.
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 max-w-5xl mx-auto">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex items-center justify-center grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300"
            >
              <img
                src={partner.logo}
                alt={partner.alt}
                className="h-10 md:h-12 w-auto max-w-[120px] object-contain"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustPartners;
