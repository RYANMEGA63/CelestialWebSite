import {
  createContext, useContext, useState, useEffect,
  useCallback, useRef, type ReactNode,
} from "react";
import { useNavigate } from "react-router";
import { supabaseDb, ADMIN_EMAIL } from "../../../lib/supabaseDb";

// ─── Types ────────────────────────────────────────────────────

export interface DbUser {
  id: string;
  email: string;
  isAdmin: boolean;
}

interface DbContextType {
  user: DbUser | null;
  loading: boolean;
  showWarning: boolean;
  countdown: number;
  logout: () => Promise<void>;
  resetTimer: () => void;
}

// ─── Context ──────────────────────────────────────────────────

const DbContext = createContext<DbContextType>({
  user: null,
  loading: true,
  showWarning: false,
  countdown: 0,
  logout: async () => {},
  resetTimer: () => {},
});

export const useDbAuth = () => useContext(DbContext);

// ─── Provider ─────────────────────────────────────────────────

const INACTIVITY_MS = 30 * 60 * 1000;
const WARNING_MS    =  5 * 60 * 1000;

export function DbAuthProvider({ children }: { children: ReactNode }) {
  const [user,        setUser]        = useState<DbUser | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [countdown,   setCountdown]   = useState(0);
  const navigate = useNavigate();

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const logout = useCallback(async () => {
    await supabaseDb.auth.signOut();
    navigate("/celestial-db/login");
  }, [navigate]);

  const resetTimer = useCallback(() => {
    setShowWarning(false);
    if (countRef.current) clearInterval(countRef.current);
    if (warnRef.current)  clearTimeout(warnRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);

    warnRef.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(WARNING_MS);
      countRef.current = setInterval(() => {
        setCountdown((p) => {
          if (p <= 1000) { clearInterval(countRef.current!); return 0; }
          return p - 1000;
        });
      }, 1000);
    }, INACTIVITY_MS - WARNING_MS);

    timerRef.current = setTimeout(logout, INACTIVITY_MS);
  }, [logout]);

  useEffect(() => {
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"] as const;
    events.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warnRef.current)  clearTimeout(warnRef.current);
      if (countRef.current) clearInterval(countRef.current);
    };
  }, [resetTimer]);

  useEffect(() => {
    supabaseDb.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/celestial-db/login");
        setLoading(false);
        return;
      }
      const email   = session.user.email ?? "";
      const isAdmin = ADMIN_EMAIL ? email === ADMIN_EMAIL : false;
      setUser({ id: session.user.id, email, isAdmin });
      setLoading(false);
    });

    const { data: { subscription } } = supabaseDb.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/celestial-db/login");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <DbContext.Provider value={{ user, loading, showWarning, countdown, logout, resetTimer }}>
      {children}
    </DbContext.Provider>
  );
}
