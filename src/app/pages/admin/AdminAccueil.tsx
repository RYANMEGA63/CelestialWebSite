import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Card, CardContent, CardHeader } from "../../components/Card";
import { Button } from "../../components/Button";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export function AdminAccueil() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUpdate, setEditingUpdate] = useState<any | null>(null);

  // Form states
  const [version, setVersion] = useState("");
  const [date, setDate] = useState("");
  const [changes, setChanges] = useState("");
  const [orderIndex, setOrderIndex] = useState("0");

  useEffect(() => {
    fetchUpdates();
  }, []);

  async function fetchUpdates() {
    setLoading(true);
    const { data, error } = await supabase
      .from("home_updates")
      .select("*")
      .order("order_index", { ascending: true })
      .order("date", { ascending: false });
    
    if (error) {
      toast.error("Erreur de chargement");
    } else {
      setUpdates(data || []);
    }
    setLoading(false);
  }

  const handleEdit = (update: any) => {
    setEditingUpdate(update);
    setVersion(update.version);
    setDate(update.date);
    setChanges(update.changes);
    setOrderIndex(update.order_index?.toString() || "0");
  };

  const resetForm = () => {
    setEditingUpdate(null);
    setVersion("");
    setDate(new Date().toISOString().split("T")[0]);
    setChanges("");
    setOrderIndex(updates.length.toString());
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = { version, date, changes, order_index: parseInt(orderIndex) || 0 };

    if (editingUpdate && !editingUpdate.isNew) {
      const { error } = await supabase.from("home_updates").update(payload).eq("id", editingUpdate.id);
      if (error) toast.error("Erreur", { description: error.message });
      else toast.success("Mise à jour réussie");
    } else {
      const { error } = await supabase.from("home_updates").insert([payload]);
      if (error) toast.error("Erreur", { description: error.message });
      else toast.success("Encart ajouté");
    }
    
    resetForm();
    fetchUpdates();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet encart ?")) return;
    const { error } = await supabase.from("home_updates").delete().eq("id", id);
    if (error) {
      toast.error("Erreur", { description: error.message });
    } else {
      toast.success("Encart supprimé");
      fetchUpdates();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold">Mises à jour de l'Accueil</h2>
          <p className="text-muted-foreground mt-2">Gérez les encarts "Dernières mises à jour" affichés sur la page d'accueil.</p>
        </div>
        {!editingUpdate && (
          <Button onClick={() => {
            resetForm();
            setEditingUpdate({ isNew: true });
          }}>
            <Plus className="w-5 h-5 mr-2" />
            Nouvel encart
          </Button>
        )}
      </div>

      {editingUpdate ? (
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-lg">{editingUpdate.isNew ? "Ajouter un encart" : "Modifier l'encart"}</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm">Version (ex: v3.2.0)</label>
                  <input required value={version} onChange={e => setVersion(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Date d'affichage</label>
                  <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm">Description des changements (1 ligne)</label>
                <input required value={changes} onChange={e => setChanges(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background" placeholder="Ex: Nouvelle API REST, améliorations performances" />
              </div>
              <div className="space-y-2">
                <label className="text-sm">Ordre d'affichage (0 s'affiche en premier)</label>
                <input required type="number" value={orderIndex} onChange={e => setOrderIndex(e.target.value)} className="w-32 px-3 py-2 border rounded-md bg-background" />
              </div>
              
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
                <Button variant="ghost" type="button" onClick={resetForm}>Annuler</Button>
                <Button type="submit">Sauvegarder</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <p>Chargement...</p>
          ) : updates.map(update => (
            <Card key={update.id}>
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-lg">{update.version}</span>
                    <span className="text-sm text-muted-foreground">{format(new Date(update.date), "dd MMMM yyyy")}</span>
                  </div>
                  <p className="text-muted-foreground">{update.changes}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(update)} className="text-primary hover:text-primary/80"><Edit2 className="w-5 h-5" /></button>
                  <button onClick={() => handleDelete(update.id)} className="text-red-500 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
                </div>
              </CardHeader>
            </Card>
          ))}
          {updates.length === 0 && !loading && <p>Aucun encart ajouté.</p>}
        </div>
      )}
    </div>
  );
}
