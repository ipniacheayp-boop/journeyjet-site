const PartnerLogos = () => {
  const partners = [
    {
      name: "Booking.com",
      logo: "https://upload.wikimedia.org/wikipedia/commons/b/be/Booking.com_logo.svg",
    },
    {
      name: "KAYAK",
      logo: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Kayak_Logo.svg",
    },
    {
      name: "Priceline",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbsxyq5At2IeUTWbQ6zQrjtzBorWnskhnBGQ&s",
    },
    {
      name: "Agoda",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Agoda_logo_2019.svg/330px-Agoda_logo_2019.svg.png",
    },
    {
      name: "OpenTable",
      logo: "https://mma.prnewswire.com/media/122496/opentable__inc__logo.jpg?w=200",
    },
    {
      name: "Expedia",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Expedia_2012_logo.svg/3840px-Expedia_2012_logo.svg.png",
    },
    {
      name: "Hotels.com",
      logo: "https://upload.wikimedia.org/wikipedia/commons/1/16/Hotels.com_Logo_2023.svg",
    },
    {
      name: "Trivago",
      logo: "https://cdn.freebiesupply.com/logos/large/2x/trivago-logo-png-transparent.png",
    },
    {
      name: "Skyscanner",
      logo: "https://upload.wikimedia.org/wikipedia/commons/9/94/Skyscanner_Logo_LockupHorizontal_SkyBlue_RGB.svg",
    },
    {
      name: "Momondo",
      logo: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Press-logo-momondo_colour.png",
    },
  ];

  return (
    <section
      className="py-12 border-y border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"
      aria-labelledby="partners-title"
    >
      <div className="container mx-auto px-4 text-center">
        <p id="partners-title" className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-8">
          Trusted by millions across leading travel platforms
        </p>

        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex items-center justify-center hover:opacity-100 transition-all duration-300"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="h-6 md:h-8 w-auto object-contain max-w-[120px]"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnerLogos;
