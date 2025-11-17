import { Link } from "react-router-dom";
import { Plane, Mail, Facebook, Twitter, Instagram, Youtube, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/useLanguage";

const Footer = () => {
  const { t, language, toggleLanguage } = useLanguage();
  
  const footerSections = [
    {
      title: t('footer.company'),
      links: [
        { label: t('footer.about'), href: "/about" },
        { label: t('footer.careers'), href: "/careers" },
        { label: t('footer.press'), href: "/press" },
      ],
    },
    {
      title: t('footer.support'),
      links: [
        { label: t('footer.help'), href: "/support" },
        { label: t('footer.contact'), href: "/support#contact" },
        { label: t('footer.faq'), href: "/support#faq" },
      ],
    },
    {
      title: t('footer.legal'),
      links: [
        { label: t('footer.terms'), href: "/terms" },
        { label: t('footer.privacy'), href: "/privacy" },
        { label: t('footer.cookies'), href: "/cookies" },
      ],
    },
  ];

  return (
    <footer className="bg-foreground text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Newsletter Section */}
        <div className="mb-12 pb-12 border-b border-white/10">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-3">{t('footer.newsletter')}</h3>
            <p className="text-white/70 mb-6">
              {t('footer.newsletterDesc')}
            </p>
            <form className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder={t('auth.email')}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                required
              />
              <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                {t('footer.subscribe')}
              </Button>
            </form>
          </div>
        </div>

        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                <Plane className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Cheap Flights</span>
            </Link>
            <p className="text-white/70 mb-4 max-w-sm">
              Your trusted partner for finding the best deals on flights, hotels, and travel experiences worldwide.
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4 text-white">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-white/70 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Language Switcher */}
        <div className="pb-8 mb-8 border-b border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-white/70">
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">{t('common.language')}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleLanguage('en')}
                className="min-w-[100px]"
              >
                🇺🇸 English
              </Button>
              <Button
                variant={language === 'es' ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleLanguage('es')}
                className="min-w-[100px]"
              >
                🇪🇸 Español
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/60">
          <p>© {new Date().getFullYear()} Cheap Flights. {t('footer.allRights')}.</p>
          <div className="flex items-center gap-6">
            <a href="mailto:support@cheapflights.com" className="hover:text-white transition-colors flex items-center gap-2">
              <Mail className="w-4 h-4" />
              support@cheapflights.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
