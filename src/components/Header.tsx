import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plane, Phone, User, Menu, X, LogOut, BookOpen, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { user, signOut, isAdmin, userRole } = useAuth();
  const navigate = useNavigate();
  const { t, language, toggleLanguage } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navLinks = [
    { label: t('navigation.deals'), href: "/deals" },
    { label: t('navigation.reviews'), href: "/reviews/site" },
    { label: t('navigation.support'), href: "/support" },
    { label: t('navigation.about'), href: "/about" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-white/95 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <Plane className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:block">Cheap Flights</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <a
              href="tel:+18001234567"
              className="hidden md:flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>1-800-123-4567</span>
            </a>

            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 hidden md:flex">
                  <Globe className="w-4 h-4" />
                  {language === 'en' ? '🇺🇸 EN' : '🇪🇸 ES'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background z-[60]">
                <DropdownMenuItem onClick={() => toggleLanguage('en')}>
                  🇺🇸 English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleLanguage('es')}>
                  🇪🇸 Español
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {userRole === 'admin' ? t('navigation.admin') : userRole === 'agent' ? t('navigation.agent') : t('navigation.account')}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-[60] bg-background">
                  {userRole === 'admin' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2 w-full cursor-pointer">
                          <BookOpen className="w-4 h-4" />
                          {t('navigation.admin')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {userRole === 'agent' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/agent/dashboard" className="flex items-center gap-2 w-full cursor-pointer">
                          <BookOpen className="w-4 h-4" />
                          {t('navigation.agent')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="flex items-center gap-2 w-full cursor-pointer">
                      <User className="w-4 h-4" />
                      {t('navigation.account')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-bookings" className="flex items-center gap-2 w-full cursor-pointer">
                      <BookOpen className="w-4 h-4" />
                      {t('navigation.myBookings')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-destructive cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('navigation.signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" asChild>
                <Link to="/login">{t('navigation.signIn')}</Link>
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border py-4">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent/10 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Mobile Language Switcher */}
              <div className="px-4 py-3 border-t border-border mt-2">
                <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                  <Globe className="w-4 h-4" />
                  {t('common.language')}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={language === 'en' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      toggleLanguage('en');
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex-1"
                  >
                    🇺🇸 EN
                  </Button>
                  <Button
                    variant={language === 'es' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      toggleLanguage('es');
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex-1"
                  >
                    🇪🇸 ES
                  </Button>
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
