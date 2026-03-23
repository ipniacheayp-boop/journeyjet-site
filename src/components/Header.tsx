import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Phone,
  User,
  Menu,
  X,
  LogOut,
  BookOpen,
  Globe,
  Moon,
  Sun,
  Plane,
  Hotel,
  PlaneTakeoff,
  Ship,
  Tag,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import newLogo from "@/assets/new_logo.png";
import tripileLogo from "@/assets/tripile-logo.svg";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/components/ThemeProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Primary service links — these are the core user journeys
const serviceLinks = [
  { label: "Flights", href: "/?type=flights#search-widget", icon: Plane },
  { label: "Hotels", href: "/?type=hotels#search-widget", icon: Hotel },
  { label: "Deals", href: "/deals", icon: Tag },
  { label: "Flight Status", href: "/flight-status", icon: PlaneTakeoff },
  // { label: "Cruise", href: "/?type=cruise#search-widget", icon: Ship },
];

// Secondary utility links — lower priority, go in right area
const utilityLinks = [
  { label: "Reviews", href: "/reviews" },
  { label: "Support", href: "/support" },
  { label: "About", href: "/about" },
];

const Header = () => {
  const { user, signOut, isAdmin, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, toggleLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isActive = (href: string) => {
    const url = new URL(href, window.location.origin);
    const currentParams = new URLSearchParams(location.search);
    const targetParams = new URLSearchParams(url.search);

    // match pathname
    if (location.pathname !== url.pathname) return false;

    // match "type" param specifically
    const targetType = targetParams.get("type");
    if (!targetType) return true;

    return currentParams.get("type") === targetType;
  };
  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/97 dark:bg-slate-950/97 backdrop-blur-md shadow-sm border-b border-slate-200/80 dark:border-slate-800/80"
            : "bg-white/85 dark:bg-slate-950/85 backdrop-blur-sm"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-[68px] gap-4">
            {/* ── Logo ── */}
            <Link to="/" className="flex items-center shrink-0 ml-2 lg:ml-6">
              <div className="h-9 md:h-11 w-auto flex items-center transition-opacity hover:opacity-80">
                <img src={tripileLogo} alt="Tripile Logo" className="h-full w-auto object-contain" />
              </div>
            </Link>

            {/* ── Primary Service Navigation (Desktop) ── */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Primary navigation">
              {serviceLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`group flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                      active
                        ? "text-primary bg-primary/8"
                        : "text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary/6 dark:hover:bg-primary/10"
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 transition-colors ${active ? "text-primary" : "text-slate-400 group-hover:text-primary"}`}
                    />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* ── Right Side: Utility Links + Actions ── */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Secondary links — desktop only, smaller weight */}
              <div className="hidden xl:flex items-center gap-0.5 mr-1">
                {utilityLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Divider */}
              <div className="hidden xl:block w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full w-8 h-8 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Toggle theme"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-slate-600 dark:text-slate-300" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-slate-300" />
              </Button>

              {/* Language Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden lg:flex items-center gap-1 h-8 px-2 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    {language === "en" ? "EN" : "ES"}
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 z-[60] rounded-xl shadow-lg min-w-[120px]"
                >
                  <DropdownMenuItem onClick={() => toggleLanguage("en")} className="cursor-pointer text-sm">
                    🇺🇸 English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleLanguage("es")} className="cursor-pointer text-sm">
                    🇪🇸 Español
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Call CTA — Desktop */}
              <a
                href="tel:+18009634330"
                className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>1-800-963-4330</span>
              </a>

              {/* Sign In / Account */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 rounded-full border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 h-8 px-3 text-xs font-medium"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">
                        {userRole === "admin"
                          ? t("navigation.admin")
                          : userRole === "agent"
                            ? t("navigation.agent")
                            : t("navigation.account")}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="z-[60] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl shadow-lg"
                  >
                    {userRole === "admin" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="flex items-center gap-2 w-full cursor-pointer">
                            <BookOpen className="w-4 h-4" />
                            {t("navigation.admin")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                      </>
                    )}
                    {userRole === "agent" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/agent/dashboard" className="flex items-center gap-2 w-full cursor-pointer">
                            <BookOpen className="w-4 h-4" />
                            {t("navigation.agent")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/account" className="flex items-center gap-2 w-full cursor-pointer">
                        <User className="w-4 h-4" />
                        {t("navigation.account")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/my-bookings" className="flex items-center gap-2 w-full cursor-pointer">
                        <BookOpen className="w-4 h-4" />
                        {t("navigation.myBookings")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="flex items-center gap-2 text-red-600 dark:text-red-400 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      {t("navigation.signOut")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  size="sm"
                  asChild
                  className="rounded-full bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold h-8 px-4 text-xs shadow-none"
                >
                  <Link to="/login">{t("navigation.signIn")}</Link>
                </Button>
              )}

              {/* Mobile Hamburger */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-full h-9 w-9 text-slate-700 dark:text-slate-300 ml-1"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* ── Mobile Menu ── */}
          {isMobileMenuOpen && (
            <div className="lg:hidden absolute left-0 right-0 top-[68px] bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shadow-xl pb-6 px-4 z-50">
              {/* Services group */}
              <div className="pt-4 pb-2">
                <p className="px-2 mb-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Travel
                </p>
                <nav className="grid grid-cols-2 gap-1">
                  {serviceLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-3 text-sm font-semibold text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-colors"
                      >
                        <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-primary" />
                        </span>
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Company links */}
              <div className="pt-1 pb-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                <p className="px-2 mb-2 mt-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Company
                </p>
                <nav className="flex flex-col gap-0.5">
                  {utilityLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Language */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                <p className="px-2 mb-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Language
                </p>
                <div className="flex gap-2 px-1">
                  <Button
                    variant={language === "en" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      toggleLanguage("en");
                      setIsMobileMenuOpen(false);
                    }}
                    className="rounded-lg flex-1 border-slate-200 dark:border-slate-800 text-sm"
                  >
                    🇺🇸 EN
                  </Button>
                  <Button
                    variant={language === "es" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      toggleLanguage("es");
                      setIsMobileMenuOpen(false);
                    }}
                    className="rounded-lg flex-1 border-slate-200 dark:border-slate-800 text-sm"
                  >
                    🇪🇸 ES
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Floating Mobile Call Button */}
      <a
        href="tel:+18009634330"
        className="fixed md:hidden bottom-4 left-4 right-4 z-[90] flex items-center justify-between px-5 py-4 rounded-2xl bg-primary text-primary-foreground shadow-xl hover:bg-primary/90 transition-colors"
      >
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight">Call Us Now</span>
          <span className="text-xs opacity-90 font-medium">1-800-221-5246</span>
        </div>
        <div className="bg-white/20 p-2.5 rounded-full">
          <Phone className="w-5 h-5" />
        </div>
      </a>
    </>
  );
};

export default Header;
