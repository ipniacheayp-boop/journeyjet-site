import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Phone, User, Menu, X, LogOut, BookOpen, Globe, Moon, Sun } from "lucide-react";
import chyeapFlightsLogo from "@/assets/chyeap-flights-logo.png";
import { Button } from "@/components/ui/button";
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
import { motion, AnimatePresence } from "framer-motion";
import femaleAgent from "@/assets/female-agent.png";

const Header = () => {
  const { user, signOut, isAdmin, userRole } = useAuth();
  const navigate = useNavigate();
  const { t, language, toggleLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
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
    { label: t("navigation.home"), href: "/" },
    { label: t("navigation.deals"), href: "/deals" },
    { label: "Flight Status", href: "/flight-status" },
    { label: t("navigation.reviews"), href: "/reviews" },
    { label: t("navigation.support"), href: "/support" },
    { label: t("navigation.about"), href: "/about" },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-xl shadow-lg border-b border-border/50"
            : "bg-background/80 backdrop-blur-sm"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <motion.div whileHover={{ scale: 1.05 }} className="h-[3.5rem] md:h-[4.5rem] lg:h-[5.5rem] w-auto">
                <img
                  src={chyeapFlightsLogo}
                  alt="ChyeapFlights"
                  className="h-[3.5rem] md:h-[4.5rem] lg:h-[5.5rem] w-auto object-contain"
                />
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="relative px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors rounded-lg hover:bg-muted/50 group"
                >
                  {link.label}
                  <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-xl hover:bg-muted/50"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* Language Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 hidden md:flex rounded-xl hover:bg-muted/50">
                    <Globe className="w-4 h-4" />
                    {language === "en" ? "🇺🇸" : "🇪🇸"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-xl border-border/50 z-[60]">
                  <DropdownMenuItem onClick={() => toggleLanguage("en")} className="cursor-pointer">
                    🇺🇸 English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleLanguage("es")} className="cursor-pointer">
                    🇪🇸 Español
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 rounded-xl border-border/50 hover:bg-muted/50">
                      <User className="w-4 h-4" />
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
                    className="z-[60] bg-background/95 backdrop-blur-xl border-border/50"
                  >
                    {userRole === "admin" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="flex items-center gap-2 w-full cursor-pointer">
                            <BookOpen className="w-4 h-4" />
                            {t("navigation.admin")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
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
                        <DropdownMenuSeparator />
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="flex items-center gap-2 text-destructive cursor-pointer"
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
                  className="rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 shadow-lg shadow-primary/25"
                >
                  <Link to="/login">{t("navigation.signIn")}</Link>
                </Button>
              )}

              {/* Call 24/7 Button - rightmost */}
              <a
                href="tel:+18009634330"
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-foreground/20 hover:border-primary hover:bg-muted/50 transition-all duration-300"
              >
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-success">
                  <Phone className="w-3.5 h-3.5 text-success-foreground" />
                </div>
                <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                  Call 24/7: +1-800-963-4330
                </span>
              </a>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-xl"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden border-t border-border/50 overflow-hidden"
              >
                <nav className="flex flex-col gap-1 py-4">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={link.href}
                        className="px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 rounded-xl transition-colors block"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}

                  {/* Mobile Language & Theme */}
                  <div className="px-4 py-4 border-t border-border/50 mt-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Theme</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="gap-2 rounded-xl"
                      >
                        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        {theme === "dark" ? "Light" : "Dark"}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">{t("common.language")}</span>
                      <div className="flex gap-2">
                        <Button
                          variant={language === "en" ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            toggleLanguage("en");
                            setIsMobileMenuOpen(false);
                          }}
                          className="rounded-xl"
                        >
                          🇺🇸
                        </Button>
                        <Button
                          variant={language === "es" ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            toggleLanguage("es");
                            setIsMobileMenuOpen(false);
                          }}
                          className="rounded-xl"
                        >
                          🇪🇸
                        </Button>
                      </div>
                    </div>
                  </div>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* 🔹 MOBILE CALL BAR (outside header) */}
      <a
        href="tel:+18009634330"
        className="fixed md:hidden bottom-4 left-4 right-4 z-50
             flex items-center justify-between
             px-4 py-3 rounded-2xl
             bg-success text-success-foreground
             shadow-xl"
      >
        <div>
          <p className="text-sm font-semibold">Call & get best deals</p>
          <p className="text-xs opacity-90">1-800-963-4330</p>
        </div>

        <Phone className="w-5 h-5" />
      </a>
    </>
  );
};

export default Header;
