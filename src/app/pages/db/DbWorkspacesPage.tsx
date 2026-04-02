import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { supabaseDbAdmin, dbAdminFetch, type Workspace, type WorkspaceMember, type SupabaseUser } from "../../../lib/supabaseDb";
import { useDbAuth } from "./DbContext";
import {
  Layers, Plus, Search, X, Trash2, Settings, Users, ArrowRight,
  Loader2, AlertTriangle, AlertCircle,
  RefreshCw, Shield, Eye, MessageSquare, Image as ImageIcon, UploadCloud,
  Edit3, Check, CheckCircle, Database, CheckSquare, Square
} from "lucide-react";
import { toast } from "sonner";

// ── Helpers ───────────────────────────────────────────────────
const EMOJIS = ["🏢", "🚀", "💡", "🎯", "🔬", "📊", "🛡️", "🌐", "⚡", "🎨", "🔧", "📱"];
const COLORS  = [
  { label: "Violet",  value: "#7c3aed" },
  { label: "Cyan",    value: "#0891b2" },
  { label: "Émeraude", value: "#059669" },
  { label: "Rose",    value: "#db2777" },
  { label: "Ambre",   value: "#d97706" },
  { label: "Bleu",    value: "#2563eb" },
];

const PERM_LABELS = {
  can_send_messages:  { icon: MessageSquare, label: "Envoyer des messages" },
  can_view_database:  { icon: Database,      label: "Voir la base de données" },
  can_manage_members: { icon: Shield,        label: "Gérer les membres" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Component ─────────────────────────────────────────────────
export function DbWorkspacesPage() {
  const { user: authUser } = useDbAuth();
  const navigate = useNavigate();

  const [workspaces,   setWorkspaces]   = useState<Workspace[]>([]);
  const [members,      setMembers]      = useState<Record<string, WorkspaceMember[]>>({});
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [tableSearch,  setTableSearch]  = useState("");
  const [dbTables,     setDbTables]     = useState<string[]>([]);
  const [showCreate,   setShowCreate]   = useState(false);
  const [confirmDel,   setConfirmDel]   = useState<Workspace | null>(null);
  const [deleting,     setDeleting]     = useState<string | null>(null);
  const [editingWs,    setEditingWs]    = useState<Workspace | null>(null);

  const [createForm, setCreateForm] = useState({ name: "", description: "", color: COLORS[0].value, emoji: EMOJIS[0], image_url: "", company_id: "", features_messaging: true, features_database: true, allowed_tables: [] as string[] });
  const [editForm,   setEditForm]   = useState({ name: "", description: "", color: "", emoji: "", image_url: "", company_id: "", features_messaging: true, features_database: true, allowed_tables: [] as string[] });
  const [saving,     setSaving]     = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: wsData, error: wsErr } = await supabaseDbAdmin
        .from("workspaces")
        .select("*")
        .order("created_at", { ascending: false });
      if (wsErr) throw wsErr;
      setWorkspaces(wsData ?? []);

      const { data: memData } = await supabaseDbAdmin
        .from("workspace_members")
        .select("*");
      const map: Record<string, WorkspaceMember[]> = {};
      for (const m of memData ?? []) {
        if (!map[m.workspace_id]) map[m.workspace_id] = [];
        map[m.workspace_id].push(m as WorkspaceMember);
      }
      setMembers(map);

      try {
        const { data: tablesData, error: tablesErr } = await supabaseDbAdmin.rpc('get_all_tables');
        if (!tablesErr && tablesData) {
          setDbTables((tablesData as any[]).map(t => t.table_name));
        }
      } catch (e) {
        // Silently ignore if RPC doesn't exist yet
      }
    } catch (err) {
      toast.error("Erreur de chargement", { description: err instanceof Error ? err.message : "Erreur" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabaseDbAdmin.from("workspaces").insert({
        name: createForm.name.trim(),
        description: createForm.description.trim() || null,
        color: createForm.color,
        emoji: createForm.emoji,
        image_url: createForm.image_url || null,
        company_id: createForm.company_id.trim() || "1",
        features_messaging: createForm.features_messaging,
        features_database: createForm.features_database,
        allowed_tables: createForm.allowed_tables,
      });
      if (error) throw error;
      toast.success("Espace créé !", { description: createForm.name });
      setCreateForm({ name: "", description: "", color: COLORS[0].value, emoji: EMOJIS[0], image_url: "", company_id: "", features_messaging: true, features_database: true, allowed_tables: [] });
      setShowCreate(false);
      await fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error("Échec", { description: err?.message || "Erreur" });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (ws: Workspace) => {
    setEditingWs(ws);
    setEditForm({ name: ws.name, description: ws.description ?? "", color: ws.color, emoji: ws.emoji, image_url: ws.image_url || "", company_id: ws.company_id || "", features_messaging: ws.features_messaging ?? true, features_database: ws.features_database ?? true, allowed_tables: ws.allowed_tables ?? [] });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWs) return;
    setSaving(true);
    try {
      const { error } = await supabaseDbAdmin
        .from("workspaces")
        .update({ 
          name: editForm.name.trim(), 
          description: editForm.description.trim() || null, 
          color: editForm.color, 
          emoji: editForm.emoji,
          image_url: editForm.image_url || null,
          company_id: editForm.company_id.trim() || "1",
          features_messaging: editForm.features_messaging,
          features_database: editForm.features_database,
          allowed_tables: editForm.allowed_tables
        })
        .eq("id", editingWs.id);
      if (error) throw error;
      toast.success("Workspace modifié !");
      setEditingWs(null);
      await fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error("Échec", { description: err?.message || "Erreur" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ws: Workspace) => {
    setDeleting(ws.id);
    try {
      const { error } = await supabaseDbAdmin.from("workspaces").delete().eq("id", ws.id);
      if (error) throw error;
      toast.success("Espace supprimé", { description: ws.name });
      setConfirmDel(null);
      await fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error("Échec", { description: err?.message || "Erreur" });
    } finally {
      setDeleting(null);
    }
  };

  const filtered = workspaces.filter((ws) =>
    !search.trim() || ws.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderWsFormFields = (form: typeof createForm, setForm: typeof setCreateForm) => (
    <>
      <div className="space-y-1.5">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nom</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Nom de l'espace de travail"
          required
          className="w-full px-3 py-2.5 rounded-xl border border-input bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Description (optionnel)"
          rows={2}
          className="w-full px-3 py-2.5 rounded-xl border border-input bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-sm resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground text-primary">ID Entreprise (company_id)</label>
        <div className="relative">
          <input 
            type="text" 
            value={form.company_id}
            onChange={(e) => setForm(f => ({ ...f, company_id: e.target.value }))}
            placeholder="Ex: 1, 42, client_a..."
            className="w-full px-3 py-2.5 rounded-xl border border-input bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-sm font-mono"
          />
        </div>
        <p className="text-[10px] text-muted-foreground">Filtre les données des tables SQL possédant cette colonne.</p>
      </div>
      
      {/* Feature Toggles */}
      <div className="p-3 rounded-xl border border-border bg-muted/50 space-y-3">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Fonctionnalités activées</label>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <button 
              type="button"
              onClick={() => setForm(f => ({ ...f, features_messaging: !f.features_messaging }))}
              className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${form.features_messaging ? 'bg-primary border-primary' : 'bg-transparent border-border group-hover:border-primary/50'}`}
            >
              {form.features_messaging && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
            </button>
            <span className="text-sm font-semibold text-foreground flex items-center gap-2"><MessageSquare className="w-4 h-4 text-primary" /> Messagerie partagée</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <button 
              type="button"
              onClick={() => setForm(f => ({ ...f, features_database: !f.features_database }))}
              className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${form.features_database ? 'bg-primary border-primary' : 'bg-transparent border-border group-hover:border-primary/50'}`}
            >
              {form.features_database && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
            </button>
            <span className="text-sm font-semibold text-foreground flex items-center gap-2"><Database className="w-4 h-4 text-secondary" /> Explorateur de base de données</span>
          </label>
        </div>
      </div>

      {form.features_database && dbTables.length > 0 && (
        <div className="space-y-3 p-3 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tables sélectionnées ({form.allowed_tables.length})</label>
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => setForm(f => ({ ...f, allowed_tables: dbTables }))}
                className="text-[10px] uppercase font-bold text-primary hover:underline"
              >Tout sélect.</button>
              <button 
                type="button" 
                onClick={() => setForm(f => ({ ...f, allowed_tables: [] }))}
                className="text-[10px] uppercase font-bold text-muted-foreground hover:underline"
              >Tout désélect.</button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input 
              type="text" 
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Chercher une table..."
              className="w-full pl-8 pr-2 py-1.5 text-xs bg-input-background border border-input rounded-lg flex-1 outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
            {dbTables.filter(t => t.toLowerCase().includes(tableSearch.toLowerCase())).map(t => (
              <label key={t} className="flex items-center gap-2 p-1.5 hover:bg-muted/50 rounded-lg cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={form.allowed_tables.includes(t)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setForm(f => ({
                      ...f, 
                      allowed_tables: checked 
                        ? [...f.allowed_tables, t] 
                        : f.allowed_tables.filter(x => x !== t)
                    }));
                  }}
                  className="rounded border-input text-primary focus:ring-primary w-3.5 h-3.5"
                />
                <span className="text-xs font-mono text-foreground">{t}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Icône</label>
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map((e) => (
            <button
              key={e} type="button"
              onClick={() => setForm((f) => ({ ...f, emoji: e }))}
              className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${form.emoji === e ? "bg-primary/20 border-primary/40 border scale-110" : "bg-muted border border-border hover:bg-muted/80"}`}
            >{e}</button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Couleur</label>
        <div className="flex gap-2 flex-wrap mt-2">
          {COLORS.map((c) => (
            <button
              key={c.value} type="button"
              onClick={() => setForm((f) => ({ ...f, color: c.value }))}
              className={`w-7 h-7 rounded-full border-2 transition-all ${form.color === c.value ? "scale-125 border-foreground" : "border-transparent hover:scale-110"}`}
              style={{ backgroundColor: c.value }}
              title={c.label}
            />
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Image de l'espace (Optionnel)</label>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border border-border bg-muted overflow-hidden">
            {form.image_url ? (
               <img src={form.image_url} alt="Workspace" className="w-full h-full object-cover" />
            ) : (
               <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
            )}
          </div>
          <div className="flex-1">
            <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-input bg-input-background text-sm font-semibold text-foreground hover:bg-muted cursor-pointer transition-all">
              <UploadCloud className="w-4 h-4" /> Parcourir...
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 2 * 1024 * 1024) { toast.error("Image trop volumineuse", { description: "Maximum 2Mo autorisé." }); return; }
                  const reader = new FileReader();
                  reader.onload = (ev) => setForm(f => ({ ...f, image_url: ev.target?.result as string }));
                  reader.readAsDataURL(file);
                }} 
              />
            </label>
            {form.image_url && <button type="button" onClick={() => setForm(f => ({...f, image_url: ""}))} className="text-xs text-destructive mt-1.5 hover:underline font-semibold block text-center w-full">Supprimer l'image</button>}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            Espaces de travail
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {workspaces.length} espace{workspaces.length !== 1 ? "s" : ""} configuré{workspaces.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} disabled={loading} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground border border-border hover:bg-muted hover:text-foreground transition-all disabled:opacity-40">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black text-primary-foreground bg-primary shadow-lg hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <Plus className="w-4 h-4" />
            Nouvel espace
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher un espace…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
        />
        {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Chargement…</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <Layers className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-semibold">Aucun espace de travail</p>
          <button onClick={() => setShowCreate(true)} className="mt-4 px-4 py-2 rounded-xl text-sm font-bold text-primary border border-primary/20 hover:bg-primary/10 transition-all">
            Créer le premier
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ws) => {
            const wsMembers  = members[ws.id] ?? [];

            return (
              <div key={ws.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                {/* Workspace row */}
                <div className="flex items-center gap-4 p-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0 text-left">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 border overflow-hidden" style={{ backgroundColor: `${ws.color}25`, borderColor: `${ws.color}40` }}>
                      {ws.image_url ? (
                        <img src={ws.image_url} alt={ws.name} className="w-full h-full object-cover" />
                      ) : (
                        ws.emoji
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-foreground truncate">{ws.name}</p>
                      {ws.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{ws.description}</p>}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Users className="w-3 h-3" />
                          {wsMembers.length} membre{wsMembers.length !== 1 ? "s" : ""}
                        </span>
                        <span className="text-[10px] text-muted-foreground/70">Créé {formatDate(ws.created_at)}</span>
                        <div className="flex items-center gap-1 ml-2">
                          {(ws.features_messaging ?? true) && <MessageSquare className="w-3 h-3 text-primary/70" title="Messagerie activée" />}
                          {(ws.features_database ?? true)  && <Database className="w-3 h-3 text-secondary/70" title="BDD activée" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigate(`/celestial-db/workspace/${ws.id}`)}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
                      style={{ borderColor: `${ws.color}40`, color: ws.color, backgroundColor: `${ws.color}10` }}
                    >
                      Ouvrir <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => openEdit(ws)} className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all" title="Modifier">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setConfirmDel(ws)} className="p-2 rounded-xl text-destructive/50 hover:bg-destructive/10 hover:text-destructive transition-all" title="Supprimer">
                      {deleting === ws.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create modal ── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center"><Plus className="w-4 h-4 text-primary-foreground" /></div>
                <div><h2 className="text-base font-black text-foreground">Nouvel espace de travail</h2><p className="text-xs text-muted-foreground">Créer et gérer les modules</p></div>
              </div>
              <button onClick={() => setShowCreate(false)} className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreate} className="flex flex-col min-h-0 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                {renderWsFormFields(createForm, setCreateForm as typeof setCreateForm)}
              </div>
              <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0 bg-card/50">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground border border-border hover:bg-muted transition-all">Annuler</button>
                <button type="submit" disabled={saving || !createForm.name.trim()} className="flex-1 py-2.5 rounded-xl text-sm font-black text-primary-foreground bg-primary shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Création…</> : <><Check className="w-4 h-4" /> Créer l'espace</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit modal ── */}
      {editingWs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setEditingWs(null); }}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-lg">{editingWs.emoji}</div>
                <div><h2 className="text-base font-black text-foreground">Modifier l'espace</h2><p className="text-xs text-muted-foreground truncate">{editingWs.name}</p></div>
              </div>
              <button onClick={() => setEditingWs(null)} className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleEdit} className="flex flex-col min-h-0 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                {renderWsFormFields(editForm, setEditForm as typeof setCreateForm)}
              </div>
              <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0 bg-card/50">
                <button type="button" onClick={() => setEditingWs(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground border border-border hover:bg-muted transition-all">Annuler</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-black text-primary-foreground bg-primary shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Sauvegarde…</> : <><Check className="w-4 h-4" /> Enregistrer</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete confirm ── */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setConfirmDel(null); }}>
          <div className="w-full max-w-sm rounded-2xl border border-destructive/20 bg-card shadow-2xl p-6 space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h2 className="text-base font-black text-foreground">Supprimer cet espace ?</h2>
                <p className="text-sm text-muted-foreground mt-1">Tous les messages et membres associés seront <span className="text-destructive font-bold">définitivement supprimés</span>.</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-muted border border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border overflow-hidden bg-card" style={{ backgroundColor: `${confirmDel.color}25`, borderColor: `${confirmDel.color}40` }}>
                  {confirmDel.image_url ? (
                    <img src={confirmDel.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">{confirmDel.emoji}</span>
                  )}
              </div>
              <p className="text-sm font-black text-foreground">{confirmDel.name}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDel(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground border border-border hover:bg-muted transition-all">Annuler</button>
              <button
                onClick={() => handleDelete(confirmDel)}
                disabled={!!deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-black text-destructive-foreground bg-destructive hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Suppression…</> : <><Trash2 className="w-4 h-4" /> Supprimer</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
