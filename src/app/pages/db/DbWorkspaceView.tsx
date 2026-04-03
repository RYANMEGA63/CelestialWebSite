import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router";
import {
  supabaseDb, supabaseDbAdmin, dbAdminFetch,
  type Workspace, type WorkspaceMember, type Message, type WorkspaceRole, type SupabaseUser
} from "../../../lib/supabaseDb";
import { useDbAuth } from "./DbContext";
import {
  MessageSquare, Users, Database, Send, ArrowLeft,
  Loader2, AlertCircle, Shield, Eye, UserPlus, Trash2,
  Clock, Table2, RefreshCw, LogOut, Sun, Moon, Plus, X, Check, CheckSquare, Square, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { DbTableViewer } from "./components/DbTableViewer";

// ── Helpers ────────────────────────────────────────────────────
function getInitials(email: string) { return email.split("@")[0].slice(0, 2).toUpperCase(); }
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}
function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString())     return "Aujourd'hui";
  if (d.toDateString() === yesterday.toDateString()) return "Hier";
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

const AVATAR_COLORS = ["#7c3aed","#0891b2","#059669","#db2777","#d97706","#2563eb","#dc2626","#0284c7","#15803d","#ea580c"];
function emailColor(email: string) {
  let h = 0; for (const c of email) h = c.charCodeAt(0) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

type Tab = "home" | "messages" | "database" | "equipe";



// ── Main Component ─────────────────────────────────────────────
export function DbWorkspaceView() {
  const { id: wsId }        = useParams<{ id: string }>();
  const { user: authUser, logout } = useDbAuth();
  const navigate             = useNavigate();
  const outletCtx            = useOutletContext<{ isDark: boolean; setIsDark: (v: boolean) => void } | null>();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [member,    setMember]    = useState<WorkspaceMember | null>(null);
  const [members,   setMembers]   = useState<WorkspaceMember[]>([]);
  const [roles,     setRoles]     = useState<WorkspaceRole[]>([]);
  const [messages,  setMessages]  = useState<Message[]>([]);
  const [allUsers,  setAllUsers]  = useState<SupabaseUser[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [tab,       setTab]       = useState<Tab>("home");
  const [input,     setInput]     = useState("");
  const [sending,   setSending]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Modals for roles
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", can_send_messages: false, can_view_database: false, can_manage_members: false });
  
  // Modals for members
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [addMemberEmail, setAddMemberEmail] = useState("");
  const [addMemberRole, setAddMemberRole] = useState("");
  const [addingMember, setAddingMember] = useState(false);

  // ── Load ────────────────────────────────────────────────────
  const loadWorkspace = useCallback(async () => {
    if (!wsId || !authUser) return;
    try {
      const { data: ws, error: wsErr } = await supabaseDbAdmin.from("workspaces").select("*").eq("id", wsId).single();
      if (wsErr || !ws) { setError("Espace introuvable."); setLoading(false); return; }
      setWorkspace(ws as Workspace);

      let currentMem: WorkspaceMember | null = null;
      if (!authUser.isAdmin) {
        const { data: mem } = await supabaseDbAdmin.from("workspace_members").select("*").eq("workspace_id", wsId).eq("user_id", authUser.id).single();
        if (!mem) { setError("Vous n'êtes pas membre de cet espace."); setLoading(false); return; }
        currentMem = mem as WorkspaceMember;
        setMember(currentMem);
      }

      const [{ data: mems }, { data: msgs }, { data: rls }] = await Promise.all([
        supabaseDbAdmin.from("workspace_members").select("*").eq("workspace_id", wsId),
        supabaseDbAdmin.from("messages").select("*").eq("workspace_id", wsId).order("created_at", { ascending: true }).limit(200),
        supabaseDbAdmin.from("workspace_roles").select("*").eq("workspace_id", wsId),
      ]);
      setMembers((mems as WorkspaceMember[]) ?? []);
      setMessages((msgs as Message[]) ?? []);
      setRoles((rls as WorkspaceRole[]) ?? []);

      // If user is Owner/Admin, we fetch everything needed to add members
      if (isAdmin || (currentMem && currentMem.role === "owner" && currentMem.can_manage_members)) {
        try {
          const res = await dbAdminFetch("/admin/users?per_page=1000");
          if (res.ok) {
            const data = await res.json();
            setAllUsers(data.users ?? data ?? []);
          }
        } catch { /* silent */ }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally { setLoading(false); }
  }, [wsId, authUser]);

  useEffect(() => { loadWorkspace(); }, [loadWorkspace]);

  // ── Realtime ────────────────────────────────────────────────
  useEffect(() => {
    if (!wsId) return;
    const channel = supabaseDb.channel(`ws-msgs-${wsId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `workspace_id=eq.${wsId}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Message]))
      .subscribe();
    return () => { supabaseDb.removeChannel(channel); };
  }, [wsId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, tab]);

  // ── Permissions ─────────────────────────────────────────────
  const isAdmin = authUser?.isAdmin;
  const isOwner = isAdmin || (member?.role === "owner" && member?.can_manage_members);
  
  const wsFeaturesMessaging = workspace?.features_messaging !== false; // Fix: default to true for old workspaces
  const wsFeaturesDatabase  = workspace?.features_database !== false;

  const canSend = isAdmin || (wsFeaturesMessaging && (member?.can_send_messages ?? false));
  const canViewDb = isAdmin || (wsFeaturesDatabase && (member?.can_view_database ?? false));
  const canManage = isAdmin || (member?.can_manage_members ?? false);

  // ── Send message ────────────────────────────────────────────
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !wsId || !authUser || sending || !canSend) return;
    setSending(true);
    try {
      const { error: err } = await supabaseDbAdmin.from("messages").insert({
        workspace_id: wsId, sender_id: authUser.id, sender_email: authUser.email, content: input.trim(),
      });
      if (err) throw err;
      setInput("");
    } catch (err) {
      toast.error("Échec de l'envoi", { description: err instanceof Error ? err.message : "Erreur" });
    } finally { setSending(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Roles Management ─────────────────────────────────────────
  const createRole = async () => {
    if (!newRole.name.trim() || !wsId) return;
    try {
      const { data, error } = await supabaseDbAdmin.from("workspace_roles").insert({
        workspace_id: wsId,
        name: newRole.name.trim(),
        can_send_messages: newRole.can_send_messages,
        can_view_database: newRole.can_view_database,
        can_manage_members: newRole.can_manage_members
      }).select().single();
      if (error) throw error;
      setRoles(prev => [...prev, data as WorkspaceRole]);
      setShowRoleModal(false);
      setNewRole({ name: "", can_send_messages: false, can_view_database: false, can_manage_members: false });
      toast.success(`Rôle "${data.name}" créé.`);
    } catch (e) {
      toast.error("Erreur", { description: e instanceof Error ? e.message : "Impossible de créer le rôle." });
    }
  };

  const deleteRole = async (id: string, name: string) => {
    if (!confirm(`Supprimer le rôle "${name}" ?`)) return;
    try {
      const { error } = await supabaseDbAdmin.from("workspace_roles").delete().eq("id", id);
      if (error) throw error;
      setRoles(prev => prev.filter(r => r.id !== id));
      toast.success("Rôle supprimé");
    } catch (e) {
      toast.error("Erreur", { description: "Impossible de supprimer ce rôle." });
    }
  };

  const assignRoleToMember = async (memberId: string, roleName: string) => {
    if (!isOwner && !isAdmin) return; // Prevent any unauthorized call
    const isSelf = memberId === member?.id;
    if (isSelf && !isAdmin) {
      toast.error("Action non autorisée", { description: "Vous ne pouvez pas modifier votre propre rôle." });
      return;
    }
    
    let updates = { role: roleName, can_send_messages: false, can_view_database: false, can_manage_members: false };
    
    if (roleName === "owner") updates = { role: "owner", can_send_messages: true, can_view_database: true, can_manage_members: true };
    else if (roleName === "member") updates = { role: "member", can_send_messages: false, can_view_database: true, can_manage_members: false };
    else {
      const customRole = roles.find(r => r.name === roleName);
      if (customRole) {
        updates = {
          role: customRole.name,
          can_send_messages: customRole.can_send_messages,
          can_view_database: customRole.can_view_database,
          can_manage_members: customRole.can_manage_members
        };
      } else {
        updates.role = roleName; // manual custom text fallback without permissions
      }
    }

    try {
      const { error } = await supabaseDbAdmin.from("workspace_members").update(updates).eq("id", memberId);
      if (error) throw error;
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, ...updates } : m));
      toast.success("Rôle mis à jour", { description: "Les permissions ont été appliquées."});
    } catch (e) {
      console.error(e);
      toast.error("Erreur", { description: e instanceof Error || (e as any).message ? (e as any).message : "Échec de la mise à jour." });
    }
  };

  const handleAddMember = async () => {
    if (!wsId || !addMemberEmail.trim()) return;
    const targetUser = allUsers.find((u) => u.email === addMemberEmail.trim());
    if (!targetUser) {
      toast.error("Utilisateur introuvable", { description: "Cet email n'existe pas." });
      return;
    }
    setAddingMember(true);
    let updates = { role: addMemberRole, can_send_messages: false, can_view_database: false, can_manage_members: false };
    if (addMemberRole === "owner") updates = { role: "owner", can_send_messages: true, can_view_database: true, can_manage_members: true };
    else if (addMemberRole === "editor") updates = { role: "editor", can_send_messages: true, can_view_database: true, can_manage_members: false };
    else if (addMemberRole === "viewer") updates = { role: "viewer", can_send_messages: false, can_view_database: true, can_manage_members: false };
    else {
      const customRole = roles.find(r => r.name === addMemberRole);
      if (customRole) {
        updates = {
          role: customRole.name,
          can_send_messages: customRole.can_send_messages,
          can_view_database: customRole.can_view_database,
          can_manage_members: customRole.can_manage_members
        };
      }
    }

    try {
      const { data, error } = await supabaseDbAdmin.from("workspace_members").upsert({
        workspace_id: wsId,
        user_id: targetUser.id,
        user_email: targetUser.email,
        ...updates,
      }, { onConflict: "workspace_id,user_id" }).select().single();
      if (error) throw error;
      setMembers(prev => {
        const idx = prev.findIndex(m => m.user_id === targetUser.id);
        if (idx >= 0) { const a = [...prev]; a[idx] = data as WorkspaceMember; return a; }
        return [...prev, data as WorkspaceMember];
      });
      toast.success("Membre ajouté !", { description: targetUser.email });
      setShowAddMember(false);
      setAddMemberEmail("");
      setAddMemberRole("");
    } catch (err) {
      toast.error("Échec", { description: err instanceof Error ? err.message : "Erreur" });
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string, email: string) => {
    const isSelf = memberId === member?.id;
    if (isSelf && !isAdmin) {
      toast.error("Non autorisé", { description: "Vous ne pouvez pas retirer votre propre accès." });
      return;
    }
    if (!confirm(`Retirer ${email} du workspace ?`)) return;
    try {
      const { error } = await supabaseDbAdmin.from("workspace_members").delete().eq("id", memberId);
      if (error) throw error;
      setMembers(prev => prev.filter(m => m.id !== memberId));
      toast.success("Membre retiré", { description: email });
    } catch {
      toast.error("Échec du retrait");
    }
  };

  // ── Group messages by date ──────────────────────────────────
  const groupedMessages: { date: string; msgs: Message[] }[] = [];
  for (const msg of messages) {
    const d = formatDate(msg.created_at);
    if (!groupedMessages.length || groupedMessages[groupedMessages.length - 1].date !== d) {
      groupedMessages.push({ date: d, msgs: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].msgs.push(msg);
    }
  }

  // ── States ──────────────────────────────────────────────────
  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Chargement de l'espace…</p>
      </div>
    </div>
  );

  if (error || !workspace) return (
    <div className="h-full flex items-center justify-center p-6 bg-background">
      <div className="p-6 rounded-2xl border border-destructive/20 bg-destructive/5 max-w-md text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
        <p className="text-base font-black text-foreground">{error ?? "Espace introuvable"}</p>
        {authUser?.isAdmin && (
          <button onClick={() => navigate("/celestial-db/workspaces")}
            className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl text-sm font-bold text-muted-foreground border border-border hover:bg-muted transition-all">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
        )}
      </div>
    </div>
  );

  const FEATURE_CARDS: {
    id: "messages" | "database" | "equipe";
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
    hidden: boolean;
  }[] = [
    {
      id: "messages",
      label: "Messages",
      description: "Communiquez avec les membres de l'espace en temps réel.",
      icon: MessageSquare,
      color: "#7c3aed",
      hidden: !(isAdmin || wsFeaturesMessaging),
    },
    {
      id: "database",
      label: "Base de données",
      description: "Consultez et gérez les tables de données de votre espace.",
      icon: Database,
      color: "#0891b2",
      hidden: !canViewDb,
    },
    {
      id: "equipe",
      label: "Équipe & Rôles",
      description: "Gérez les membres, les accès et les rôles personnalisés.",
      icon: Shield,
      color: "#059669",
      hidden: !isOwner,
    },
  ];

  const visibleCards = FEATURE_CARDS.filter((c) => !c.hidden);

  const TABS: { id: "messages" | "database" | "equipe"; label: string; icon: React.ElementType; hidden?: boolean }[] = [
    { id: "messages",  label: "Messages",       icon: MessageSquare, hidden: !(isAdmin || wsFeaturesMessaging) },
    { id: "database",  label: "Base de données", icon: Database, hidden: !(isAdmin || wsFeaturesDatabase) },
    { id: "equipe",    label: "Équipe & Rôles",  icon: Shield, hidden: !isOwner }
  ];

  const roleDisplay = authUser?.isAdmin ? "Admin" : (member?.role ?? "");
  const isDark = outletCtx?.isDark ?? false;
  const setIsDark = outletCtx?.setIsDark ?? (() => {});

  // ── HOME landing page ─────────────────────────────────────────
  if (tab === "home") {
    return (
      <div className="h-full flex flex-col overflow-hidden bg-background">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/30 shrink-0">
          {authUser?.isAdmin && (
            <button onClick={() => navigate("/celestial-db/workspaces")}
              className="p-1.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 border overflow-hidden"
              style={{ backgroundColor: `${workspace.color}25`, borderColor: `${workspace.color}40` }}
            >
              {workspace.image_url
                ? <img src={workspace.image_url} alt="" className="w-full h-full object-cover" />
                : workspace.emoji}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-foreground truncate leading-tight">{workspace.name}</p>
              {workspace.description && (
                <p className="text-[10px] text-muted-foreground truncate">{workspace.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!authUser?.isAdmin && outletCtx && (
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-all border border-border"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 border border-border">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-muted-foreground font-semibold truncate max-w-[140px]">
                {authUser?.isAdmin ? authUser.email : authUser?.email?.split("@")[0]}
              </span>
            </div>
            {authUser?.isAdmin ? (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                <Shield className="w-3 h-3" /> Admin
              </span>
            ) : member && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-muted text-muted-foreground border border-border">
                {roleDisplay}
              </span>
            )}
            <button onClick={() => setShowMembersModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all border border-border"
              title="Voir les membres"
            >
              <Users className="w-4 h-4" /> <span>Membres</span>
            </button>
            {!authUser?.isAdmin && (
              <button onClick={logout}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-all border border-destructive/20">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </header>

        {/* Hub */}
        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-6 py-12">
          {/* Workspace hero identity */}
          <div className="text-center mb-10">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 border-2 overflow-hidden shadow-lg"
              style={{ backgroundColor: `${workspace.color}20`, borderColor: `${workspace.color}50`, boxShadow: `0 8px 32px ${workspace.color}20` }}
            >
              {workspace.image_url
                ? <img src={workspace.image_url} alt="" className="w-full h-full object-cover" />
                : workspace.emoji}
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">{workspace.name}</h1>
            {workspace.description && (
              <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">{workspace.description}</p>
            )}
            <button 
              onClick={() => setShowMembersModal(true)}
              className="flex items-center justify-center gap-2 mx-auto mt-3 px-3 py-1.5 rounded-full hover:bg-muted/50 border border-transparent hover:border-border transition-all cursor-pointer group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                {members.length} membre{members.length !== 1 ? "s" : ""}
              </span>
              <span className="text-muted-foreground/30">·</span>
              <span className="text-[11px] font-semibold text-muted-foreground capitalize">
                {roleDisplay}
              </span>
            </button>
          </div>

          {/* Feature cards */}
          {visibleCards.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-muted-foreground opacity-30" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">Vous n'avez aucune permission</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Contactez l'administrateur pour obtenir des accès.</p>
            </div>
          ) : (
            <div className={`grid gap-4 w-full max-w-2xl ${
              visibleCards.length === 1 ? "grid-cols-1 max-w-xs" :
              visibleCards.length === 2 ? "grid-cols-1 sm:grid-cols-2 max-w-lg" :
              "grid-cols-1 sm:grid-cols-3"
            }`}>
              {visibleCards.map((card) => {
                const Icon = card.icon;
                return (
                  <button
                    key={card.id}
                    onClick={() => setTab(card.id)}
                    className="group relative flex flex-col items-center text-center p-8 rounded-2xl border border-border bg-card hover:bg-card transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] overflow-hidden"
                    style={{ ["--card-color" as any]: card.color }}
                  >
                    {/* Background glow on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                      style={{ background: `radial-gradient(circle at 50% 0%, ${card.color}15, transparent 70%)` }}
                    />
                    {/* Top accent line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: `linear-gradient(90deg, transparent, ${card.color}, transparent)` }}
                    />

                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border transition-transform group-hover:scale-110 group-hover:shadow-lg duration-200 relative z-10"
                      style={{
                        backgroundColor: `${card.color}15`,
                        borderColor: `${card.color}30`,
                        boxShadow: `0 0 0 0px ${card.color}30`,
                      }}
                    >
                      <Icon className="w-6 h-6" style={{ color: card.color }} />
                    </div>
                    <p className="text-base font-black text-foreground mb-1.5 relative z-10">{card.label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed relative z-10">{card.description}</p>

                    <div
                      className="mt-5 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all -translate-y-1 group-hover:translate-y-0 relative z-10"
                      style={{ color: card.color }}
                    >
                      Ouvrir <ChevronRight className="w-3 h-3" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Members List Modal (for home tab) */}
        {showMembersModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
              <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-muted/20 shrink-0">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Membres de l'espace</h3>
                <button onClick={() => setShowMembersModal(false)} className="text-muted-foreground hover:bg-muted p-1 rounded-md transition-colors"><X className="w-4 h-4"/></button>
              </div>
              <div className="p-2 overflow-y-auto flex-1">
                {members.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Aucun membre.</p>
                ) : (
                  <div className="space-y-1">
                    {members.map(m => {
                      const labelEmail = m.user_email || `Utilisateur (...${m.user_id.slice(-4)})`;
                      const initials = m.user_email ? m.user_email.substring(0, 2).toUpperCase() : "U";
                      return (
                        <div key={m.id} className="flex items-center justify-between p-2 rounded-xl border border-transparent hover:bg-muted/50 hover:border-border transition-colors">
                          <div className="flex-1 min-w-0 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground truncate">{labelEmail}</p>
                            </div>
                          </div>
                          <div className="shrink-0 ml-3">
                            <span className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-muted text-muted-foreground border border-border">
                              {m.role}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Compact header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/30 shrink-0">
        <button onClick={() => setTab("home")}
          className="p-1.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 border overflow-hidden"
            style={{ backgroundColor: `${workspace.color}25`, borderColor: `${workspace.color}40` }}>
            {workspace.image_url ? (
              <img src={workspace.image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              workspace.emoji
            )}
          </div>
          <p className="text-sm font-black text-foreground truncate leading-tight">{workspace.name}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme Toggle if non-admin (since admin has it in layout header) */}
            {!authUser?.isAdmin && outletCtx && (
               <button 
                onClick={() => setIsDark(!isDark)}
                className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-all border border-border"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
              </button>
            )}

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 border border-border">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-muted-foreground font-semibold truncate max-w-[140px]">
                {authUser?.isAdmin ? authUser.email : authUser?.email?.split("@")[0]}
              </span>
            </div>
            {authUser?.isAdmin ? (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                <Shield className="w-3 h-3" /> Admin
              </span>
            ) : member && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-muted text-muted-foreground border border-border">
                {roleDisplay}
              </span>
            )}
            <button onClick={() => setShowMembersModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all border border-border"
              title="Voir les membres"
            >
              <Users className="w-4 h-4" /> <span>Membres</span>
            </button>
          </div>
        </header>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden">
          {/* MESSAGES */}
          {tab === "messages" && (wsFeaturesMessaging || isAdmin) && (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 py-20">
                    <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground font-semibold">Aucun message pour l'instant</p>
                    {canSend && <p className="text-xs text-muted-foreground/60">Soyez le premier à écrire !</p>}
                  </div>
                ) : groupedMessages.map(({ date, msgs: dayMsgs }) => (
                  <div key={date} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{date}</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    {dayMsgs.map((msg, i) => {
                      const isOwn  = msg.sender_id === authUser?.id;
                      const isSame = i > 0 && dayMsgs[i - 1].sender_id === msg.sender_id;
                      const color  = emailColor(msg.sender_email);
                      return (
                        <div key={msg.id} className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
                          <div className="shrink-0 w-8">
                            {!isSame && (
                              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white"
                                style={{ backgroundColor: `${color}40`, border: `1px solid ${color}60` }}>
                                {getInitials(msg.sender_email)}
                              </div>
                            )}
                          </div>
                          <div className={`flex flex-col gap-1 max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
                            {!isSame && (
                              <div className={`flex items-center gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
                                <span className="text-[11px] font-black text-foreground/70">{msg.sender_email.split("@")[0]}</span>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                  <Clock className="w-2.5 h-2.5" />{formatTime(msg.created_at)}
                                </span>
                              </div>
                            )}
                            <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              isOwn
                                ? "bg-primary text-primary-foreground rounded-tr-sm"
                                : "bg-muted text-foreground border border-border rounded-tl-sm"
                            }`}>
                              {msg.content}
                            </div>
                            {isSame && (
                              <span className={`text-[9px] text-muted-foreground/60 ${isOwn ? "mr-1" : "ml-1"}`}>{formatTime(msg.created_at)}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="shrink-0 px-4 py-3 border-t border-border bg-card/30">
                {!canSend ? (
                  <div className="flex items-center gap-2 justify-center py-2 text-xs text-muted-foreground font-semibold">
                    <Eye className="w-4 h-4" /> Vous êtes en mode lecture seule
                  </div>
                ) : (
                  <form onSubmit={handleSend} className="flex gap-3 items-end">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Écrire un message… (Entrée pour envoyer)"
                      rows={1}
                      className="flex-1 px-4 py-3 rounded-2xl border border-input bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none max-h-32 overflow-y-auto leading-relaxed"
                      style={{ minHeight: "46px" }}
                      onInput={(e) => {
                        const t = e.currentTarget; t.style.height = "auto";
                        t.style.height = `${Math.min(t.scrollHeight, 128)}px`;
                      }}
                    />
                    <button type="submit" disabled={!input.trim() || sending}
                      className="shrink-0 w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100">
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* DATABASE */}
          {tab === "database" && wsId && canViewDb && (wsFeaturesDatabase || isAdmin) && (
            <DbTableViewer allowedTables={workspace.allowed_tables || []} companyId={workspace.company_id} />
          )}

          {/* ÉQUIPE (ROLES & MEMBERS) */}
          {tab === "equipe" && isOwner && (
            <div className="h-full overflow-y-auto p-4 space-y-8 bg-card/30">
              
              {/* SECTION: MEMBERS */}
              <section className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div>
                    <h2 className="text-sm font-black text-foreground flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" /> 
                      Membres ({members.length})
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Gérez les accès utilisateurs de votre espace.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setShowAddMember(true);
                      setAddMemberRole(authUser?.isAdmin ? "member" : (roles[0]?.name || ""));
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-primary border border-primary/20 hover:bg-primary/10 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Ajouter
                  </button>
                </div>

                <div className="grid gap-2">
                  {authUser?.isAdmin && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-foreground truncate">{authUser.email}</p>
                        <p className="text-xs text-primary">Administrateur — accès total</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">En ligne</span>
                      </div>
                    </div>
                  )}

                  {members.map((m) => {
                    const standardRoles = ["owner", "member"];
                    const availableRoles = [...standardRoles, ...roles.map(r => r.name)];
                    const currentRoleValue = availableRoles.includes(m.role) ? m.role : "member";
                    const isSelf = m.user_id === authUser?.id;

                    return (
                      <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white shrink-0"
                            style={{ backgroundColor: `${emailColor(m.user_email)}40`, border: `1px solid ${emailColor(m.user_email)}60` }}>
                            {getInitials(m.user_email)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{m.user_email}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {(m.can_send_messages && wsFeaturesMessaging)  && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><MessageSquare className="w-2.5 h-2.5" /> msgs</span>}
                              {(m.can_view_database && wsFeaturesDatabase)  && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Database className="w-2.5 h-2.5" /> db</span>}
                              {m.can_manage_members && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Shield className="w-2.5 h-2.5" /> gestion</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-12 sm:ml-0">
                          {(!isSelf || authUser?.isAdmin) ? (
                             <select 
                              value={currentRoleValue}
                              onChange={(e) => assignRoleToMember(m.id, e.target.value)}
                              className="text-xs font-semibold px-2 py-1 rounded-lg bg-input-background border border-input text-foreground outline-none focus:ring-1 focus:ring-primary"
                            >
                              {authUser?.isAdmin && (
                                <optgroup label="Standard">
                                  <option value="owner">Propriétaire (Owner)</option>
                                  <option value="member">Membre (Member)</option>
                                </optgroup>
                              )}
                              {roles.length > 0 && (
                                <optgroup label="Personnalisé (Custom)">
                                  {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                                </optgroup>
                              )}
                            </select>
                          ) : (
                            <span className="text-xs font-bold px-2 py-1 rounded-lg bg-muted border border-border text-foreground">
                              {m.role}
                            </span>
                          )}

                          {(!isSelf || authUser?.isAdmin) && (
                            <button onClick={() => handleRemoveMember(m.id, m.user_email)} className="p-1.5 rounded-lg text-destructive/50 hover:bg-destructive/10 hover:text-destructive transition-all" title="Retirer du workspace">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* SECTION: ROLES */}
              <section className="space-y-4 pt-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div>
                     <h2 className="text-sm font-black text-foreground flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" /> 
                      Rôles Personnalisés
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Créez des rôles sur mesure avec des permissions spécifiques.</p>
                  </div>
                  <button 
                    onClick={() => setShowRoleModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 text-xs font-bold rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Créer
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {roles.length === 0 ? (
                    <div className="sm:col-span-2 py-8 text-center border border-dashed border-border rounded-xl bg-card/50">
                      <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-30" />
                      <p className="text-sm text-muted-foreground font-semibold">Aucun rôle personnalisé</p>
                    </div>
                  ) : roles.map(r => (
                    <div key={r.id} className="p-4 rounded-xl border border-border bg-card relative group flex flex-col hover:border-primary/30 transition-colors">
                      <button onClick={() => deleteRole(r.id, r.name)} className="absolute top-2 right-2 p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive md:opacity-0 group-hover:opacity-100 transition-all">
                        <X className="w-4 h-4" />
                      </button>
                      <h4 className="font-black text-sm text-foreground truncate pl-1">{r.name}</h4>
                      <div className="mt-3 space-y-2 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/50">
                        {wsFeaturesMessaging && (
                          <div className="flex items-center gap-2 font-medium"><span className={r.can_send_messages ? "text-primary" : ""}>{r.can_send_messages ? <CheckSquare className="w-3.5 h-3.5"/> : <Square className="w-3.5 h-3.5 opacity-50"/>}</span> Envoyer des messages</div>
                        )}
                        {wsFeaturesDatabase && (
                          <div className="flex items-center gap-2 font-medium"><span className={r.can_view_database ? "text-primary" : ""}>{r.can_view_database ? <CheckSquare className="w-3.5 h-3.5"/> : <Square className="w-3.5 h-3.5 opacity-50"/>}</span> Voir la base de données</div>
                        )}
                        <div className="flex items-center gap-2 font-medium"><span className={r.can_manage_members ? "text-primary" : ""}>{r.can_manage_members ? <CheckSquare className="w-3.5 h-3.5"/> : <Square className="w-3.5 h-3.5 opacity-50"/>}</span> Gérer l'espace (Admin)</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>

      {/* Members List Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-muted/20 shrink-0">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Membres de l'espace</h3>
              <button onClick={() => setShowMembersModal(false)} className="text-muted-foreground hover:bg-muted p-1 rounded-md transition-colors"><X className="w-4 h-4"/></button>
            </div>
            <div className="p-2 overflow-y-auto flex-1">
              {members.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Aucun membre.</p>
              ) : (
                <div className="space-y-1">
                  {members.map(m => {
                    const labelEmail = m.user_email || `Utilisateur (...${m.user_id.slice(-4)})`;
                    const initials = m.user_email ? m.user_email.substring(0, 2).toUpperCase() : "U";
                    return (
                      <div key={m.id} className="flex items-center justify-between p-2 rounded-xl border border-transparent hover:bg-muted/50 hover:border-border transition-colors">
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">{labelEmail}</p>
                          </div>
                        </div>
                        <div className="shrink-0 ml-3">
                          <span className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-muted text-muted-foreground border border-border">
                            {m.role}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Role Creation Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-muted/20">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Nouveau Rôle</h3>
              <button onClick={() => setShowRoleModal(false)} className="text-muted-foreground hover:bg-muted p-1 rounded-md transition-colors"><X className="w-4 h-4"/></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">Nom du rôle</label>
                <input 
                  type="text" 
                  value={newRole.name} 
                  onChange={e => setNewRole({...newRole, name: e.target.value})}
                  className="w-full px-3 py-2 bg-input-background border border-input rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Assistant, Modérateur..."
                />
              </div>
              <div className="space-y-2.5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">Permissions accordées</label>
                {[
                  ...(wsFeaturesMessaging ? [{ id: 'can_send_messages', label: 'Envoyer des messages' }] : []),
                  ...(wsFeaturesDatabase ? [{ id: 'can_view_database', label: 'Voir la base de données' }] : []),
                  { id: 'can_manage_members', label: 'Gérer l\'espace' }
                ].map((perm) => (
                  <label key={perm.id} className="flex items-center gap-3 cursor-pointer group p-2 rounded-xl hover:bg-muted/30 transition-colors border border-transparent hover:border-border">
                    <button 
                      type="button"
                      onClick={() => setNewRole({...newRole, [perm.id]: !newRole[perm.id as keyof typeof newRole]})}
                      className={`w-5 h-5 rounded-[6px] flex items-center justify-center border transition-all ${newRole[perm.id as keyof typeof newRole] ? 'bg-primary border-primary scale-110' : 'bg-input-background border-input group-hover:border-primary/50'}`}
                    >
                      {newRole[perm.id as keyof typeof newRole] && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                    </button>
                    <span className="text-sm font-semibold text-foreground/90">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-border bg-muted/20 flex gap-2 justify-end">
              <button onClick={() => setShowRoleModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted/50 border border-transparent hover:border-border transition-all">Annuler</button>
              <button onClick={createRole} disabled={!newRole.name.trim()} className="px-4 py-2 rounded-xl text-xs font-black bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5">Créer</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-muted/20">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2"><UserPlus className="w-4 h-4 text-primary" /> Ajouter un membre</h3>
              <button onClick={() => setShowAddMember(false)} className="text-muted-foreground hover:bg-muted p-1 rounded-md transition-colors"><X className="w-4 h-4"/></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">Email de l'utilisateur</label>
                <input 
                  type="email" 
                  list="users-list"
                  value={addMemberEmail} 
                  onChange={e => setAddMemberEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-input-background border border-input rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
                  placeholder="nom@exemple.com"
                />
                <datalist id="users-list">
                  {allUsers.map((u) => <option key={u.id} value={u.email} />)}
                </datalist>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">Rôle initial</label>
                <select 
                  value={addMemberRole}
                  onChange={(e) => setAddMemberRole(e.target.value)}
                  className="w-full text-sm rounded-xl px-3 py-2.5 bg-input-background border border-input text-foreground outline-none focus:ring-2 focus:ring-primary"
                >
                  {authUser?.isAdmin && (
                    <optgroup label="Standard">
                      <option value="owner">Propriétaire (Owner)</option>
                      <option value="member">Membre (Member)</option>
                    </optgroup>
                  )}
                  {roles.length > 0 && (
                    <optgroup label="Personnalisé (Custom)">
                      {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                    </optgroup>
                  )}
                  {(!authUser?.isAdmin && roles.length === 0) && (
                    <option value="" disabled>Aucun rôle personnalisé disponible</option>
                  )}
                </select>
                <p className="text-[10px] text-muted-foreground leading-tight px-1 pt-1.5">
                  Les permissions seront automatiquement appliquées en fonction du rôle séléctionné.
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-border bg-muted/20 flex gap-2 justify-end">
              <button onClick={() => setShowAddMember(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted/50 border border-transparent hover:border-border transition-all">Annuler</button>
              <button onClick={handleAddMember} disabled={!addMemberEmail.trim() || !addMemberRole || addingMember} className="px-4 py-2 rounded-xl text-xs font-black bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5">
                {addingMember ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Inviter"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
