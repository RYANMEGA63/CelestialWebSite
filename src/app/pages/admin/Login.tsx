import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../../../lib/supabase";
import { Button } from "../../components/Button";
import { Lock, ShieldAlert, ShieldCheck, Eye, EyeOff, AlertTriangle, Clock } from "lucide-react";
import { toast } from "sonner";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const STORAGE_KEY_ATTEMPTS = "admin_login_attempts";
const STORAGE_KEY_LOCKOUT  = "admin_login_lockout_until";
const STORAGE_KEY_LAST     = "admin_last_login";

function getRemainingLockout(): number {
  const until = parseInt(localStorage.getItem(STORAGE_KEY_LOCKOUT) ?? "0", 10);
  return Math.max(0, until - Date.now());
}

function getAttempts(): number {
  return parseInt(localStorage.getItem(STORAGE_KEY_ATTEMPTS) ?? "0", 10);
}

function formatTime(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m}m ${s.toString().padStart(2, "0")}s` : `${s}s`;
}

export function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [attempts, setAttempts] = useState(getAttempts());
  const [remaining, setRemaining] = useState(getRemainingLockout());
  const navigate = useNavigate();

  // Countdown timer when locked out
  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => {
      const r = getRemainingLockout();
      setRemaining(r);
      if (r <= 0) {
        clearInterval(id);
        localStorage.removeItem(STORAGE_KEY_LOCKOUT);
        localStorage.setItem(STORAGE_KEY_ATTEMPTS, "0");
        setAttempts(0);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [remaining]);

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/celestial-cms");
    });
  }, [navigate]);

  const isLocked = remaining > 0;
  const attemptsLeft = MAX_ATTEMPTS - attempts;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem(STORAGE_KEY_ATTEMPTS, String(newAttempts));

      if (newAttempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_DURATION_MS;
        localStorage.setItem(STORAGE_KEY_LOCKOUT, String(until));
        setRemaining(LOCKOUT_DURATION_MS);
        toast.error("Compte verrouillé", {
          description: "Trop de tentatives. Réessayez dans 15 minutes.",
        });
      } else {
        // Generic message — never reveal if email or password is wrong
        toast.error("Identifiants incorrects", {
          description: `Email ou mot de passe invalide. ${MAX_ATTEMPTS - newAttempts} tentative${MAX_ATTEMPTS - newAttempts > 1 ? "s" : ""} restante${MAX_ATTEMPTS - newAttempts > 1 ? "s" : ""}.`,
        });
      }
    } else {
      // Successful login — reset counters and record timestamp
      localStorage.setItem(STORAGE_KEY_ATTEMPTS, "0");
      localStorage.removeItem(STORAGE_KEY_LOCKOUT);
      localStorage.setItem(STORAGE_KEY_LAST, new Date().toISOString());
      toast.success("Connexion réussie");
      navigate("/celestial-cms");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4 shadow-xl shadow-primary/20">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Admin Celestial</h1>
          <p className="text-sm text-muted-foreground mt-1">Accès sécurisé — personnel autorisé uniquement</p>
        </div>

        {/* Lockout banner */}
        {isLocked && (
          <div className="mb-4 p-4 rounded-xl border border-red-500/30 bg-red-500/5 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-black text-red-400">Accès temporairement bloqué</p>
              <p className="text-xs text-red-400/70 mt-0.5">
                Trop de tentatives échouées. Réessayez dans{" "}
                <span className="font-black tabular-nums">{formatTime(remaining)}</span>.
              </p>
            </div>
          </div>
        )}

        {/* Attempts warning */}
        {!isLocked && attempts > 0 && attempts < MAX_ATTEMPTS && (
          <div className="mb-4 p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-xs font-semibold text-amber-400">
              {attemptsLeft} tentative{attemptsLeft > 1 ? "s" : ""} restante{attemptsLeft > 1 ? "s" : ""} avant verrouillage.
            </p>
          </div>
        )}

        {/* Form card */}
        <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-6 shadow-2xl shadow-black/10">
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
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
                  className="w-full px-3 py-2.5 pr-10 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full mt-2"
              disabled={loading || isLocked}
            >
              {isLocked ? (
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Verrouillé — {formatTime(remaining)}
                </span>
              ) : loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Vérification...
                </span>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 mt-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          Connexion chiffrée via Supabase Auth
        </div>
      </div>
    </div>
  );
}
