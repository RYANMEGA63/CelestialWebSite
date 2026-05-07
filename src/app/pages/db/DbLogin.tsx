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

  const isLocked     = remaining > 0;
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">

      {/* Theme Toggle — compact corner button */}
      <button
        onClick={() => setIsDark(!isDark)}
        className="absolute top-2 right-2 p-1.5 border border-border bg-muted text-foreground hover:bg-[#D0CCC4] bevel-raised"
        title="Changer le thème"
      >
        {isDark ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5" />}
      </button>

      {/* Login dialog — Windows-style dialog box */}
      <div className="w-full max-w-[360px]">

        {/* Dialog Title Bar */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#000080] text-white">
          <Database className="w-3.5 h-3.5 text-golden shrink-0" />
          <span className="text-[13px] font-bold flex-1">DB Manager — Authentification</span>
          <div className="w-4 h-4 border border-white/50 bg-muted/20 flex items-center justify-center text-[10px]">×</div>
        </div>

        {/* Dialog Body */}
        <div className="bg-card border border-border border-t-0 p-4 space-y-3">

          {/* Lockout banner */}
          {isLocked && (
            <div className="flex items-start gap-2 p-2 border border-destructive bg-destructive/10">
              <ShieldAlert className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-bold text-destructive">Accès temporairement bloqué</p>
                <p className="text-[11px] text-destructive/80 mt-0.5">
                  Réessayez dans <span className="font-bold tabular-nums">{formatTime(remaining)}</span>.
                </p>
              </div>
            </div>
          )}

          {/* Attempts warning */}
          {!isLocked && attempts > 0 && attempts < MAX_ATTEMPTS && (
            <div className="flex items-center gap-2 p-2 border border-amber-500 bg-amber-50">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <p className="text-[11px] font-semibold text-amber-700">
                {attemptsLeft} tentative{attemptsLeft > 1 ? "s" : ""} restante{attemptsLeft > 1 ? "s" : ""} avant verrouillage.
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-2" autoComplete="off">

            {/* Email field */}
            <div>
              <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                Adresse e-mail :
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLocked}
                autoComplete="username"
                placeholder="admin@example.com"
                className="w-full px-2 py-1 border border-border bg-surface-sunken text-foreground text-[12px] placeholder:text-muted-foreground focus:outline focus:outline-1 focus:outline-golden disabled:opacity-50 disabled:cursor-not-allowed bevel-sunken"
                required
              />
            </div>

            {/* Password field */}
            <div>
              <label className="block text-[11px] font-semibold text-foreground mb-0.5">
                Mot de passe :
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLocked}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  className="w-full px-2 py-1 pr-8 border border-border bg-surface-sunken text-foreground text-[12px] placeholder:text-muted-foreground focus:outline focus:outline-1 focus:outline-golden disabled:opacity-50 disabled:cursor-not-allowed bevel-sunken"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Separator */}
            <div className="h-px bg-border my-2" />

            {/* Buttons row — aligned right, Windows-style */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="submit"
                disabled={loading || isLocked}
                className="flex items-center gap-1.5 px-4 py-1 bg-golden text-golden-foreground text-[12px] font-semibold border border-[#A07800] hover:bg-[#C8A800] active:bg-[#B09000] disabled:opacity-50 disabled:cursor-not-allowed bevel-raised"
              >
                {isLocked ? (
                  <><Clock className="w-3.5 h-3.5" /> Verrouillé — {formatTime(remaining)}</>
                ) : loading ? (
                  <><span className="w-3 h-3 border-2 border-golden-foreground/30 border-t-golden-foreground animate-spin" /> Vérification…</>
                ) : (
                  <><Lock className="w-3.5 h-3.5" /> Se connecter</>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-4 py-1 bg-muted text-foreground text-[12px] font-medium border border-border hover:bg-[#D0CCC4] bevel-raised"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>

        {/* Security status bar */}
        <div className="flex items-center gap-2 px-2 py-0.5 bg-toolbar border border-border border-t-0 text-[10px] text-muted-foreground">
          <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
          Connexion chiffrée — base de données isolée
        </div>
      </div>
    </div>
  );
}
