import { Link, useLocation } from "react-router";
import { Menu, X, Sun, Moon, Monitor, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useUIStore } from "../../store/useUIStore";

export function Header() {
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { isMobileMenuOpen, setMobileMenuOpen, toggleMobileMenu, openWizard } = useUIStore();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const isActive = (path: string) => location.pathname === path;

  // Is the header over a dark section? (hero is always dark bg)
  const isHeroPage = location.pathname === "/";
  const isOverDark = isHeroPage && !scrolled;

  const navLinks = [
    { path: "/", label: "Accueil" },
    { path: "/documentation", label: "Documentation" },
    { path: "/changelog", label: "Changelog" },
    { path: "/offres", label: "Offres" },
    { path: "/a-propos", label: "À propos" },
    { path: "/realisations", label: "Réalisations" },
    { path: "/contact", label: "Contact" },
  ];

  const themeOptions = [
    { value: "light", label: "Clair", icon: Sun },
    { value: "dark", label: "Sombre", icon: Moon },
    { value: "system", label: "Système", icon: Monitor },
  ];

  const currentThemeIcon = () => {
    if (!mounted) return Monitor;
    if (theme === "light") return Sun;
    if (theme === "dark") return Moon;
    return Monitor;
  };

  const CurrentIcon = currentThemeIcon();

  // Text color strategy: white on dark hero, normal elsewhere
  const textColor = isOverDark ? "text-white/70" : "text-muted-foreground";
  const textColorHover = isOverDark ? "hover:text-white" : "hover:text-foreground";
  const logoColor = isOverDark ? "text-white" : "text-foreground";
  const activeColor = isOverDark ? "text-white" : "text-foreground";

  return (
    <>
      <header
        className={`fixed top-0 z-[100] w-full transition-all duration-500 ${
          scrolled
            ? "py-3 bg-background/90 backdrop-blur-xl border-b border-border/40"
            : "py-5 bg-transparent border-b border-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group relative z-10">
            {/* Minimal wordmark — no icon, typography-first */}
            <span
              className={`transition-colors duration-300 ${logoColor}`}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.5rem",
                fontWeight: 500,
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              Celestial
            </span>
            <div className="w-1 h-1 rounded-full bg-secondary mt-1" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative text-[11px] tracking-[0.15em] uppercase font-body font-medium transition-colors duration-200 ${
                  isActive(link.path) ? activeColor : `${textColor} ${textColorHover}`
                }`}
              >
                {link.label}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="navUnderline"
                    className="absolute -bottom-1 left-0 right-0 h-px bg-secondary"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Widgets */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Theme toggle */}
            <div className="relative">
              <button
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                className={`p-2.5 transition-colors ${textColor} ${textColorHover}`}
                aria-label="Changer le thème"
              >
                <CurrentIcon className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {themeMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setThemeMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-full mt-3 z-50 w-40 border border-border/50 bg-card/95 backdrop-blur-xl shadow-xl p-1 flex flex-col gap-0.5"
                    >
                      {themeOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setTheme(opt.value); setThemeMenuOpen(false); }}
                          className={`flex items-center gap-3 px-3 py-2.5 text-[11px] tracking-[0.1em] uppercase font-body font-medium transition-colors ${
                            theme === opt.value
                              ? "bg-secondary text-secondary-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <opt.icon className="w-3.5 h-3.5" />
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* CTA */}
            <button
              onClick={() => openWizard()}
              className="group flex items-center gap-2.5 px-6 py-2.5 bg-secondary text-secondary-foreground font-body font-medium text-[11px] tracking-[0.15em] uppercase transition-all hover:bg-secondary/90"
            >
              Démarrer un projet
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Mobile controls */}
          <div className="lg:hidden flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`p-2 transition-colors ${textColor}`}
              aria-label="Changer le thème"
            >
              {theme === "dark"
                ? <Sun className="w-5 h-5" />
                : <Moon className="w-5 h-5" />
              }
            </button>
            <button
              onClick={toggleMobileMenu}
              className={`p-2 transition-colors ${textColor} ${textColorHover}`}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[90] lg:hidden bg-foreground flex flex-col"
          >
            {/* Close row */}
            <div className="flex items-center justify-between px-6 py-5">
              <span className="text-primary-foreground/80"
                style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 400, letterSpacing: "-0.03em" }}>
                Celestial
              </span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-primary-foreground/50 hover:text-primary-foreground transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="h-px bg-primary-foreground/10" />

            {/* Nav links */}
            <div className="flex-1 flex flex-col justify-center px-6 py-12 gap-0">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between py-5 border-b transition-colors ${
                      isActive(link.path)
                        ? "border-secondary text-primary-foreground"
                        : "border-primary-foreground/10 text-primary-foreground/40 hover:text-primary-foreground"
                    }`}
                    style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 5vw, 2.5rem)", fontWeight: 300, letterSpacing: "-0.02em" }}
                  >
                    {link.label}
                    {isActive(link.path) && <div className="w-1.5 h-1.5 rounded-full bg-secondary" />}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="px-6 pb-10">
              <button
                onClick={() => openWizard()}
                className="flex items-center justify-center gap-3 w-full py-5 bg-secondary text-secondary-foreground font-body font-medium text-sm tracking-[0.1em] uppercase"
              >
                Démarrer un projet
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
