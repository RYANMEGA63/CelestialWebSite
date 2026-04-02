import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { dbAdminFetch, supabaseDbAdmin, type SupabaseUser } from "../../../lib/supabaseDb";
import { useDbAuth } from "./DbContext";
import {
  Users, UserPlus, Search, RefreshCw, X, Eye, EyeOff,
  CheckCircle, XCircle, Mail, Calendar, Key, Copy, Check,
  Shield, AlertCircle, Loader2, ChevronDown, ChevronUp,
  Trash2, AlertTriangle, Layers,
} from "lucide-react";
import { toast } from "sonner";

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
function getInitials(email: string) {
  return email.split("@")[0].slice(0, 2).toUpperCase();
}
function generatePassword() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => chars[b % chars.length])
    .join("");
}

interface WorkspaceInfo {
  workspace_id: string;
  workspace_name: string;
  role: string;
}

export function DbUsersPage() {
  const { user: authUser } = useDbAuth();
  const navigate = useNavigate();

  const [users,       setUsers]       = useState<SupabaseUser[]>([]);
  const [filtered,    setFiltered]    = useState<SupabaseUser[]>([]);
  const [memberMap,   setMemberMap]   = useState<Record<string, WorkspaceInfo[]>>({});
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [search,      setSearch]      = useState("");
  const [showCreate,  setShowCreate]  = useState(false);
  const [expandedId,  setExpandedId]  = useState<string | null>(null);
  const [creating,    setCreating]    = useState(false);
  const [deletingId,  setDeletingId]  = useState<string | null>(null);
  const [confirmDel,  setConfirmDel]  = useState<SupabaseUser | null>(null);
  const [copied,      setCopied]      = useState(false);
  const [showPwd,     setShowPwd]     = useState(false);
  const [showCnf,     setShowCnf]     = useState(false);
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });

  const fetchMemberships = useCallback(async () => {
    try {
      const { data: members } = await supabaseDbAdmin
        .from("workspace_members")
        .select("user_id, role, workspaces(id, name)");
      if (!members) return;
      const map: Record<string, WorkspaceInfo[]> = {};
      for (const m of members) {
        const ws = (m.workspaces as unknown) as { id: string; name: string } | null;
        if (!ws) continue;
        if (!map[m.user_id]) map[m.user_id] = [];
        map[m.user_id].push({ workspace_id: ws.id, workspace_name: ws.name, role: m.role });
      }
      setMemberMap(map);
    } catch { /* non-critical */ }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dbAdminFetch("/admin/users?per_page=1000");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      const list: SupabaseUser[] = data.users ?? data ?? [];
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setUsers(list);
      await fetchMemberships();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setError(msg);
      toast.error("Impossible de charger les utilisateurs", { description: msg });
    } finally {
      setLoading(false);
    }
  }, [fetchMemberships]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(users); return; }
    const q = search.toLowerCase();
    setFiltered(users.filter((u) => u.email.toLowerCase().includes(q) || u.id.includes(q)));
  }, [search, users]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas"); return;
    }
    if (form.password.length < 8) {
      toast.error("Mot de passe trop court (8 caractères minimum)"); return;
    }
    setCreating(true);
    try {
      const res = await dbAdminFetch("/admin/users", {
        method: "POST",
        body: JSON.stringify({ email: form.email, password: form.password, email_confirm: true }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `HTTP ${res.status}`);
      }
      toast.success("Compte créé", { description: `${form.email} est maintenant actif.` });
      setForm({ email: "", password: "", confirmPassword: "" });
      setShowCreate(false);
      await fetchUsers();
    } catch (err) {
      toast.error("Échec", { description: err instanceof Error ? err.message : "Erreur inconnue" });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (user: SupabaseUser) => {
    setDeletingId(user.id);
    try {
      const res = await dbAdminFetch(`/admin/users/${user.id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `HTTP ${res.status}`);
      }
      toast.success("Compte supprimé", { description: user.email });
      setConfirmDel(null);
      setExpandedId(null);
      await fetchUsers();
    } catch (err) {
      toast.error("Échec de la suppression", { description: err instanceof Error ? err.message : "Erreur" });
    } finally {
      setDeletingId(null);
    }
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("UUID copié !");
  };

  const confirmed = users.filter((u) => u.email_confirmed_at).length;
  const recent7   = users.filter((u) => Date.now() - new Date(u.created_at).getTime() < 7 * 86400000).length;

  const ROLE_COLORS: Record<string, string> = {
    owner:  "text-primary bg-primary/10 border-primary/20",
    editor: "text-secondary bg-secondary/10 border-secondary/20",
    viewer: "text-muted-foreground bg-muted border-border",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Gestion des Utilisateurs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {users.length} compte{users.length !== 1 ? "s" : ""} enregistré{users.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground border border-border hover:bg-muted hover:text-foreground transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black text-primary-foreground bg-primary shadow-lg hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Nouveau compte
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total comptes",      value: users.length, icon: Users,        color: "text-primary", bg: "bg-primary/10" },
          { label: "Emails confirmés",   value: confirmed,    icon: CheckCircle,  color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Créés cette semaine",value: recent7,      icon: Calendar,     color: "text-secondary",    bg: "bg-secondary/10"   },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="p-4 rounded-2xl border border-border bg-card flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground font-semibold">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher par email ou UUID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm transition-all"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/10 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black text-destructive">Erreur de chargement</p>
            <p className="text-xs text-destructive/80 mt-0.5">{error}</p>
            <p className="text-xs text-destructive/60 mt-1">Vérifiez VITE_DB_SUPABASE_SERVICE_ROLE_KEY dans .env.local</p>
          </div>
        </div>
      )}

      {/* User list */}
      <div className="space-y-2">
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Chargement des comptes…</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 flex items-center justify-center text-center">
            <div>
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground font-semibold">
                {search ? "Aucun résultat" : "Aucun utilisateur"}
              </p>
            </div>
          </div>
        ) : (
          filtered.map((user) => {
            const isExpanded  = expandedId === user.id;
            const isConfirmed = !!user.email_confirmed_at;
            const isDeleting  = deletingId === user.id;
            const workspaces  = memberMap[user.id] ?? [];
            const isAdmin     = user.email === authUser?.email;

            return (
              <div key={user.id} className="rounded-2xl border border-border bg-card overflow-hidden transition-all">
                {/* Row */}
                <div className="flex items-center gap-4 p-4">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : user.id)}
                    className="flex items-center gap-4 flex-1 min-w-0 text-left"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isAdmin ? "bg-gradient-to-br from-primary to-secondary" : "bg-muted border border-border"}`}>
                      {isAdmin ? (
                        <Shield className="w-4 h-4 text-primary-foreground" />
                      ) : (
                        <span className="text-xs font-black text-foreground">{getInitials(user.email)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground truncate">{user.email}</p>
                        {isAdmin && (
                          <span className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <p className="text-xs text-muted-foreground">Créé {formatDate(user.created_at)}</p>
                        {workspaces.length > 0 && (
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
                            <Layers className="w-3 h-3" />
                            {workspaces.length} espace{workspaces.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isConfirmed ? (
                        <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" /> Confirmé
                        </span>
                      ) : (
                        <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <XCircle className="w-3 h-3" /> En attente
                        </span>
                      )}
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {!isAdmin && (
                    <button
                      onClick={() => setConfirmDel(user)}
                      disabled={isDeleting}
                      className="shrink-0 p-2 rounded-xl text-destructive/50 hover:bg-destructive/10 hover:text-destructive transition-all disabled:opacity-30"
                      title="Supprimer ce compte"
                    >
                      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border">
                    {/* Workspaces */}
                    {workspaces.length > 0 && (
                      <div className="pt-4 mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                          <Layers className="w-3 h-3" /> Espaces de travail
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {workspaces.map((ws) => (
                            <span key={ws.workspace_id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${ROLE_COLORS[ws.role] ?? ROLE_COLORS.viewer}`}>
                              {ws.workspace_name}
                              <span className="opacity-60">•</span>
                              {ws.role}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Details grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {[
                        { label: "UUID",           value: user.id,                           icon: Key,         mono: true  },
                        { label: "Email",          value: user.email,                        icon: Mail,        mono: false },
                        { label: "Email confirmé", value: formatDate(user.email_confirmed_at), icon: CheckCircle, mono: false },
                        { label: "Dernier login",  value: formatDate(user.last_sign_in_at),  icon: Shield,      mono: false },
                        { label: "Rôle",           value: user.role || "authenticated",       icon: Shield,      mono: false },
                        { label: "Créé le",        value: formatDate(user.created_at),       icon: Calendar,    mono: false },
                      ].map(({ label, value, icon: Icon, mono }) => (
                        <div key={label} className="p-3 rounded-xl bg-muted/50 border border-border">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Icon className="w-3 h-3 text-muted-foreground/70" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className={`text-sm text-foreground/80 truncate ${mono ? "font-mono text-xs" : "font-semibold"}`}>
                              {value ?? "—"}
                            </p>
                            {mono && (
                              <button
                                onClick={() => copyId(value)}
                                className="shrink-0 p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-primary transition-all"
                              >
                                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Delete confirmation modal ── */}
      {confirmDel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmDel(null); }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-destructive/20 bg-card shadow-2xl p-6 space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h2 className="text-base font-black text-foreground">Supprimer ce compte ?</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Cette action est <span className="text-destructive font-bold">irréversible</span>. Le compte et toutes ses données seront définitivement supprimés.
                </p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-muted border border-border">
              <p className="text-xs text-muted-foreground font-semibold">Compte à supprimer :</p>
              <p className="text-sm font-black text-foreground mt-1 truncate">{confirmDel.email}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDel(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground border border-border hover:bg-muted transition-all"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(confirmDel)}
                disabled={!!deletingId}
                className="flex-1 py-2.5 rounded-xl text-sm font-black text-destructive-foreground bg-destructive hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingId ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Suppression…</>
                ) : (
                  <><Trash2 className="w-4 h-4" /> Supprimer</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create account modal ── */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-base font-black text-foreground">Créer un compte</h2>
                  <p className="text-xs text-muted-foreground">Compte actif immédiatement</p>
                </div>
              </div>
              <button onClick={() => setShowCreate(false)} className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="utilisateur@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Mot de passe</label>
                  <button
                    type="button"
                    onClick={() => { const p = generatePassword(); setForm((f) => ({ ...f, password: p, confirmPassword: p })); setShowPwd(true); }}
                    className="text-[10px] font-black uppercase tracking-widest text-primary/70 hover:text-primary transition-colors"
                  >
                    Générer auto
                  </button>
                </div>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="Min. 8 caractères"
                    required minLength={8}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-input bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm font-mono"
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Confirmer</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                  <input
                    type={showCnf ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    placeholder="Répétez le mot de passe"
                    required
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 text-sm font-mono transition-all ${
                      form.confirmPassword && form.password !== form.confirmPassword
                        ? "border-destructive/40 bg-destructive/5 focus:ring-destructive/30"
                        : "border-input bg-input-background focus:ring-ring"
                    }`}
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowCnf((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground">
                    {showCnf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-xs text-destructive font-semibold">Les mots de passe ne correspondent pas</p>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground border border-border hover:bg-muted transition-all">
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creating || (!!form.confirmPassword && form.password !== form.confirmPassword)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-black text-primary-foreground bg-primary shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                >
                  {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Création…</> : <><UserPlus className="w-4 h-4" /> Créer le compte</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
