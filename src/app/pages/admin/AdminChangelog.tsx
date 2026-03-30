import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Card, CardContent, CardHeader } from "../../components/Card";
import { Button } from "../../components/Button";
import { Plus, Edit2, Trash2, Rocket, Bug, Shield, Search } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export function AdminChangelog() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<any | null>(null);

  // Form states Entry
  const [version, setVersion] = useState("");
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<any[]>([]);
  
  // Form states Item
  const [newItemType, setNewItemType] = useState("feature");
  const [newItemContent, setNewItemContent] = useState("");

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    setLoading(true);
    const { data, error } = await supabase
      .from("changelog_entries")
      .select("*, changelog_items(*)")
      .order("date", { ascending: false });
    
    if (error) {
      toast.error("Erreur de chargement");
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  }

  const handleEdit = (entry: any) => {
    setEditingEntry(entry);
    setVersion(entry.version);
    setDate(entry.date);
    setTitle(entry.title);
    setDescription(entry.description || "");
    setItems(entry.changelog_items || []);
  };

  const resetForm = () => {
    setEditingEntry(null);
    setVersion("");
    setDate(new Date().toISOString().split("T")[0]);
    setTitle("");
    setDescription("");
    setItems([]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = { version, date, title, description };

    if (editingEntry && !editingEntry.isNew) {
      const { error } = await supabase.from("changelog_entries").update(payload).eq("id", editingEntry.id);
      if (error) {
        toast.error("Erreur", { description: error.message });
        return;
      }
      
      // Mettre à jour les items: on supprime tout et on recrée (pour la simplicité)
      await supabase.from("changelog_items").delete().eq("entry_id", editingEntry.id);
      if (items.length > 0) {
        const itemsPayload = items.map(item => ({ entry_id: editingEntry.id, type: item.type, content: item.content }));
        await supabase.from("changelog_items").insert(itemsPayload);
      }
      toast.success("Mise à jour réussie");
    } else {
      const { data, error } = await supabase.from("changelog_entries").insert([payload]).select().single();
      if (error) {
        toast.error("Erreur", { description: error.message });
        return;
      }
      
      if (items.length > 0) {
        const itemsPayload = items.map(item => ({ entry_id: data.id, type: item.type, content: item.content }));
        await supabase.from("changelog_items").insert(itemsPayload);
      }
      toast.success("Version ajoutée");
    }
    
    resetForm();
    fetchEntries();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette version ?")) return;
    const { error } = await supabase.from("changelog_entries").delete().eq("id", id);
    if (error) {
      toast.error("Erreur", { description: error.message });
    } else {
      toast.success("Version supprimée");
      fetchEntries();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "feature": case "feat": return <Rocket className="w-4 h-4 text-primary" />;
      case "fix": return <Bug className="w-4 h-4 text-orange-500" />;
      case "security": return <Shield className="w-4 h-4 text-red-500" />;
      case "removed": case "deprecated": return <Trash2 className="w-4 h-4 text-muted-foreground" />;
      default: return <Search className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold">Changelog (Mises à jour)</h2>
          <p className="text-muted-foreground mt-2">Publiez de nouvelles versions avec leurs changements.</p>
        </div>
        {!editingEntry && (
          <Button onClick={() => {
            resetForm();
            setEditingEntry({ isNew: true });
          }}>
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle Version
          </Button>
        )}
      </div>

      {editingEntry ? (
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-lg">{editingEntry.isNew ? "Ajouter une version" : "Modifier la version"}</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm">Numéro de version (ex: v1.2.0)</label>
                  <input required value={version} onChange={e => setVersion(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Date de publication</label>
                  <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm">Titre de la mise à jour (ex: Lancement du mode sombre)</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background" />
              </div>
              <div className="space-y-2">
                <label className="text-sm">Description globale (optionnelle)</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-md bg-background" />
              </div>

              {/* Items Management */}
              <div className="border border-border p-4 rounded-xl mt-4 bg-muted/10">
                <h4 className="font-medium text-sm mb-3">Liste des changements ("petites cartes")</h4>
                <div className="space-y-3 mb-4">
                  {items.map((it, idx) => (
                    <div key={idx} className="flex gap-3 items-center bg-card p-3 rounded-md border">
                      <span className="p-1.5 rounded-md bg-muted">{getTypeIcon(it.type)}</span>
                      <p className="flex-1 text-sm">{it.content}</p>
                      <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-md"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  {items.length === 0 && <p className="text-sm text-muted-foreground italic">Aucun changement ajouté.</p>}
                </div>
                
                <div className="flex gap-2">
                  <select value={newItemType} onChange={e => setNewItemType(e.target.value)} className="px-3 py-2 border rounded-md bg-background text-sm">
                    <option value="feature">Fonctionnalité (FEATURE)</option>
                    <option value="fix">Correction (FIX)</option>
                    <option value="security">Sécurité (SECURITY)</option>
                    <option value="removed">Déprécié (REMOVED)</option>
                  </select>
                  <input 
                    value={newItemContent} 
                    onChange={e => setNewItemContent(e.target.value)} 
                    placeholder="Description du changement..." 
                    className="flex-1 px-3 py-2 border rounded-md bg-background text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newItemContent) {
                          setItems([...items, { type: newItemType, content: newItemContent }]);
                          setNewItemContent("");
                        }
                      }
                    }}
                  />
                  <Button type="button" onClick={() => {
                    if (newItemContent) {
                      setItems([...items, { type: newItemType, content: newItemContent }]);
                      setNewItemContent("");
                    }
                  }} variant="secondary" size="sm">Ajouter</Button>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="ghost" type="button" onClick={resetForm}>Annuler</Button>
                <Button type="submit">Sauvegarder</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {loading ? (
            <p>Chargement...</p>
          ) : entries.map(entry => (
            <Card key={entry.id}>
              <CardHeader className="flex flex-row justify-between items-start border-b border-border/40 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg font-bold text-primary">{entry.version}</span>
                    <span className="text-sm text-muted-foreground">{format(new Date(entry.date), "dd MMMM yyyy")}</span>
                  </div>
                  <h3 className="font-bold text-xl mt-1">{entry.title}</h3>
                  {entry.description && <p className="text-muted-foreground mt-2">{entry.description}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(entry)} className="text-primary hover:text-primary/80"><Edit2 className="w-5 h-5" /></button>
                  <button onClick={() => handleDelete(entry.id)} className="text-red-500 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  {(entry.changelog_items || []).map((item: any, i: number) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        {getTypeIcon(item.type)}
                      </div>
                      <div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mb-1 inline-block
                          ${['feature', 'feat'].includes(item.type) ? 'bg-primary/10 text-primary' : 
                            item.type === 'fix' ? 'bg-orange-500/10 text-orange-600' : 
                            item.type === 'security' ? 'bg-red-500/10 text-red-600' : 'bg-muted text-muted-foreground'}`
                        }>
                          {['feature', 'feat'].includes(item.type) ? 'FEATURE' : ['removed', 'deprecated'].includes(item.type) ? 'REMOVED' : item.type.toUpperCase()}
                        </span>
                        <p className="text-sm text-foreground">{item.content}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
          {entries.length === 0 && !loading && <p>Aucun changelog.</p>}
        </div>
      )}
    </div>
  );
}
