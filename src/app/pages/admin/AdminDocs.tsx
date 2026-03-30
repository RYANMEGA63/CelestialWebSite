import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../../../lib/supabase";
import { Card, CardContent, CardHeader } from "../../components/Card";
import { Button } from "../../components/Button";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Folder, 
  FileText, 
  Layout, 
  ChevronRight,
  Monitor,
  Search,
  BookOpen,
  ArrowLeft,
  Loader2,
  Settings,
  MoreVertical
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function AdminDocs() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]); // "Thèmes" effectively
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [view, setView] = useState<"list" | "category" | "page">("list");
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);

  // States for Category (Theme) Form
  const [catId, setCatId] = useState("");
  const [catLabel, setCatLabel] = useState("");
  const [isEditingCat, setIsEditingCat] = useState(false);
  const [oldCatId, setOldCatId] = useState("");

  // States for Page (Guide) Form
  const [pageId, setPageId] = useState("");
  const [pageCategoryId, setPageCategoryId] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [pageDescription, setPageDescription] = useState("");
  const [pageTime, setPageTime] = useState("");
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [oldPageId, setOldPageId] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [catsRes, pagesRes] = await Promise.all([
      supabase.from("docs_categories").select("*").order("order_index"),
      supabase.from("docs_pages").select("*").order("order_index")
    ]);
    
    if (catsRes.data) {
      setCategories(catsRes.data);
      if (catsRes.data.length > 0 && !selectedThemeId) {
        setSelectedThemeId(catsRes.data[0].id);
      }
    }
    if (pagesRes.data) setPages(pagesRes.data);
    setLoading(false);
  }, [selectedThemeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Theme Handlers ---
  const saveTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { id: catId, label: catLabel };
    if (isEditingCat) {
      const { error } = await supabase.from("docs_categories").update(payload).eq("id", oldCatId);
      if (error) toast.error(error.message); else { toast.success("Thème modifié"); setView("list"); }
    } else {
      const { error } = await supabase.from("docs_categories").insert([payload]);
      if (error) toast.error(error.message); else { toast.success("Thème créé"); setSelectedThemeId(catId); setView("list"); }
    }
    fetchData();
  };

  const deleteTheme = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce thème ? Tous les guides associés seront orphelins (mais non supprimés de la DB).")) return;
    const { error } = await supabase.from("docs_categories").delete().eq("id", id);
    if (!error) { 
      toast.success("Thème supprimé"); 
      if (selectedThemeId === id) setSelectedThemeId(categories.find(c => c.id !== id)?.id || null);
      fetchData(); 
    }
  };

  // --- Guide Handlers ---
  const saveGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { id: pageId, category_id: pageCategoryId, title: pageTitle, description: pageDescription, time_to_read: pageTime };
    if (isEditingPage) {
      const { error } = await supabase.from("docs_pages").update(payload).eq("id", oldPageId);
      if (error) toast.error(error.message); else { toast.success("Guide modifié"); setView("list"); }
    } else {
      const { error } = await supabase.from("docs_pages").insert([payload]);
      if (error) toast.error(error.message); else { toast.success("Guide créé"); setView("list"); }
    }
    fetchData();
  };

  const deleteGuide = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce guide ?")) return;
    const { error } = await supabase.from("docs_pages").delete().eq("id", id);
    if (!error) { toast.success("Guide supprimé"); fetchData(); }
  };

  if (loading && categories.length === 0) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-muted-foreground animate-pulse">Chargement de la documentation...</p>
    </div>
  );

  const selectedTheme = categories.find(c => c.id === selectedThemeId);
  const themePages = pages.filter(p => p.category_id === selectedThemeId);

  // Layout logic for forms...
  if (view === "category") {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in zoom-in-95 duration-500">
        <Card className="rounded-[2.5rem] border-border/50 shadow-2xl overflow-hidden">
          <CardHeader className="bg-primary/5 p-8 border-b border-border/50">
             <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black">{isEditingCat ? "Modifier Thème" : "Nouveau Thème Logiciel"}</h3>
                <button onClick={() => setView("list")} className="p-2 rounded-full hover:bg-muted transition-all"><ArrowLeft className="w-5 h-5" /></button>
             </div>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={saveTheme} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest opacity-50 ml-2">ID du thème (slug, ex: "logiciel-a")</label>
                <input required value={catId} onChange={e => setCatId(e.target.value)} className="w-full px-6 py-3 rounded-2xl bg-muted/50 border border-border/50 focus:border-primary/50 outline-none font-bold transition-all shadow-inner" placeholder="ex: mon-super-soft" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest opacity-50 ml-2">Nom du logiciel / Thème</label>
                <input required value={catLabel} onChange={e => setCatLabel(e.target.value)} className="w-full px-6 py-3 rounded-2xl bg-muted/50 border border-border/50 focus:border-primary/50 outline-none font-bold transition-all shadow-inner" placeholder="ex: Logiciel de Gestion" />
              </div>
              <div className="flex gap-4 pt-4">
                <Button variant="ghost" type="button" onClick={() => setView("list")} className="rounded-2xl flex-1 h-12">Annuler</Button>
                <Button type="submit" className="rounded-2xl flex-1 h-12 shadow-lg shadow-primary/20">Enregistrer le Thème</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (view === "page") {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in zoom-in-95 duration-500">
        <Card className="rounded-[2.5rem] border-border/50 shadow-2xl overflow-hidden">
          <CardHeader className="bg-secondary/5 p-8 border-b border-border/50">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black">{isEditingPage ? "Éditer le Guide" : "Nouveau Guide (Documentation)"}</h3>
              <button onClick={() => setView("list")} className="p-2 rounded-full hover:bg-muted transition-all"><ArrowLeft className="w-5 h-5" /></button>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={saveGuide} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-50 ml-2">ID (slug unique)</label>
                  <input required value={pageId} onChange={e => setPageId(e.target.value)} className="w-full px-6 py-3 rounded-2xl bg-muted/50 border border-border/50 focus:border-secondary/50 outline-none font-bold transition-all shadow-inner" placeholder="ex: installation-rapide" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-50 ml-2">Thème Associé</label>
                  <select required value={pageCategoryId} onChange={e => setPageCategoryId(e.target.value)} className="w-full px-6 py-3 rounded-2xl bg-muted/50 border border-border/50 focus:border-secondary/50 outline-none font-bold transition-all shadow-inner appearance-none">
                    <option value="">Sélectionner un thème...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-[1fr_150px] gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-50 ml-2">Titre du Guide</label>
                  <input required value={pageTitle} onChange={e => setPageTitle(e.target.value)} className="w-full px-6 py-3 rounded-2xl bg-muted/50 border border-border/50 focus:border-secondary/50 outline-none font-bold transition-all shadow-inner" placeholder="ex: Comment installer le logiciel ?" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-50 ml-2">Lecture</label>
                  <input value={pageTime} onChange={e => setPageTime(e.target.value)} className="w-full px-6 py-3 rounded-2xl bg-muted/50 border border-border/50 focus:border-secondary/50 outline-none font-bold transition-all shadow-inner" placeholder="5 min" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest opacity-50 ml-2">Description courte (SEO/Carte)</label>
                <textarea value={pageDescription} onChange={e => setPageDescription(e.target.value)} rows={3} className="w-full px-6 py-3 rounded-2xl bg-muted/50 border border-border/50 focus:border-secondary/50 outline-none transition-all shadow-inner resize-none leading-relaxed" placeholder="Résumé de ce que le client va apprendre..." />
              </div>
              <div className="flex gap-4 pt-4">
                <Button variant="ghost" type="button" onClick={() => setView("list")} className="rounded-2xl flex-1 h-12">Annuler</Button>
                <Button type="submit" className="rounded-2xl flex-1 h-12 bg-secondary hover:bg-secondary/90 shadow-lg shadow-secondary/20">Lancer la création</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Main Layout ---
  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
             <BookOpen className="w-10 h-10 text-primary" /> Documentation Clients
          </h2>
          <p className="text-muted-foreground mt-2 font-medium">Gérez vos guides thématiques et votre support technique.</p>
        </div>
        <div className="flex gap-3">
           <Button variant="secondary" className="rounded-2xl" onClick={() => { setIsEditingCat(false); setCatId(""); setCatLabel(""); setView("category"); }}>
              <Plus className="w-4 h-4 mr-2" /> Nouveau Thème
           </Button>
        </div>
      </header>

      <div className="grid lg:grid-cols-[320px_1fr] gap-10 items-start">
        {/* Themes Sidebar */}
        <div className="space-y-4">
          <div className="px-4 py-2 flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Thèmes Logiciels ({categories.length})</h3>
          </div>
          <div className="flex flex-col gap-2">
            {categories.map(theme => (
              <button
                key={theme.id}
                onClick={() => setSelectedThemeId(theme.id)}
                className={`group flex items-center justify-between p-4 rounded-3xl transition-all border text-left ${
                  selectedThemeId === theme.id 
                    ? "bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20 scale-[1.02]" 
                    : "bg-card/50 border-border/40 text-muted-foreground hover:border-primary/20 hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className={`p-2.5 rounded-2xl shrink-0 ${selectedThemeId === theme.id ? "bg-white/20" : "bg-primary/5 text-primary"}`}>
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-black text-sm truncate">{theme.label}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest opacity-60 ${selectedThemeId === theme.id ? "" : "text-primary/50"}`}>
                       {pages.filter(p => p.category_id === theme.id).length} guides
                    </p>
                  </div>
                </div>
                <div className={`flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity ${selectedThemeId === theme.id ? "text-white" : ""}`}>
                   <button onClick={(e) => { e.stopPropagation(); setOldCatId(theme.id); setCatId(theme.id); setCatLabel(theme.label); setIsEditingCat(true); setView("category"); }} className="p-1.5 hover:bg-white/10 rounded-lg">
                      <Edit2 className="w-3.5 h-3.5" />
                   </button>
                   <button onClick={(e) => { e.stopPropagation(); deleteTheme(theme.id); }} className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                   </button>
                </div>
              </button>
            ))}
            <button 
              onClick={() => { setIsEditingCat(false); setCatId(""); setCatLabel(""); setView("category"); }}
              className="mt-4 flex items-center justify-center gap-3 p-5 rounded-3xl border-2 border-dashed border-border/40 text-muted-foreground hover:border-primary/40 hover:text-primary transition-all font-bold text-sm"
            >
               <Plus className="w-5 h-5" /> Ajouter Thème
            </button>
          </div>
        </div>

        {/* Guides for Theme */}
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="bg-card border border-border/50 rounded-[2.5rem] p-10 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 p-12 opacity-5">
               <BookOpen className="w-64 h-64" />
            </div>

            <div className="relative z-10 space-y-8">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h3 className="text-4xl font-black tracking-tight">{selectedTheme?.label}</h3>
                    <p className="text-muted-foreground mt-2 font-medium max-w-xl">
                       Gérez les guides d'utilisation et les ressources techniques pour le thème <span className="text-primary font-bold">{selectedTheme?.label}</span>.
                    </p>
                  </div>
                  <Button 
                    variant="secondary" 
                    className="rounded-[1.5rem] h-14 px-8 shadow-xl shadow-secondary/10" 
                    onClick={() => { 
                      setIsEditingPage(false); 
                      setPageId(""); 
                      setPageTitle(""); 
                      setPageDescription(""); 
                      setPageTime(""); 
                      setPageCategoryId(selectedThemeId || ""); 
                      setView("page"); 
                    }}
                    disabled={!selectedThemeId}
                  >
                    <Plus className="w-5 h-5 mr-3" /> Nouveau Guide
                  </Button>
               </div>

               <div className="grid md:grid-cols-2 gap-6">
                  {themePages.map(guide => (
                    <motion.div 
                      key={guide.id} 
                      whileHover={{ y: -5 }}
                      className="group p-6 rounded-[2rem] border border-border/40 bg-card/50 hover:bg-background hover:border-primary/20 hover:shadow-2xl transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                         <div className="p-3 rounded-2xl bg-secondary/10 text-secondary">
                            <FileText className="w-6 h-6" />
                         </div>
                         <div className="flex items-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => navigate(`/admin/docs/${guide.id}`)} 
                              className="p-3 rounded-xl bg-secondary/10 text-secondary hover:bg-secondary/20" 
                              title="Contenu"
                            >
                              <Layout className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => { setOldPageId(guide.id); setPageId(guide.id); setPageCategoryId(guide.category_id); setPageTitle(guide.title); setPageDescription(guide.description || ""); setPageTime(guide.time_to_read || ""); setIsEditingPage(true); setView("page"); }} 
                              className="p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20" 
                              title="Paramètres"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => deleteGuide(guide.id)} 
                              className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20" 
                              title="Supprimer"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                         </div>
                      </div>
                      
                      <h4 className="text-xl font-black mb-2">{guide.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 font-medium mb-6">{guide.description || "Aucune description fournie."}</p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-border/30">
                         <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{guide.id}</span>
                         <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">{guide.time_to_read || "5 min"}</span>
                      </div>
                    </motion.div>
                  ))}

                  {themePages.length === 0 && selectedThemeId && (
                    <div className="md:col-span-2 py-20 text-center border-2 border-dashed border-border/30 rounded-[3rem]">
                       <div className="p-6 rounded-full bg-muted w-20 h-20 flex items-center justify-center mx-auto mb-6">
                          <FileText className="w-10 h-10 text-muted-foreground/30" />
                       </div>
                       <h5 className="text-xl font-black opacity-50">Aucun guide ici</h5>
                       <p className="text-muted-foreground font-medium mt-2">Commencez par créer le premier guide pour ce thème.</p>
                       <Button 
                         variant="ghost" 
                         className="mt-6 rounded-xl hover:text-primary transition-colors"
                         onClick={() => { setIsEditingPage(false); setPageId(""); setPageTitle(""); setPageDescription(""); setPageTime(""); setPageCategoryId(selectedThemeId || ""); setView("page"); }}
                       >
                          <Plus className="w-4 h-4 mr-2" /> Créer un premier guide
                       </Button>
                    </div>
                  )}

                  {!selectedThemeId && (
                     <div className="md:col-span-2 py-20 text-center">
                        <p className="text-muted-foreground font-bold italic">Veuillez sélectionner ou créer un thème à gauche pour gérer ses guides.</p>
                     </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
