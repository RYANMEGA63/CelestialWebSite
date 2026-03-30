import { Link, useLocation } from "react-router";
import { Menu, X, Sun, Moon, Monitor } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Accueil" },
    { path: "/documentation", label: "Documentation" },
    { path: "/changelog", label: "Changelog" },
    { path: "/offres", label: "Offres" },
    { path: "/a-propos", label: "À propos" },
    { path: "/realisations", label: "Réalisations" },
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

  return (
    <header 
      className={`sticky top-0 z-[100] w-full transition-all duration-300 ${
        scrolled 
          ? "py-2 bg-background/80 backdrop-blur-2xl border-b border-border/50 shadow-sm shadow-black/5" 
          : "py-4 bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group relative z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md group-hover:bg-primary/40 transition-all" />
            <div className="relative bg-linear-to-br from-primary to-secondary p-2 rounded-xl shadow-lg shadow-primary/10 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
          </div>
          <span className="text-2xl font-black tracking-tighter bg-linear-to-r from-primary via-secondary to-primary bg-[length:200%_auto] bg-clip-text text-transparent hover:animate-shimmer">
            Celestial
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1 bg-muted/30 backdrop-blur-md p-1.5 rounded-2xl border border-border/40">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all relative ${
                isActive(link.path)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {link.label}
              {isActive(link.path) && (
                <motion.div
                  layoutId="navTab"
                  className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
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
              className="p-3 rounded-2xl bg-muted/50 border border-border/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <CurrentIcon className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {themeMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setThemeMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute right-0 top-full mt-4 z-50 w-44 rounded-2xl border border-border/50 bg-card/90 backdrop-blur-xl shadow-2xl p-2 gap-1 flex flex-col"
                  >
                    {themeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setTheme(opt.value); setThemeMenuOpen(false); }}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                          theme === opt.value ? "bg-primary text-white" : "hover:bg-muted"
                        }`}
                      >
                        <opt.icon className="w-4 h-4" />
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <Link
            to="/contact"
            className="px-6 py-2.5 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all hover:scale-105 active:scale-95"
          >
            Démarrer un projet
          </Link>
        </div>

        {/* Mobile burger */}
        <div className="lg:hidden flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl bg-muted/50 text-muted-foreground"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-primary text-white shadow-lg shadow-primary/20"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-[90] lg:hidden bg-background/95 backdrop-blur-3xl pt-24 px-6 overflow-y-auto pb-10"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-6 py-5 rounded-[2rem] text-xl font-black tracking-tighter border transition-all ${
                      isActive(link.path)
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-muted/30 border-border/40 text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {link.label}
                    <ArrowRight className={`w-5 h-5 ${isActive(link.path) ? "opacity-100" : "opacity-20"}`} />
                  </Link>
                </motion.div>
              ))}
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-6 w-full py-6 bg-primary text-white rounded-[2rem] text-xl font-black shadow-2xl shadow-primary/20 text-center"
              >
                Contactez-nous
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function ArrowRight(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}
