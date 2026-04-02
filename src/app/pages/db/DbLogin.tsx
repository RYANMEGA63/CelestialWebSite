import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { supabaseDb } from "../../../lib/supabaseDb";
import { Lock, ShieldAlert, ShieldCheck, Eye, EyeOff, AlertTriangle, Clock, Database, Moon, Sun } from "lucide-react";
import { toast } from "sonner";

const MAX_ATTEMPTS        = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const SK_ATTEMPTS         = "db_login_attempts";
const SK_LOCKOUT          = "db_login_lockout_until";
const SK_LAST             = "db_last_login";

function getRemainingLockout() {
  return Math.max(0, parseInt(localStorage.getItem(SK_LOCKOUT) ?? "0", 10) - Date.now());
}
function getAttempts() {
  return parseInt(localStorage.getItem(SK_ATTEMPTS) ?? "0", 10);
}
function formatTime(ms: number) {
  const t = Math.ceil(ms / 1000);
  const m = Math.floor(t / 60);
  const s = t % 60;
  return m > 0 ? `${m}m ${s.toString().padStart(2, "0")}s` : `${s}s`;
}

export function DbLogin() {
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPwd,   setShowPwd]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [attempts,  setAttempts]  = useState(getAttempts);
  const [remaining, setRemaining] = useState(getRemainingLockout);
  const navigate = useNavigate();

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

  // Countdown timer
  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => {
      const r = getRemainingLockout();
      setRemaining(r);
      if (r <= 0) {
        clearInterval(id);
        localStorage.removeItem(SK_LOCKOUT);
        localStorage.setItem(SK_ATTEMPTS, "0");
        setAttempts(0);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [remaining]);

  // Redirect if already logged in
  useEffect(() => {
    supabaseDb.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/celestial-db");
    });
  }, [navigate]);

  const isLocked    = remaining > 0;
  const attemptsLeft = MAX_ATTEMPTS - attempts;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    setLoading(true);

    const { error } = await supabaseDb.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      const next = attempts + 1;
      setAttempts(next);
      localStorage.setItem(SK_ATTEMPTS, String(next));
      if (next >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_DURATION_MS;
        localStorage.setItem(SK_LOCKOUT, String(until));
        setRemaining(LOCKOUT_DURATION_MS);
        toast.error("Accès verrouillé", { description: "Trop de tentatives. Réessayez dans 15 minutes." });
      } else {
        toast.error("Identifiants incorrects", {
          description: `${MAX_ATTEMPTS - next} tentative${MAX_ATTEMPTS - next > 1 ? "s" : ""} restante${MAX_ATTEMPTS - next > 1 ? "s" : ""}.`,
        });
      }
    } else {
      localStorage.setItem(SK_ATTEMPTS, "0");
      localStorage.removeItem(SK_LOCKOUT);
      localStorage.setItem(SK_LAST, new Date().toISOString());
      toast.success("Connexion réussie");
      navigate("/celestial-db");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden transition-colors duration-300">
      
      {/* Theme Toggle */}
      <button 
        onClick={() => setIsDark(!isDark)}
        className="absolute top-6 right-6 p-2 rounded-full bg-secondary/10 hover:bg-secondary/20 text-foreground transition-all z-50 border border-border"
      >
        {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
      </button>

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4 shadow-xl shadow-primary/30">
            <Database className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">DB Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Accès réservé — administrateurs uniquement</p>
        </div>

        {/* Lockout banner */}
        {isLocked && (
          <div className="mb-4 p-4 rounded-xl border border-destructive/30 bg-destructive/10 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-black text-destructive">Accès temporairement bloqué</p>
              <p className="text-xs text-destructive/80 mt-0.5">
                Réessayez dans <span className="font-black tabular-nums">{formatTime(remaining)}</span>.
              </p>
            </div>
          </div>
        )}

        {/* Attempts warning */}
        {!isLocked && attempts > 0 && attempts < MAX_ATTEMPTS && (
          <div className="mb-4 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              {attemptsLeft} tentative{attemptsLeft > 1 ? "s" : ""} restante{attemptsLeft > 1 ? "s" : ""} avant verrouillage.
            </p>
          </div>
        )}

        {/* Form card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl shadow-black/5 dark:shadow-black/40">
          <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLocked}
                autoComplete="username"
                placeholder="admin@example.com"
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLocked}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2.5 pr-10 rounded-xl border border-input bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || isLocked}
              className="w-full mt-2 py-2.5 rounded-xl font-black text-sm bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLocked ? (
                <span className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  Verrouillé — {formatTime(remaining)}
                </span>
              ) : loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Vérification...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" />
                  Accéder au panneau
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 mt-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <ShieldCheck className="w-3.5 h-3.5" />
          Connexion chiffrée — base de données isolée
        </div>
      </div>
    </div>
  );
}
