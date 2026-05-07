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

// ── Inactivity Banner — compact warning strip ─────────────────
function InactivityBanner({ countdown, resetTimer }: { countdown: number; resetTimer: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-1 bg-amber-100 border-b border-amber-400 text-amber-900 text-[11px]">
      <div className="flex items-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span className="font-semibold">
          Déconnexion dans <span className="font-black tabular-nums">{formatCountdown(countdown)}</span>
        </span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={resetTimer}
          className="px-2 py-0.5 bg-amber-500 text-white text-[11px] font-bold border border-amber-700 hover:bg-amber-600"
        >
          Rester connecté
        </button>
        <button onClick={resetTimer} className="p-0.5 text-amber-700 hover:text-amber-900">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Main Layout Inner ─────────────────────────────────────────
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

  // ── Loading state ─────────────────────────────────────────────
  if (loading || wsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-golden border-t-transparent animate-spin" />
          <p className="text-[12px] text-muted-foreground font-semibold">
            {loading ? "Vérification de la session…" : "Résolution de votre espace…"}
          </p>
        </div>
      </div>
    );
  }

  // ── No workspace error ────────────────────────────────────────
  if (!user?.isAdmin && userWorkspaces !== null && userWorkspaces.length === 0 && !isWorkspaceView) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="max-w-sm w-full border border-border bg-card">
          {/* Dialog title bar */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#000080] text-white text-[12px] font-bold">
            <Ban className="w-3.5 h-3.5" />
            Accès refusé — Aucun espace assigné
          </div>
          <div className="p-4 space-y-3">
            <p className="text-[12px] text-foreground">
              Votre compte <span className="font-semibold">{user?.email}</span> n'est assigné à aucun espace de travail.
            </p>
            <p className="text-[11px] text-muted-foreground">
              Contactez votre administrateur pour obtenir un accès.
            </p>
            {/* Status bar */}
            <div className="border border-border bg-toolbar px-2 py-1 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 inline-block" />
              <span className="text-[11px] text-muted-foreground truncate">{user?.email}</span>
            </div>
            <div className="flex justify-end pt-1">
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-4 py-1 bg-muted text-foreground text-[12px] font-medium border border-border hover:bg-[#D0CCC4] bevel-raised"
              >
                <LogOut className="w-3.5 h-3.5" /> Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Multiple workspaces picker ────────────────────────────────
  if (!user?.isAdmin && userWorkspaces !== null && userWorkspaces.length > 1 && !isWorkspaceView) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full border border-border bg-card">
          {/* Dialog title bar */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#000080] text-white text-[12px] font-bold">
            <Layers className="w-3.5 h-3.5" />
            Sélection de l'espace de travail
          </div>
          <div className="p-3 space-y-2">
            <p className="text-[11px] text-muted-foreground mb-2">Vous avez accès à plusieurs espaces de travail. Sélectionnez :</p>
            <div className="border border-border bg-surface-sunken">
              {userWorkspaces.map((ws, i) => (
                <button
                  key={ws.id}
                  onClick={() => navigate(`/celestial-db/workspace/${ws.id}`)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-[12px] text-left border-b border-border last:border-b-0 hover:bg-[color-mix(in_srgb,_var(--golden)_12%,_var(--card))] ${i === 0 ? "bg-[color-mix(in_srgb,_var(--golden)_8%,_var(--card))]" : ""}`}
                >
                  <span className="text-base shrink-0">{ws.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{ws.name}</p>
                    {ws.description && <p className="text-[11px] text-muted-foreground truncate">{ws.description}</p>}
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase px-1.5 py-0.5 border shrink-0"
                    style={{ color: ws.color, borderColor: ws.color, background: `${ws.color}18` }}
                  >
                    {ws.role}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="w-2 h-2 bg-emerald-500 inline-block" />
                {user?.email}
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1 px-3 py-1 text-[11px] text-destructive border border-destructive/30 hover:bg-destructive/10"
              >
                <LogOut className="w-3 h-3" /> Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Immersive Workspace View ──────────────────────────────────
  if (isWorkspaceView) {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        {!user?.isAdmin && showWarning && <InactivityBanner countdown={countdown} resetTimer={resetTimer} />}
        <div className="flex-1 overflow-hidden">
          <Outlet context={{ isDark, setIsDark }} />
        </div>
      </div>
    );
  }

  // ── Admin Layout — Sidebar + Content ─────────────────────────
  const adminNav = [
    { name: "Utilisateurs",       path: "/celestial-db",            icon: Users },
    { name: "Espaces de travail", path: "/celestial-db/workspaces", icon: Layers },
    { name: "Base de données",    path: "/celestial-db/database",   icon: Database },
  ];

  const breadcrumb = adminNav.find((i) => i.path === location.pathname)?.name ?? "DB Manager";

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">

      {/* ── Sidebar — Windows Explorer TreeView style ── */}
      <aside className="hidden lg:flex flex-col w-[200px] shrink-0 h-screen sticky top-0 border-r border-border bg-toolbar overflow-hidden">

        {/* Sidebar header */}
        <div className="px-2 py-1.5 border-b border-border bg-[#000080] text-white">
          <div className="flex items-center gap-1.5">
            <Database className="w-4 h-4 text-golden shrink-0" />
            <span className="text-[13px] font-bold">DB Manager</span>
          </div>
          <p className="text-[10px] text-blue-200 mt-0.5">Administrateur</p>
        </div>

        {/* Session info */}
        <div className="px-2 py-1.5 border-b border-border bg-card text-[11px] space-y-0.5">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-500 inline-block shrink-0" />
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Session active</span>
            <span className="ml-auto px-1 py-0 text-[10px] font-bold bg-golden text-golden-foreground">Admin</span>
          </div>
          <p className="text-muted-foreground truncate">{user?.email ?? "Inconnu"}</p>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3 h-3 shrink-0" />
            <span className="truncate text-[10px]">{formatLastLogin()}</span>
          </div>
        </div>

        {/* Quick links */}
        <div className="px-2 py-1 border-b border-border space-y-0.5">
          <Link
            to="/"
            className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent hover:border-border"
          >
            <Globe className="w-3 h-3" />
            Site principal
          </Link>
          <button
            onClick={() => navigate("/celestial-cms")}
            className="flex items-center gap-1.5 w-full px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent hover:border-border text-left"
          >
            <Settings className="w-3 h-3" />
            Admin Panel
            <ChevronRight className="w-3 h-3 ml-auto" />
          </button>
        </div>

        {/* Nav — list style */}
        <nav className="flex-1 p-1 overflow-y-auto">
          <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Navigation</p>
          {adminNav.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-2 py-1.5 text-[12px] mb-px border ${
                  active
                    ? "bg-golden text-golden-foreground border-[#A07800] font-semibold"
                    : "border-transparent text-foreground hover:bg-muted hover:border-border"
                }`}
              >
                <item.icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{item.name}</span>
                {active && <ChevronRight className="w-3 h-3 ml-auto shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-1 border-t border-border">
          <div className="flex items-center gap-1 px-2 text-[10px] text-muted-foreground mb-1">
            <ShieldCheck className="w-3 h-3" />
            Base de données isolée
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-2 py-1.5 text-[12px] text-destructive border border-transparent hover:bg-destructive/10 hover:border-destructive/30"
          >
            <LogOut className="w-3.5 h-3.5" />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* ── Content area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top toolbar / breadcrumb bar */}
        <header className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-toolbar shrink-0 min-h-[28px]">
          <button
            onClick={() => setShowMobileNav(true)}
            className="lg:hidden p-1 text-muted-foreground hover:bg-muted border border-transparent hover:border-border"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground min-w-0 flex-1">
            <Database className="w-3 h-3 shrink-0" />
            <span>DB Manager</span>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="text-foreground font-semibold truncate">{breadcrumb}</span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-golden text-golden-foreground border border-[#A07800]">
              <ShieldCheck className="w-3 h-3" /> Admin
            </span>
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-1.5 bg-muted text-muted-foreground border border-border hover:text-foreground"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={logout}
              className="lg:hidden flex items-center gap-1 px-2 py-1 text-[11px] text-destructive border border-destructive/30 hover:bg-destructive/10"
            >
              <LogOut className="w-3.5 h-3.5" /> Déco
            </button>
          </div>
        </header>

        {/* Inactivity warning */}
        {showWarning && <InactivityBanner countdown={countdown} resetTimer={resetTimer} />}

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-background">
          <div className="db-content-pad max-w-full h-full flex flex-col">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ── Mobile Navigation Overlay ── */}
      {showMobileNav && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Sidebar panel */}
          <div className="w-[200px] h-full bg-toolbar border-r border-border flex flex-col shadow-[4px_0_8px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-[#000080] text-white">
              <div className="flex items-center gap-1.5 text-[13px] font-bold">
                <Database className="w-4 h-4 text-golden" />
                DB Manager
              </div>
              <button onClick={() => setShowMobileNav(false)} className="p-0.5 hover:bg-blue-800">
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-1">
              {adminNav.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setShowMobileNav(false)}
                    className={`flex items-center gap-2 px-2 py-2 text-[12px] mb-px border ${
                      active
                        ? "bg-golden text-golden-foreground border-[#A07800] font-semibold"
                        : "border-transparent text-foreground hover:bg-muted hover:border-border"
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-2 border-t border-border space-y-1">
              <Link
                to="/"
                className="flex items-center justify-center gap-1.5 w-full py-1.5 text-[12px] font-medium text-muted-foreground border border-border hover:bg-muted"
              >
                <Globe className="w-3.5 h-3.5" /> Site principal
              </Link>
              <button
                onClick={logout}
                className="flex items-center justify-center gap-1.5 w-full py-1.5 text-[12px] text-destructive border border-destructive/30 hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4" /> Déconnexion
              </button>
            </div>
          </div>
          {/* Backdrop */}
          <div className="flex-1 bg-black/30" onClick={() => setShowMobileNav(false)} />
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
