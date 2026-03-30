import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Card, CardContent, CardHeader } from "../../components/Card";
import { Button } from "../../components/Button";
import { Plus, Edit2, Trash2, Tag, HelpCircle, Briefcase } from "lucide-react";
import { toast } from "sonner";

type Tab = "offres" | "services" | "faqs";

export function AdminOffres() {
  const [activeTab, setActiveTab] = useState<Tab>("offres");

  // === OFFRES ===
  const [offres, setOffres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOffre, setEditingOffre] = useState<any | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isMonthly, setIsMonthly] = useState(true);
  const [isPopular, setIsPopular] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);

  // === SERVICES ===
  const [services, setServices] = useState<any[]>([]);
  const [editingService, setEditingService] = useState<any | null>(null);
  const [serviceTitle, setServiceTitle] = useState("");
  const [serviceDesc, setServiceDesc] = useState("");
  const [servicePrice, setServicePrice] = useState("");

  // === FAQS ===
  const [faqs, setFaqs] = useState<any[]>([]);
  const [editingFaq, setEditingFaq] = useState<any | null>(null);
  const [faqQ, setFaqQ] = useState("");
  const [faqA, setFaqA] = useState("");

  useEffect(() => {
    fetchOffres();
    fetchServices();
    fetchFaqs();
  }, []);

  async function fetchOffres() {
    setLoading(true);
    const { data } = await supabase.from("pricing_offers").select("*").order("order_index", { ascending: true });
    setOffres(data || []);
    setLoading(false);
  }
  async function fetchServices() {
    const { data } = await supabase.from("additional_services").select("*").order("order_index");
    setServices(data || []);
  }
  async function fetchFaqs() {
    const { data } = await supabase.from("faqs").select("*").order("order_index");
    setFaqs(data || []);
  }

  // ---- OFFRES CRUD ----
  const handleEdit = (offre: any) => {
    setEditingOffre(offre);
    setTitle(offre.title);
    setDescription(offre.description || "");
    setPrice(offre.price.toString());
    setIsMonthly(offre.is_monthly);
    setIsPopular(offre.is_popular);
    setFeatures(offre.features || []);
  };
  const resetForm = () => {
    setEditingOffre(null); setTitle(""); setDescription(""); setPrice(""); setIsMonthly(true); setIsPopular(false); setFeatures([]);
  };
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { title, description, price: Number(price), is_monthly: isMonthly, is_popular: isPopular, features: features.filter(f => f.trim() !== "") };
    if (editingOffre && !editingOffre.isNew) {
      const { error } = await supabase.from("pricing_offers").update(payload).eq("id", editingOffre.id);
      if (error) { toast.error("Erreur", { description: error.message }); return; }
      toast.success("Offre mise à jour");
    } else {
      const { error } = await supabase.from("pricing_offers").insert([payload]);
      if (error) { toast.error("Erreur", { description: error.message }); return; }
      toast.success("Offre créée");
    }
    resetForm(); fetchOffres();
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette offre ?")) return;
    await supabase.from("pricing_offers").delete().eq("id", id);
    toast.success("Offre supprimée"); fetchOffres();
  };

  // ---- SERVICES CRUD ----
  const resetServiceForm = () => { setEditingService(null); setServiceTitle(""); setServiceDesc(""); setServicePrice(""); };
  const handleEditService = (s: any) => { setEditingService(s); setServiceTitle(s.title); setServiceDesc(s.description); setServicePrice(s.price); };
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { title: serviceTitle, description: serviceDesc, price: servicePrice };
    if (editingService && !editingService.isNew) {
      const { error } = await supabase.from("additional_services").update(payload).eq("id", editingService.id);
      if (error) { toast.error("Erreur", { description: error.message }); return; }
      toast.success("Service mis à jour");
    } else {
      const { error } = await supabase.from("additional_services").insert([{ ...payload, order_index: services.length }]);
      if (error) { toast.error("Erreur", { description: error.message }); return; }
      toast.success("Service ajouté");
    }
    resetServiceForm(); fetchServices();
  };
  const handleDeleteService = async (id: string) => {
    if (!confirm("Supprimer ce service ?")) return;
    await supabase.from("additional_services").delete().eq("id", id);
    toast.success("Service supprimé"); fetchServices();
  };

  // ---- FAQS CRUD ----
  const resetFaqForm = () => { setEditingFaq(null); setFaqQ(""); setFaqA(""); };
  const handleEditFaq = (f: any) => { setEditingFaq(f); setFaqQ(f.question); setFaqA(f.answer); };
  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { question: faqQ, answer: faqA };
    if (editingFaq && !editingFaq.isNew) {
      const { error } = await supabase.from("faqs").update(payload).eq("id", editingFaq.id);
      if (error) { toast.error("Erreur", { description: error.message }); return; }
      toast.success("FAQ mise à jour");
    } else {
      const { error } = await supabase.from("faqs").insert([{ ...payload, order_index: faqs.length }]);
      if (error) { toast.error("Erreur", { description: error.message }); return; }
      toast.success("FAQ ajoutée");
    }
    resetFaqForm(); fetchFaqs();
  };
  const handleDeleteFaq = async (id: string) => {
    if (!confirm("Supprimer cette FAQ ?")) return;
    await supabase.from("faqs").delete().eq("id", id);
    toast.success("FAQ supprimée"); fetchFaqs();
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Offres & Tarification</h2>
        <p className="text-muted-foreground mt-2">Gérez vos offres, services additionnels et questions fréquentes.</p>
      </div>

      <div className="flex gap-2 border-b border-border pb-4 mb-6 overflow-x-auto">
        {([
          { id: "offres", label: "Offres", icon: Tag },
          { id: "services", label: "Services", icon: Briefcase },
          { id: "faqs", label: "FAQ", icon: HelpCircle },
        ] as { id: Tab; label: string; icon: any }[]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id); resetForm(); resetServiceForm(); resetFaqForm(); }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors shrink-0 text-sm ${activeTab === id ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* ====== OFFRES TAB ====== */}
      {activeTab === "offres" && (
        <>
          {editingOffre ? (
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-lg">{editingOffre.isNew ? "Créer une offre" : "Modifier l'offre"}</h3>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm">Titre</label>
                      <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm">Prix (DZD)</label>
                      <input required type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">Description</label>
                    <input value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background" />
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={isMonthly} onChange={e => setIsMonthly(e.target.checked)} />
                      Paiement Mensuel (versus achat unique)
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={isPopular} onChange={e => setIsPopular(e.target.checked)} />
                      Mettre en avant ("Le plus populaire")
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">Fonctionnalités incluses</label>
                    <div className="space-y-2">
                      {features.map((f, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <input
                            value={f}
                            onChange={e => { const nf = [...features]; nf[i] = e.target.value; setFeatures(nf); }}
                            className="flex-1 px-3 py-2 border rounded-md bg-background text-sm"
                            placeholder="Ex: Hébergement inclus..."
                          />
                          <button type="button" onClick={() => setFeatures(features.filter((_, idx) => idx !== i))} className="p-2 text-red-500 hover:bg-red-500/10 rounded-md">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <Button type="button" variant="secondary" size="sm" onClick={() => setFeatures([...features, ""])} className="w-full border border-dashed border-border">
                        <Plus className="w-4 h-4 mr-2" /> Ajouter une fonctionnalité
                      </Button>
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
            <>
              <div className="flex justify-end">
                <Button onClick={() => setEditingOffre({ isNew: true })}><Plus className="w-5 h-5 mr-2" />Nouvelle Offre</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? <p>Chargement...</p> : offres.map(offre => (
                  <Card key={offre.id}>
                    <CardHeader className="flex flex-row justify-between items-start">
                      <div>
                        <h3 className="font-bold text-xl">{offre.title}</h3>
                        <p className="text-muted-foreground text-sm">{offre.is_monthly ? "Par mois" : "Paiement unique"}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(offre)} className="text-primary hover:text-primary/80"><Edit2 className="w-5 h-5" /></button>
                        <button onClick={() => handleDelete(offre.id)} className="text-red-500 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-extrabold pb-2">{offre.price} DZD</p>
                      <p className="text-sm text-muted-foreground pb-4">{offre.description}</p>
                      {offre.features?.length > 0 && (
                        <ul className="text-sm space-y-1">{offre.features.map((f: string, i: number) => <li key={i}>• {f}</li>)}</ul>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ====== SERVICES TAB ====== */}
      {activeTab === "services" && (
        <div className="space-y-6">
          {editingService ? (
            <Card>
              <CardHeader><h3 className="font-semibold text-lg">{editingService.isNew ? "Ajouter un service" : "Modifier le service"}</h3></CardHeader>
              <CardContent>
                <form onSubmit={handleSaveService} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm">Titre</label>
                      <input required value={serviceTitle} onChange={e => setServiceTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background" placeholder="Consulting" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm">Prix affiché</label>
                      <input required value={servicePrice} onChange={e => setServicePrice(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background" placeholder="À partir de 15 000 DZD/h" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">Description</label>
                    <textarea value={serviceDesc} onChange={e => setServiceDesc(e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-md bg-background" />
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button variant="ghost" type="button" onClick={resetServiceForm}>Annuler</Button>
                    <Button type="submit">Sauvegarder</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-end">
                <Button onClick={() => setEditingService({ isNew: true })}><Plus className="w-5 h-5 mr-2" />Ajouter un service</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map(s => (
                  <Card key={s.id}>
                    <CardHeader className="flex flex-row justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{s.title}</h3>
                        <p className="text-primary font-semibold text-sm">{s.price}</p>
                        <p className="text-muted-foreground text-sm mt-1">{s.description}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => handleEditService(s)} className="text-primary hover:text-primary/80"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteService(s.id)} className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
                {services.length === 0 && <p className="text-muted-foreground">Aucun service ajouté.</p>}
              </div>
            </>
          )}
        </div>
      )}

      {/* ====== FAQS TAB ====== */}
      {activeTab === "faqs" && (
        <div className="space-y-6">
          {editingFaq ? (
            <Card>
              <CardHeader><h3 className="font-semibold text-lg">{editingFaq.isNew ? "Ajouter une FAQ" : "Modifier la FAQ"}</h3></CardHeader>
              <CardContent>
                <form onSubmit={handleSaveFaq} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm">Question</label>
                    <input required value={faqQ} onChange={e => setFaqQ(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background" placeholder="Puis-je changer d'offre à tout moment ?" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">Réponse</label>
                    <textarea required value={faqA} onChange={e => setFaqA(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-md bg-background" />
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button variant="ghost" type="button" onClick={resetFaqForm}>Annuler</Button>
                    <Button type="submit">Sauvegarder</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-end">
                <Button onClick={() => setEditingFaq({ isNew: true })}><Plus className="w-5 h-5 mr-2" />Ajouter une FAQ</Button>
              </div>
              <div className="space-y-4">
                {faqs.map(f => (
                  <Card key={f.id}>
                    <CardHeader className="flex flex-row justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">{f.question}</h3>
                        <p className="text-muted-foreground text-sm mt-1">{f.answer}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0 ml-4">
                        <button onClick={() => handleEditFaq(f)} className="text-primary hover:text-primary/80"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteFaq(f.id)} className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
                {faqs.length === 0 && <p className="text-muted-foreground">Aucune FAQ ajoutée.</p>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
