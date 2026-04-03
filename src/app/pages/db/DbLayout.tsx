import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router";
import {
  Database, LogOut, Users, ShieldCheck, Clock, Layers,
  AlertTriangle, X, ChevronRight, Settings, Ban, MessageSquare,
  Sun, Moon, Globe, Menu
} from "lucide-react";
import { DbAuthProvider, useDbAuth } from "./DbContext";
import { supabaseDbAdmin } from "../../../lib/supabaseDb";

function formatCountdown(ms: number) {
  const t = Math.ceil(ms / 1000);
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
function formatLastLogin() {
  const iso = localStorage.getItem("db_last_login");
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

interface UserWorkspace {
  id: string; name: string; emoji: string; color: string; description: string | null; role: string;
}

// ─────────────────────────────────────────────────────────────
function InactivityBanner({ countdown, resetTimer }: { countdown: number; resetTimer: () => void }) {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-3 px-4 py-3 bg-amber-500/10 border-b border-amber-500/20">
      <div className="flex items-center gap-2 min-w-0">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
        <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 truncate">
          Déconnexion dans <span className="font-black tabular-nums">{formatCountdown(countdown)}</span>
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={resetTimer} className="px-3 py-1 rounded-lg bg-amber-500 text-white text-xs font-black uppercase hover:bg-amber-600 transition-colors">
          Rester
        </button>
        <button onClick={resetTimer} className="p-1 rounded-lg text-amber-600/60 dark:text-amber-400/40 hover:text-amber-600 dark:hover:text-amber-400">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function DbLayoutInner() {
  const { user, loading, showWarning, countdown, logout, resetTimer } = useDbAuth();
  const location = useLocation();
  const navigate  = useNavigate();

  const [userWorkspaces,  setUserWorkspaces]  = useState<UserWorkspace[] | null>(null);
  const [wsLoading,       setWsLoading]       = useState(false);
  const [showMobileNav,   setShowMobileNav]   = useState(false);

  const isWorkspaceView = location.pathname.startsWith("/celestial-db/workspace/");

  // THEME MANAGEMENT
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains("dark") || 
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches) ||
      localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    if (loading || !user || user.isAdmin || isWorkspaceView) return;
    setWsLoading(true);
    supabaseDbAdmin
      .from("workspace_members")
      .select("role, workspaces(id, name, emoji, color, description)")
      .eq("user_id", user.id)
      .then(({ data }) => {
        const workspaces: UserWorkspace[] = (data ?? []).map((m) => {
          const ws = (m.workspaces as unknown) as { id: string; name: string; emoji: string; color: string; description: string | null } | null;
          if (!ws) return null;
          return { ...ws, role: m.role };
        }).filter((w): w is UserWorkspace => w !== null);
        setUserWorkspaces(workspaces);
        if (workspaces.length === 1) navigate(`/celestial-db/workspace/${workspaces[0].id}`, { replace: true });
        setWsLoading(false);
      });
  }, [user, loading, navigate, isWorkspaceView]);

  if (loading || wsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-semibold">
            {loading ? "Vérification de la session…" : "Résolution de votre espace…"}
          </p>
        </div>
      </div>
    );
  }

  // ── No workspace error ────────────────────────────────────────
  if (!user?.isAdmin && userWorkspaces !== null && userWorkspaces.length === 0 && !isWorkspaceView) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 bg-destructive/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-md w-full text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 mx-auto">
            <Ban className="w-8 h-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-foreground">Aucun espace assigné</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Votre compte <span className="text-foreground font-semibold">{user?.email}</span> n'est assigné à aucun espace de travail.<br />
              Contactez votre administrateur pour obtenir un accès.
            </p>
          </div>
          <div className="p-4 rounded-2xl border border-border bg-card flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 border border-border flex items-center justify-center shrink-0">
              <span className="text-xs font-black text-foreground">{user?.email?.slice(0, 2).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user?.email}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Session active</span>
              </div>
            </div>
          </div>
          <button onClick={logout} className="w-full py-3 rounded-xl text-sm font-black text-muted-foreground border border-border hover:bg-muted hover:text-foreground transition-all flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" /> Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  // ── Multiple workspaces picker ────────────────────────────────
  if (!user?.isAdmin && userWorkspaces !== null && userWorkspaces.length > 1 && !isWorkspaceView) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-lg w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary mb-2 shadow-lg shadow-primary/20">
              <Layers className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-black text-foreground">Choisir un espace</h1>
            <p className="text-sm text-muted-foreground">Vous avez accès à plusieurs espaces de travail</p>
          </div>
          <div className="space-y-3">
            {userWorkspaces.map((ws) => (
              <button key={ws.id} onClick={() => navigate(`/celestial-db/workspace/${ws.id}`)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:bg-muted transition-all text-left group"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${ws.color}25`, border: `1px solid ${ws.color}40` }}>
                  {ws.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-foreground truncate">{ws.name}</p>
                  {ws.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{ws.description}</p>}
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border"
                    style={{ color: ws.color, backgroundColor: `${ws.color}15`, borderColor: `${ws.color}30` }}>
                    <MessageSquare className="w-2.5 h-2.5" /> {ws.role}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-muted-foreground">{user?.email}</span>
            </div>
            <button onClick={logout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-all">
              <LogOut className="w-3.5 h-3.5" /> Déconnexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Immersive Workspace View (Both roles) ─────────
  if (isWorkspaceView) {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden transition-colors duration-300">
        {!user?.isAdmin && showWarning && <InactivityBanner countdown={countdown} resetTimer={resetTimer} />}
        <div className="flex-1 overflow-hidden">
          <Outlet context={{ isDark, setIsDark }} />
        </div>
      </div>
    );
  }

  // ── Admin layout ──────────────────────────────────────────────
  const adminNav = [
    { name: "Utilisateurs",       path: "/celestial-db",            icon: Users },
    { name: "Espaces de travail", path: "/celestial-db/workspaces", icon: Layers },
    { name: "Base de données",    path: "/celestial-db/database",   icon: Database },
  ];

  const breadcrumb = isWorkspaceView
    ? "Espace de travail"
    : adminNav.find((i) => i.path === location.pathname)?.name ?? "DB Manager";

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden transition-colors duration-300">
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 overflow-hidden border-r border-border bg-card/30">
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-border">
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2 mb-4 w-full rounded-xl text-left border border-border bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground transition-all text-xs font-bold"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Site principal</span>
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                <Database className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight">DB Manager</h1>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Administrateur</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-muted/50 border border-border space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Session active</span>
                <span className="ml-auto text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">Admin</span>
              </div>
              <p className="text-[11px] font-semibold text-muted-foreground truncate">{user?.email ?? "Inconnu"}</p>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
                <Clock className="w-3 h-3 shrink-0" />
                <span className="truncate">Login : {formatLastLogin()}</span>
              </div>
            </div>
            <button onClick={() => navigate("/celestial-cms")} className="mt-3 flex items-center gap-2 w-full px-2.5 py-2 rounded-xl border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all text-xs font-semibold">
              <Settings className="w-3.5 h-3.5" />
              Admin Panel principal
              <ChevronRight className="w-3 h-3 ml-auto" />
            </button>
            <div className="flex items-center gap-1.5 mt-3 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
              <ShieldCheck className="w-3 h-3" />
              Base de données isolée
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {adminNav.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                    isActive
                      ? "bg-gradient-to-r from-primary/20 to-secondary/10 text-foreground border border-primary/20 font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary" />}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-border">
            <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-left text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-all text-sm font-semibold">
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-border bg-card/30 shrink-0">
          <button onClick={() => setShowMobileNav(true)} className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-all">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold min-w-0 flex-1">
            <Database className="w-3.5 h-3.5 shrink-0 hidden sm:block" />
            <span className="hidden sm:inline">DB Manager</span>
            <ChevronRight className="w-3 h-3 shrink-0 hidden sm:block" />
            <span className="text-foreground truncate">{breadcrumb}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-all border border-border"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>
            <span className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
              <ShieldCheck className="w-3 h-3" /> Admin
            </span>
            <button onClick={logout} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-all lg:hidden">
              <LogOut className="w-3.5 h-3.5" /> Déco
            </button>
          </div>
        </header>

        <main className={`flex-1 relative ${isWorkspaceView ? "overflow-hidden flex flex-col" : "overflow-auto"}`}>
          {showWarning && <InactivityBanner countdown={countdown} resetTimer={resetTimer} />}
          {isWorkspaceView ? (
            <div className="flex-1 overflow-hidden h-full">
              <Outlet context={{ isDark, setIsDark }} />
            </div>
          ) : (
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto h-full flex flex-col">
              <Outlet />
            </div>
          )}
        </main>
      </div>

      {/* Mobile Navigation Overlay */}
      {showMobileNav && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-background/80 backdrop-blur-sm">
          <div className="w-64 max-w-[80vw] h-full bg-card border-r border-border shadow-2xl flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Database className="w-4 h-4 text-primary-foreground" />
                </div>
                <h2 className="font-black text-sm">DB Manager</h2>
              </div>
              <button onClick={() => setShowMobileNav(false)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="mb-4">
                <p className="px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Admin Panel</p>
                {adminNav.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link key={item.path} to={item.path} onClick={() => setShowMobileNav(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm mb-1 ${
                        isActive
                          ? "bg-gradient-to-r from-primary/20 to-secondary/10 text-foreground border border-primary/20 font-semibold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
            <div className="p-4 border-t border-border">
               <Link to="/" className="flex items-center justify-center gap-2 w-full py-2 mb-3 rounded-xl bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-xs font-semibold border border-transparent hover:border-border">
                 <Globe className="w-3.5 h-3.5" /> Site principal
               </Link>
               <button onClick={logout} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-destructive hover:bg-destructive/10 transition-all text-sm font-semibold border border-destructive/20 bg-destructive/5">
                 <LogOut className="w-4 h-4" /> Déconnexion
               </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setShowMobileNav(false)} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
export function DbLayout() {
  return (
    <DbAuthProvider>
      <DbLayoutInner />
    </DbAuthProvider>
  );
}
