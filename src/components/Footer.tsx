import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, Linkedin } from "lucide-react";
import TrustPartners from "./TrustPartners";

// Pinterest icon component
const Pinterest = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
  </svg>
);

const Footer = () => {
  const footerSections = [
    {
      title: "Quick Links",
      links: [
        { label: "Popular Airlines", href: "/deals?filter=airlines" },
        { label: "Popular Flight Routes", href: "/deals?filter=routes" },
        { label: "Top U.S. Destinations", href: "/deals?filter=us" },
        { label: "Top International Destinations", href: "/deals?filter=international" },
        { label: "Top Airports", href: "/deals?filter=airports" },
        { label: "Cruise", href: "/cruise-deals" },
      ],
    },
    {
      title: "Book",
      links: [
        { label: "Chyeap Flights", href: "/deals" },
        { label: "Chyeap Hotels", href: "/search?type=hotels" },
        { label: "Car Rentals", href: "/search?type=cars" },
        { label: "Group Travel", href: "/support?topic=group" },
      ],
    },
    {
      title: "Traveler Tools",
      links: [
        { label: "Customer Support", href: "/support" },
        { label: "Online Check-in", href: "/support?topic=checkin" },
        { label: "Airline Baggage Fees", href: "/taxes-fees" },
        { label: "Travel Blog", href: "/about#blog" },
        { label: "Customer Reviews", href: "/reviews" },
        { label: "Browser Compatibility", href: "/support?topic=browser" },
      ],
    },
    {
      title: "About ChyeapFlights",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Contact Us", href: "/support#contact" },
        { label: "Site Map", href: "/sitemap" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms & Conditions", href: "/terms" },
        { label: "Taxes & Fees", href: "/terms#taxes" },
        { label: "Post-Ticketing Fees", href: "/terms#post-ticketing" },
        { label: "Affiliate Program", href: "/about#affiliates" },
        { label: "Your California Privacy Rights", href: "/privacy#california" },
        { label: "Travel Now, Pay Later with FlexPay", href: "/support?topic=flexpay" },
      ],
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com/cheapflights", label: "Follow us on Facebook" },
    { icon: Twitter, href: "https://twitter.com/cheapflights", label: "Follow us on X (Twitter)" },
    { icon: Linkedin, href: "https://linkedin.com/company/cheapflights", label: "Connect with us on LinkedIn" },
    { icon: Instagram, href: "https://instagram.com/cheapflights", label: "Follow us on Instagram" },
    { icon: Pinterest, href: "https://pinterest.com/cheapflights", label: "Follow us on Pinterest" },
    { icon: Youtube, href: "https://youtube.com/cheapflights", label: "Subscribe to our YouTube channel" },
  ];

  return (
    <>
      {/* Trust Partners Section */}
      <TrustPartners />

      {/* Main Footer */}
      <footer className="bg-[#0a1a3c] text-white" role="contentinfo">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Footer Grid - 5 Columns */}
          <nav
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 md:gap-8 mb-8 md:mb-10"
            aria-label="Footer navigation"
          >
            {footerSections.map((section) => (
              <div key={section.title}>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">{section.title}</h4>
                <ul className="space-y-1.5" role="list">
                  {section.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        to={link.href}
                        className="text-sky-200/70 hover:text-white hover:underline transition-colors text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-1 focus:ring-offset-[#0a1a3c] rounded inline-block"
                        title={link.label}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* Social Media Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 pb-6 border-b border-white/10">
            <span className="text-xs text-white/60 font-medium">Follow us</span>
            <div className="flex gap-2.5" role="list" aria-label="Social media links">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 md:w-[38px] md:h-[38px] rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-1 focus:ring-offset-[#0a1a3c]"
                  aria-label={social.label}
                  title={social.label}
                  role="listitem"
                >
                  <social.icon className="w-4 h-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Copyright & Legal Links */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <p className="text-xs text-white/50">© {new Date().getFullYear()} ChyeapFlights. All rights reserved.</p>
            <div className="flex items-center gap-3 text-xs text-white/50">
              <Link
                to="/privacy"
                className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 rounded"
                title="Privacy Policy"
              >
                Privacy
              </Link>
              <span aria-hidden="true">|</span>
              <Link
                to="/terms"
                className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 rounded"
                title="Terms and Conditions"
              >
                Terms
              </Link>
              <span aria-hidden="true">|</span>
              <Link
                to="/support"
                className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 rounded"
                title="Customer Support"
              >
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
