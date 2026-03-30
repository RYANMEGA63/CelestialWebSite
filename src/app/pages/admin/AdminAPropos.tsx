import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Card, CardContent, CardHeader } from "../../components/Card";
import { Button } from "../../components/Button";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  Clock,
  Rocket,
  Globe2,
  Cpu,
  Award,
  Sparkles,
  Target,
  ShieldCheck,
  Zap,
  Layers
} from "lucide-react";
import { toast } from "sonner";

const IconMapping: Record<string, any> = {
  Rocket,
  Globe2,
  Cpu,
  Award,
  Sparkles,
  Target,
  ShieldCheck,
  Users,
  Zap,
  Layers,
};

type Tab = "team" | "milestones";

export function AdminAPropos() {
  const [activeTab, setActiveTab] = useState<Tab>("team");

  // Team state
  const [team, setTeam] = useState<any[]>([]);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [memberName, setMemberName] = useState("");
  const [memberRole, setMemberRole] = useState("");
  const [memberDesc, setMemberDesc] = useState("");

  // Milestones state
  const [milestones, setMilestones] = useState<any[]>([]);
  const [editingMilestone, setEditingMilestone] = useState<any | null>(null);
  const [milestoneYear, setMilestoneYear] = useState("");
  const [milestoneEvent, setMilestoneEvent] = useState("");
  const [milestoneDesc, setMilestoneDesc] = useState("");
  const [milestoneIcon, setMilestoneIcon] = useState("Rocket");

  const iconOptions = ["Rocket", "Globe2", "Cpu", "Award", "Sparkles", "Target", "ShieldCheck", "Users", "Zap", "Layers"];

  useEffect(() => {
    fetchTeam();
    fetchMilestones();
  }, []);

  async function fetchTeam() {
    const { data } = await supabase.from("team_members").select("*").order("order_index");
    setTeam(data || []);
  }

  async function fetchMilestones() {
    const { data } = await supabase.from("company_milestones").select("*").order("order_index");
    setMilestones(data || []);
  }

  // --- Team CRUD ---
  const resetMemberForm = () => {
    setEditingMember(null);
    setMemberName("");
    setMemberRole("");
    setMemberDesc("");
  };

  const handleEditMember = (m: any) => {
    setEditingMember(m);
    setMemberName(m.name);
    setMemberRole(m.role);
    setMemberDesc(m.description || "");
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: memberName, role: memberRole, description: memberDesc };
    if (editingMember && !editingMember.isNew) {
      const { error } = await supabase.from("team_members").update(payload).eq("id", editingMember.id);
      if (error) { toast.error("Erreur", { description: error.message }); return; }
      toast.success("Membre mis à jour");
    } else {
      const payload2 = { ...payload, order_index: team.length };
      const { error } = await supabase.from("team_members").insert([payload2]);
      if (error) { toast.error("Erreur", { description: error.message }); return; }
      toast.success("Membre ajouté");
    }
    resetMemberForm();
    fetchTeam();
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm("Supprimer ce membre ?")) return;
    await supabase.from("team_members").delete().eq("id", id);
    toast.success("Membre supprimé");
    fetchTeam();
  };

  // --- Milestones CRUD ---
  const resetMilestoneForm = () => {
    setEditingMilestone(null);
    setMilestoneYear("");
    setMilestoneEvent("");
    setMilestoneDesc("");
    setMilestoneIcon("Rocket");
  };

  const handleEditMilestone = (m: any) => {
    setEditingMilestone(m);
    setMilestoneYear(m.year);
    setMilestoneEvent(m.event);
    setMilestoneDesc(m.description || "");
    setMilestoneIcon(m.icon || "Rocket");
  };

  const handleSaveMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { 
      year: milestoneYear, 
      event: milestoneEvent, 
      description: milestoneDesc, 
      icon: milestoneIcon 
    };
    if (editingMilestone && !editingMilestone.isNew) {
      const { error } = await supabase.from("company_milestones").update(payload).eq("id", editingMilestone.id);
      if (error) { toast.error("Erreur", { description: error.message }); return; }
      toast.success("Événement mis à jour");
    } else {
      const { error } = await supabase.from("company_milestones").insert([{ ...payload, order_index: milestones.length }]);
      if (error) { toast.error("Erreur", { description: error.message }); return; }
      toast.success("Événement ajouté");
    }
    resetMilestoneForm();
    fetchMilestones();
  };

  const handleDeleteMilestone = async (id: string) => {
    if (!confirm("Supprimer cet événement ?")) return;
    await supabase.from("company_milestones").delete().eq("id", id);
    toast.success("Événement supprimé");
    fetchMilestones();
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">À propos</h2>
        <p className="text-muted-foreground mt-2">Gérez votre équipe et votre histoire.</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 border-b border-border pb-4 mb-6">
        <button
          onClick={() => { setActiveTab("team"); resetMemberForm(); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === "team" ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}
        >
          <Users className="w-4 h-4" /> Équipe
        </button>
        <button
          onClick={() => { setActiveTab("milestones"); resetMilestoneForm(); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === "milestones" ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}
        >
          <Clock className="w-4 h-4" /> Histoire (Timeline)
        </button>
      </div>

      {/* ===== TEAM TAB ===== */}
      {activeTab === "team" && (
        <div className="space-y-6">
          {editingMember ? (
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-lg">{editingMember.isNew ? "Ajouter un membre" : "Modifier le membre"}</h3>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveMember} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm">Nom complet</label>
                      <input required value={memberName} onChange={e => setMemberName(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background" placeholder="Marie Dubois" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm">Rôle / Poste</label>
                      <input required value={memberRole} onChange={e => setMemberRole(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background" placeholder="CEO & Fondatrice" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">Description courte</label>
                    <input value={memberDesc} onChange={e => setMemberDesc(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background" placeholder="15 ans d'expérience dans..." />
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button variant="ghost" type="button" onClick={resetMemberForm}>Annuler</Button>
                    <Button type="submit">Sauvegarder</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-end">
                <Button onClick={() => setEditingMember({ isNew: true })}>
                  <Plus className="w-5 h-5 mr-2" /> Ajouter un membre
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {team.map(m => (
                  <Card key={m.id}>
                    <CardHeader className="flex flex-row justify-between items-start">
                      <div>
                        <div className="font-bold text-lg">{m.name}</div>
                        <div className="text-primary text-sm font-medium">{m.role}</div>
                        <div className="text-muted-foreground text-sm mt-1">{m.description}</div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => handleEditMember(m)} className="text-primary hover:text-primary/80"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteMember(m.id)} className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
                {team.length === 0 && <p className="text-muted-foreground">Aucun membre dans l'équipe.</p>}
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== MILESTONES TAB ===== */}
      {activeTab === "milestones" && (
        <div className="space-y-6">
          {editingMilestone ? (
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-lg">{editingMilestone.isNew ? "Ajouter un événement" : "Modifier l'événement"}</h3>
              </CardHeader>
               <CardContent>
                 <form onSubmit={handleSaveMilestone} className="space-y-4">
                   <div className="grid grid-cols-4 gap-4">
                     <div className="space-y-2">
                       <label className="text-sm">Année</label>
                       <input required value={milestoneYear} onChange={e => setMilestoneYear(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background" placeholder="2024" />
                     </div>
                     <div className="space-y-2 col-span-2">
                       <label className="text-sm">Titre de l'événement</label>
                       <input required value={milestoneEvent} onChange={e => setMilestoneEvent(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background" placeholder="Lancement de la v4.0" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm">Icône</label>
                       <select value={milestoneIcon} onChange={e => setMilestoneIcon(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background">
                         {iconOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                       </select>
                     </div>
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm">Description détaillée</label>
                     <textarea rows={3} value={milestoneDesc} onChange={e => setMilestoneDesc(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background" placeholder="Description de l'événement..." />
                   </div>
                   <div className="flex justify-end gap-3 pt-4 border-t border-border">
                     <Button variant="ghost" type="button" onClick={resetMilestoneForm}>Annuler</Button>
                     <Button type="submit">Sauvegarder</Button>
                   </div>
                 </form>
               </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-end">
                <Button onClick={() => setEditingMilestone({ isNew: true })}>
                  <Plus className="w-5 h-5 mr-2" /> Ajouter un événement
                </Button>
              </div>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                   <thead className="bg-muted">
                     <tr>
                       <th className="px-4 py-3 w-24">Année</th>
                       <th className="px-4 py-3 w-16 text-center">Icône</th>
                       <th className="px-4 py-3">Événement</th>
                       <th className="px-4 py-3 text-muted-foreground font-normal">Description</th>
                       <th className="px-4 py-3 text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody>
                     {milestones.map(m => (
                       <tr key={m.id} className="border-t border-border bg-card hover:bg-muted/30 transition-colors">
                         <td className="px-4 py-3 font-bold text-primary">{m.year}</td>
                         <td className="px-4 py-3 text-center">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto text-primary">
                               {(() => {
                                 const Icon = IconMapping[m.icon] || Rocket;
                                 return <Icon className="w-4 h-4" />;
                               })()}
                            </div>
                         </td>
                         <td className="px-4 py-3 font-semibold">{m.event}</td>
                         <td className="px-4 py-3 text-muted-foreground italic text-xs truncate max-w-[200px]">{m.description}</td>
                         <td className="px-4 py-3 text-right">
                           <div className="flex gap-2 justify-end">
                             <button onClick={() => handleEditMilestone(m)} className="text-primary hover:text-primary/80"><Edit2 className="w-4 h-4" /></button>
                             <button onClick={() => handleDeleteMilestone(m.id)} className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                           </div>
                         </td>
                       </tr>
                     ))}
                    {milestones.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-4 text-center text-muted-foreground">Aucun événement.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
