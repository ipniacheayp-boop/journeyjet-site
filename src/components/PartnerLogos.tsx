import { motion } from "framer-motion";

// Comparison / metasearch partners — shown in a separate "also compare on" row
const comparisonPartners = [
  {
    name: "KAYAK",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Kayak_Logo.svg",
  },
  {
    name: "Momondo",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Press-logo-momondo_colour.png",
  },
  {
    name: "Skyscanner",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/94/Skyscanner_Logo_LockupHorizontal_SkyBlue_RGB.svg",
  },
  {
    name: "Expedia",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Expedia_2012_logo.svg/3840px-Expedia_2012_logo.svg.png",
  },
  {
    name: "Booking.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/be/Booking.com_logo.svg",
  },
  {
    name: "Priceline",
    logo: "https://press.priceline.com/wp-content/themes/priceline/img/priceline.png",
  },
  {
    name: "Agoda",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Agoda_logo_2019.svg/330px-Agoda_logo_2019.svg.png",
  },
  {
    name: "Trivago",
    logo: "https://cdn.freebiesupply.com/logos/large/2x/trivago-logo-png-transparent.png",
  },
  {
    name: "Hotels.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/16/Hotels.com_Logo_2023.svg",
  },
  {
    name: "OpenTable",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/8a/OpenTable_logo2.png?_=20150321201431",
  },
];

const logoItem = (name: string) =>
  `<span class="text-xs font-semibold text-slate-500 dark:text-slate-400">${name}</span>`;

const PartnerLogos = () => {
  return (
    <section
      className="py-10 bg-slate-50/80 dark:bg-slate-950/40 border-y border-slate-200/70 dark:border-slate-800/70"
      aria-labelledby="partners-title"
    >
      <div className="container mx-auto px-4 space-y-8">
        {/* ── Comparison / booking platforms ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <p className="text-center text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest mb-5">
            Also featured and compared on
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-4 md:gap-x-10 opacity-80">
            {comparisonPartners.map((partner) => (
              <div key={partner.name} className="flex items-center justify-center">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  title={`${partner.name} — travel price comparison partners on Tripile`}
                  className="h-4 md:h-5 w-auto object-contain max-w-[90px] md:max-w-[110px]"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const t = e.target as HTMLImageElement;
                    t.style.display = "none";
                    if (t.parentElement) t.parentElement.innerHTML = logoItem(partner.name);
                  }}
                />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PartnerLogos;
