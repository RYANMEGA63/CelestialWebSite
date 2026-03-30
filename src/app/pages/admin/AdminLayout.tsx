import { useEffect, useState, useCallback, useRef } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router";
import { supabase } from "../../../lib/supabase";
import { 
  BarChart3, BookOpen, RefreshCcw, Tag, Briefcase, LogOut, Settings,
  Home, UserRound, Scale, ShoppingCart, MessageSquare, ShieldCheck,
  Clock, AlertTriangle, X, Menu,
} from "lucide-react";
import { ThemeProvider } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;
const WARNING_BEFORE_MS     =  5 * 60 * 1000;
const STORAGE_KEY_LAST      = "admin_last_login";

function formatLastLogin(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatCountdown(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AdminLayout() {
  const [loading, setLoading]         = useState(true);
  const [userEmail, setUserEmail]     = useState<string | null>(null);
  const [lastLogin, setLastLogin]     = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown]     = useState(0);
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const navigate    = useNavigate();
  const location    = useLocation();
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  const handleLogout = useCallback(async (reason?: string) => {
    if (reason) console.info("[Security] Auto-logout:", reason);
    await supabase.auth.signOut();
    navigate("/celestial-cms/login");
  }, [navigate]);

  const resetTimer = useCallback(() => {
    setShowWarning(false);
    if (countRef.current)  clearInterval(countRef.current);
    if (warnRef.current)   clearTimeout(warnRef.current);
    if (timerRef.current)  clearTimeout(timerRef.current);

    warnRef.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(WARNING_BEFORE_MS);
      countRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1000) { clearInterval(countRef.current!); return 0; }
          return prev - 1000;
        });
      }, 1000);
    }, INACTIVITY_TIMEOUT_MS - WARNING_BEFORE_MS);

    timerRef.current = setTimeout(() => handleLogout("inactivité"), INACTIVITY_TIMEOUT_MS);
  }, [handleLogout]);

  useEffect(() => {
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"] as const;
    events.forEach(ev => window.addEventListener(ev, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      events.forEach(ev => window.removeEventListener(ev, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warnRef.current)  clearTimeout(warnRef.current);
      if (countRef.current) clearInterval(countRef.current);
    };
  }, [resetTimer]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/celestial-cms/login"); }
      else {
        setUserEmail(session.user.email ?? null);
        setLastLogin(localStorage.getItem(STORAGE_KEY_LAST));
      }
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/celestial-cms/login");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-semibold">Vérification de la session…</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: "Dashboard",     path: "/celestial-cms",             icon: BarChart3 },
    { name: "Accueil",       path: "/celestial-cms/accueil",     icon: Home },
    { name: "Documentation", path: "/celestial-cms/docs",        icon: BookOpen },
    { name: "Changelog",     path: "/celestial-cms/changelog",   icon: RefreshCcw },
    { name: "Offres",        path: "/celestial-cms/offres",      icon: Tag },
    { name: "Réalisations",  path: "/celestial-cms/portfolio",   icon: Briefcase },
    { name: "À propos",      path: "/celestial-cms/apropos",     icon: UserRound },
    { name: "Paramètres",    path: "/celestial-cms/settings",    icon: Settings },
    { name: "Pages légales", path: "/celestial-cms/legal",       icon: Scale },
    { name: "Commandes",     path: "/celestial-cms/commandes",   icon: ShoppingCart },
    { name: "Messages",      path: "/celestial-cms/messages",    icon: MessageSquare },
  ];

  const currentPage = navItems.find(i => i.path === location.pathname)?.name ?? "Admin";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-base font-black tracking-tight flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            Admin Celestial
          </h1>
          {/* Close on mobile */}
          <button onClick={() => setDrawerOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Session info */}
        <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50 space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Session active</span>
          </div>
          <p className="text-[11px] font-semibold text-muted-foreground truncate">{userEmail ?? "Inconnu"}</p>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
            <Clock className="w-3 h-3 shrink-0" />
            <span className="truncate">Login : {formatLastLogin(lastLogin)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30">
          <ShieldCheck className="w-3 h-3" />
          Connexion chiffrée
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setDrawerOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm ${
                isActive
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-border shrink-0">
        <button
          onClick={() => handleLogout("manuel")}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-left text-red-500 hover:bg-red-500/10 transition-colors text-sm font-semibold"
        >
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </button>
      </div>
    </div>
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background flex overflow-hidden">

        {/* ── Sidebar desktop ── */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border bg-card h-screen sticky top-0 overflow-hidden">
          <SidebarContent />
        </aside>

        {/* ── Mobile drawer overlay ── */}
        <AnimatePresence>
          {drawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDrawerOpen(false)}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-card border-r border-border lg:hidden overflow-hidden flex flex-col"
              >
                <SidebarContent />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ── Main ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Mobile top bar */}
          <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">Admin</p>
              <p className="text-sm font-black truncate">{currentPage}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-semibold text-emerald-500 hidden sm:block">En ligne</span>
            </div>
          </header>

          <main className="flex-1 overflow-auto relative">
            {/* Inactivity warning banner */}
            {showWarning && (
              <div className="sticky top-0 z-50 flex items-center justify-between gap-3 px-4 py-3 bg-amber-500/10 border-b border-amber-500/30">
                <div className="flex items-center gap-2 min-w-0">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <p className="text-sm font-semibold text-amber-400 truncate">
                    Déconnexion dans <span className="font-black tabular-nums">{formatCountdown(countdown)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={resetTimer}
                    className="px-3 py-1 rounded-lg bg-amber-500 text-white text-xs font-black uppercase hover:bg-amber-600 transition-colors"
                  >
                    Rester
                  </button>
                  <button onClick={() => setShowWarning(false)} className="p-1 rounded-lg text-amber-400/60 hover:text-amber-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
