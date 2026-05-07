import { Link, useLocation } from "react-router";
import { Menu, X, Sun, Moon, Monitor, Database } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useUIStore } from "../../store/useUIStore";

export function Header() {
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { openWizard } = useUIStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setThemeMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

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

  return (
    <>
      {/* ── Main Menubar — Windows-style, static, 1px border bottom ── */}
      <header className="fixed top-0 z-[100] w-full bg-toolbar border-b border-border-strong">
        <div className="flex items-stretch h-[28px]">

          {/* Logo / App name */}
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 border-r border-border text-foreground font-bold text-[13px] hover:bg-muted"
          >
            <Database className="w-3.5 h-3.5 text-golden" />
            Celestial
          </Link>

          {/* Desktop Navigation — menubar style */}
          <nav className="hidden lg:flex items-stretch">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-3 text-[12px] font-medium border-r border-transparent hover:bg-muted hover:border-border ${
                  isActive(link.path)
                    ? "bg-muted border-b-2 border-b-golden text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right-side controls */}
          <div className="ml-auto flex items-stretch">

            {/* DB link */}
            <Link
              to="/celestial-db"
              className="hidden lg:flex items-center gap-1 px-3 text-[11px] font-semibold text-muted-foreground border-l border-border hover:bg-muted hover:text-foreground"
            >
              <Database className="w-3 h-3" />
              DB Manager
            </Link>

            {/* Theme toggle */}
            <div className="relative border-l border-border">
              <button
                id="theme-toggle-btn"
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                className="flex items-center justify-center w-8 h-full text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Changer le thème"
              >
                <CurrentIcon className="w-3.5 h-3.5" />
              </button>
              {themeMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setThemeMenuOpen(false)} />
                  <div className="absolute right-0 top-full z-50 w-36 border border-border bg-card shadow-[2px_2px_4px_rgba(0,0,0,0.3)]">
                    {themeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setTheme(opt.value); setThemeMenuOpen(false); }}
                        className={`flex items-center gap-2 w-full px-3 py-1.5 text-[12px] text-left ${
                          theme === opt.value
                            ? "bg-golden text-golden-foreground font-semibold"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        <opt.icon className="w-3 h-3" />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Primary CTA button */}
            <button
              id="header-cta-btn"
              onClick={() => openWizard()}
              className="hidden lg:flex items-center gap-1.5 px-4 h-full bg-golden text-golden-foreground font-semibold text-[12px] border-l border-[#A07800] hover:bg-[#C8A800] active:bg-[#B09000]"
            >
              Démarrer un projet
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-full text-muted-foreground border-l border-border hover:bg-muted"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu — Dropdown panel style ── */}
      {mobileMenuOpen && (
        <div className="fixed top-[28px] left-0 right-0 z-[90] lg:hidden bg-card border-b border-border shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center px-4 py-2 text-[13px] border-b border-border ${
                isActive(link.path)
                  ? "bg-golden text-golden-foreground font-semibold"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="p-2 border-t border-border">
            <button
              onClick={() => { openWizard(); setMobileMenuOpen(false); }}
              className="w-full py-2 bg-golden text-golden-foreground font-semibold text-[13px] border border-[#A07800] hover:bg-[#C8A800]"
            >
              Démarrer un projet
            </button>
          </div>
        </div>
      )}
    </>
  );
}
