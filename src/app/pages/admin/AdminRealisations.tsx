import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Card, CardContent, CardHeader } from "../../components/Card";
import { Button } from "../../components/Button";
import { Plus, Edit2, Trash2, Image as ImageIcon, MessageSquare, Briefcase } from "lucide-react";
import { toast } from "sonner";

type AdminRealTab = "projets" | "testimonials";

export function AdminRealisations() {
  const [activeTab, setActiveTab] = useState<AdminRealTab>("projets");
  const [projets, setProjets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProjet, setEditingProjet] = useState<any | null>(null);
  
  // Testimonials state
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [editingTestimonial, setEditingTestimonial] = useState<any | null>(null);
  const [testQuote, setTestQuote] = useState("");
  const [testAuthor, setTestAuthor] = useState("");
  const [testRole, setTestRole] = useState("");

  // Form states
  const [clientName, setClientName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchProjets();
    fetchTestimonials();
  }, []);

  async function fetchTestimonials() {
    const { data } = await supabase.from("testimonials").select("*").order("order_index");
    setTestimonials(data || []);
  }

  async function fetchProjets() {
    setLoading(true);
    const { data, error } = await supabase
      .from("portfolio_projects")
      .select("*")
      .order("order_index", { ascending: true });
    
    if (error) {
      toast.error("Erreur de chargement");
    } else {
      setProjets(data || []);
    }
    setLoading(false);
  }

  const handleEdit = (projet: any) => {
    setEditingProjet(projet);
    setClientName(projet.client_name);
    setProjectName(projet.project_name);
    setDescription(projet.description || "");
    
    // Support retro-compatibilité pour image_url VS image_urls
    if (projet.image_urls && Array.isArray(projet.image_urls) && projet.image_urls.length > 0) {
      setImageUrls(projet.image_urls);
    } else if (projet.image_url) {
      setImageUrls([projet.image_url]);
    } else {
      setImageUrls([]);
    }
  };

  const resetForm = () => {
    setEditingProjet(null);
    setClientName("");
    setProjectName("");
    setDescription("");
    setImageUrls([]);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    const files = Array.from(e.target.files);
    const newUrls: string[] = [];

    toast.info(`Upload de ${files.length} image(s)...`);

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `projects/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(filePath, file);

      if (uploadError) {
        toast.error(`Erreur d'upload pour ${file.name}`);
        continue;
      }

      const { data } = supabase.storage.from('portfolio').getPublicUrl(filePath);
      newUrls.push(data.publicUrl);
    }

    setImageUrls(prev => [...prev, ...newUrls]);
    setIsUploading(false);
    toast.success("Upload terminé, images ajoutées !");
  };

  const removeImage = (index: number) => {
    setImageUrls(urls => urls.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      client_name: clientName,
      project_name: projectName,
      description,
      image_url: imageUrls.length > 0 ? imageUrls[0] : null,
      image_urls: imageUrls,
    };

    if (editingProjet && !editingProjet.isNew) {
      const { error } = await supabase.from("portfolio_projects").update(payload).eq("id", editingProjet.id);
      if (error) toast.error("Erreur", { description: error.message });
      else toast.success("Projet mis à jour");
    } else {
      const { error } = await supabase.from("portfolio_projects").insert([payload]);
      if (error) toast.error("Erreur", { description: error.message });
      else toast.success("Projet ajouté");
    }
    
    resetForm();
    fetchProjets();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce projet ?")) return;
    const { error } = await supabase.from("portfolio_projects").delete().eq("id", id);
    if (error) {
      toast.error("Erreur", { description: error.message });
    } else {
      toast.success("Projet supprimé");
      fetchProjets();
    }
  };

  // ---- TESTIMONIALS CRUD ----
  const resetTestimonialForm = () => { setEditingTestimonial(null); setTestQuote(""); setTestAuthor(""); setTestRole(""); };
  const handleEditTestimonial = (t: any) => { setEditingTestimonial(t); setTestQuote(t.quote); setTestAuthor(t.author); setTestRole(t.role); };
  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { quote: testQuote, author: testAuthor, role: testRole };
    if (editingTestimonial && !editingTestimonial.isNew) {
      const { error } = await supabase.from("testimonials").update(payload).eq("id", editingTestimonial.id);
      if (error) { toast.error("Erreur", { description: error.message }); return; }
      toast.success("Témoignage mis à jour");
    } else {
      const { error } = await supabase.from("testimonials").insert([{ ...payload, order_index: testimonials.length }]);
      if (error) { toast.error("Erreur", { description: error.message }); return; }
      toast.success("Témoignage ajouté");
    }
    resetTestimonialForm(); fetchTestimonials();
  };
  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm("Supprimer ce témoignage ?")) return;
    await supabase.from("testimonials").delete().eq("id", id);
    toast.success("Témoignage supprimé"); fetchTestimonials();
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Réalisations & Portfolio</h2>
        <p className="text-muted-foreground mt-2">Gérez vos projets et avis clients.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-4 mb-6">
        {([
          { id: "projets", label: "Projets", icon: Briefcase },
          { id: "testimonials", label: "Avis Clients", icon: MessageSquare },
        ] as { id: AdminRealTab; label: string; icon: any }[]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id); resetForm(); resetTestimonialForm(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === id ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* ===== PROJETS TAB ===== */}
      {activeTab === "projets" && (
        <>
          {editingProjet ? (
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-lg">{editingProjet.isNew ? "Ajouter un projet" : "Modifier le projet"}</h3>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm">Nom de l'entreprise (Client)</label>
                      <input required value={clientName} onChange={e => setClientName(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm">Nom du projet</label>
                      <input required value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">Description globale</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-md bg-background" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-sm font-medium">Images (Aperçus du projet)</label>
                    <div className="p-4 border border-dashed rounded-xl bg-muted/10">
                      <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={isUploading}
                        className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 disabled:opacity-50" />
                      {isUploading && <p className="text-xs text-primary mt-2">Upload en cours...</p>}
                    </div>
                    {imageUrls.length > 0 && (
                      <div className="grid grid-cols-4 gap-3">
                        {imageUrls.map((url, i) => (
                          <div key={i} className="relative group rounded-md overflow-hidden aspect-video border border-border">
                            <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removeImage(i)}
                              className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                              <Trash2 className="w-5 h-5 text-red-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 mt-4">
                    <Button variant="ghost" type="button" onClick={resetForm}>Annuler</Button>
                    <Button type="submit">Sauvegarder</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-end">
                <Button onClick={() => setEditingProjet({ isNew: true })}><Plus className="w-5 h-5 mr-2" />Nouveau projet</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? <p>Chargement...</p> : projets.map(projet => (
                  <Card key={projet.id} className="overflow-hidden flex flex-col">
                    {projet.image_url ? (
                      <div className="h-48 w-full bg-muted bg-cover bg-center" style={{ backgroundImage: `url(${projet.image_url})` }} />
                    ) : (
                      <div className="h-48 w-full bg-muted flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <CardHeader className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg leading-tight">{projet.project_name}</h3>
                          <p className="text-primary text-sm font-medium mt-1">{projet.client_name}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(projet)} className="text-primary hover:text-primary/80"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(projet.id)} className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{projet.description}</p>
                    </CardHeader>

                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ===== TESTIMONIALS TAB ===== */}
      {activeTab === "testimonials" && (
        <div className="space-y-6">
          {editingTestimonial ? (
            <Card>
              <CardHeader><h3 className="font-semibold text-lg">{editingTestimonial.isNew ? "Ajouter un avis" : "Modifier l'avis"}</h3></CardHeader>
              <CardContent>
                <form onSubmit={handleSaveTestimonial} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm">Citation (avis du client)</label>
                    <textarea required value={testQuote} onChange={e => setTestQuote(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-md bg-background" placeholder="Celestial a transformé notre façon de travailler..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm">Nom du client</label>
                      <input required value={testAuthor} onChange={e => setTestAuthor(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background" placeholder="Marie Laurent" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm">Rôle & Entreprise</label>
                      <input required value={testRole} onChange={e => setTestRole(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background" placeholder="CEO, TalentCorp" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button variant="ghost" type="button" onClick={resetTestimonialForm}>Annuler</Button>
                    <Button type="submit">Sauvegarder</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-end">
                <Button onClick={() => setEditingTestimonial({ isNew: true })}><Plus className="w-5 h-5 mr-2" />Ajouter un avis</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonials.map(t => (
                  <Card key={t.id}>
                    <CardHeader className="flex flex-row justify-between items-start">
                      <div className="flex-1">
                        <p className="italic text-muted-foreground text-sm mb-2">"{t.quote}"</p>
                        <div className="font-semibold">{t.author}</div>
                        <div className="text-xs text-primary">{t.role}</div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0 ml-4">
                        <button onClick={() => handleEditTestimonial(t)} className="text-primary hover:text-primary/80"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteTestimonial(t.id)} className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
                {testimonials.length === 0 && <p className="text-muted-foreground">Aucun avis client ajouté.</p>}
              </div>
            </>
          )}
        </div>
      )}


    </div>
  );
}
