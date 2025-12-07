import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, Linkedin } from "lucide-react";
import TrustPartners from "./TrustPartners";

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
        { label: "Cruise", href: "/deals?filter=cruise" },
      ],
    },
    {
      title: "Book",
      links: [
        { label: "Cheap Flights", href: "/deals" },
        { label: "Cheap Hotels", href: "/search?type=hotels" },
        { label: "Car Rentals", href: "/search?type=cars" },
        { label: "Group Travel", href: "/support?topic=group" },
      ],
    },
    {
      title: "Traveler Tools",
      links: [
        { label: "Customer Support", href: "/support" },
        { label: "Online Check-in", href: "/support?topic=checkin" },
        { label: "Airline Baggage Fees", href: "/support?topic=baggage" },
        { label: "Travel Blog", href: "/about#blog" },
        { label: "Customer Reviews", href: "/reviews" },
        { label: "Browser Compatibility", href: "/support?topic=browser" },
      ],
    },
    {
      title: "About CheapFlights",
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
    { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com", label: "X (Twitter)" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  ];

  return (
    <>
      <TrustPartners />
      <footer className="bg-[#0a1a3c] text-white">
        <div className="container mx-auto px-4 py-12">
          {/* Footer Grid - 5 Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 mb-12">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h4 className="font-bold text-white text-sm uppercase tracking-wide mb-4">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        to={link.href}
                        className="text-sky-200/80 hover:text-white hover:underline transition-colors text-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Social Media Section */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <span className="text-sm text-white/70 font-medium">Follow us on</span>
                <div className="flex gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-all hover:scale-110"
                      aria-label={social.label}
                      title={social.label}
                    >
                      <social.icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
              
              <p className="text-sm text-white/50">
                © {new Date().getFullYear()} CheapFlights. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
