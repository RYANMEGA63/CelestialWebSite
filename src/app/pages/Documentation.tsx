import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen, ChevronRight, Clock, Search, FileText,
  Zap, Code2, Blocks, Database, Lock, Menu, X, ArrowLeft,
  Hash
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { DocPage } from "./DocPage";

export interface DocPageData {
  id: string;
  category: string;
  title: string;
  description: string;
  time: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  "getting-started": Zap,
  "api": Code2,
  "guides": FileText,
  "components": Blocks,
  "database": Database,
  "security": Lock,
};

function getCategoryIcon(slug: string): React.ElementType {
  return ICON_MAP[slug] ?? BookOpen;
}

export function Documentation() {
  const [categories, setCategories] = useState<any[]>([]);
  const [docs, setDocs] = useState<DocPageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocPageData | null>(null);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const [catsRes, pagesRes] = await Promise.all([
        supabase.from("docs_categories").select("*").order("order_index"),
        supabase.from("docs_pages").select("*").order("order_index"),
      ]);
      const cats = catsRes.data ?? [];
      setCategories(cats);
      setDocs(
        (pagesRes.data ?? []).map((p: any) => ({
          id: p.id,
          category: p.category_id,
          title: p.title,
          description: p.description ?? "",
          time: p.time_to_read ?? "",
        }))
      );
      if (cats.length > 0) setActiveCategory(cats[0].id);
      setLoading(false);
    }
    fetchData();
  }, []);

  const visibleDocs = docs.filter((d) => {
    const matchCat = activeCategory ? d.category === activeCategory : true;
    const matchSearch =
      !search ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const getPrevNext = (doc: DocPageData) => {
    const idx = visibleDocs.findIndex((d) => d.id === doc.id);
    return {
      prev: idx > 0 ? visibleDocs[idx - 1] : undefined,
      next: idx < visibleDocs.length - 1 ? visibleDocs[idx + 1] : undefined,
    };
  };

  const activeCat = categories.find((c) => c.id === activeCategory);

  const handleSelectCategory = (id: string) => {
    setActiveCategory(id);
    setSelectedDoc(null);
    setSidebarOpen(false);
  };

  // ─── SIDEBAR ────────────────────────────────────────────────
  const SidebarContent = () => (
    <div className="flex flex-col h-full py-6 px-0 bg-background">
      {/* Header */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 flex items-center justify-center bg-foreground text-background">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-base font-black tracking-tighter uppercase text-foreground">
            Documentation
          </span>
        </div>
        <p className="text-xs font-mono text-muted-foreground ml-11">
          {categories.length} THEMES / {docs.length} GUIDES
        </p>
      </div>

      {/* Search */}
      <div className="px-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelectedDoc(null); }}
            className="w-full pl-10 pr-4 py-2.5 text-xs font-mono outline-none border-2 border-border bg-background text-foreground focus:border-foreground transition-none"
          />
        </div>
      </div>

      {/* Nav */}
      <p className="text-[10px] font-mono font-bold uppercase tracking-widest px-6 mb-3 text-muted-foreground">
        Thèmes
      </p>
      <nav className="flex-1 overflow-y-auto space-y-0 no-scrollbar">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse border-b border-border/50 mx-6 bg-muted/50" />
            ))
          : categories.map((cat) => {
              const Icon = getCategoryIcon(cat.id);
              const isActive = cat.id === activeCategory;
              const count = docs.filter((d) => d.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-none border-l-4 ${
                    isActive ? "border-primary bg-muted/30 text-foreground" : "border-transparent text-muted-foreground hover:bg-muted/10 hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-semibold flex-1 truncate">
                    {cat.label}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-muted text-foreground shrink-0">
                    {count}
                  </span>
                </button>
              );
            })}
      </nav>
    </div>
  );

  // ─── LISTE DES PAGES ────────────────────────────────────────
  const PagesList = () => (
    <div className="flex-1 overflow-y-auto p-8 lg:p-12">
      <motion.div key={activeCategory} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="mb-10">
        {activeCat && (
          <>
            <nav className="flex items-center gap-2 mb-6 text-xs font-mono uppercase text-muted-foreground">
              <span>Docs</span>
              <span className="text-border">/</span>
              <span className="text-foreground">{activeCat.label}</span>
            </nav>

            <div className="flex items-center gap-4 mb-4">
              {(() => {
                const Icon = getCategoryIcon(activeCat.id);
                return (
                  <div className="w-12 h-12 flex items-center justify-center shrink-0 border-2 border-primary text-primary">
                    <Icon className="w-6 h-6" />
                  </div>
                );
              })()}
              <div>
                <h1 className="text-3xl font-black tracking-tighter uppercase text-foreground">
                  {activeCat.label}
                </h1>
                <p className="text-sm font-mono text-muted-foreground mt-1">
                  {visibleDocs.length} GUIDE{visibleDocs.length !== 1 ? "S" : ""}
                  {search ? ` FOR "${search.toUpperCase()}"` : ""}
                </p>
              </div>
            </div>
            <div className="h-0.5 w-full bg-border mt-8" />
          </>
        )}
      </motion.div>

      {visibleDocs.length === 0 ? (
        <div className="text-center py-20" style={{ color: "var(--muted-foreground)" }}>
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-sm">Aucun guide correspondant</p>
        </div>
      ) : (
        <div className="flex flex-col border-t border-border">
          <AnimatePresence mode="popLayout">
            {visibleDocs.map((doc, i) => (
              <motion.button
                key={doc.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ delay: i * 0.035, duration: 0.18 }}
                onClick={() => setSelectedDoc(doc)}
                className="group text-left p-6 border-b border-border bg-background hover:bg-muted/30 transition-none flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-2">
                     <FileText className="w-4 h-4 text-primary" />
                     <h3 className="text-lg font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                       {doc.title}
                     </h3>
                   </div>
                   <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-1 ml-7">
                     {doc.description}
                   </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground shrink-0 sm:ml-auto ml-7">
                   <Clock className="w-3.5 h-3.5" />
                   {doc.time}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );

  // ─── CONTENU D'UNE PAGE ─────────────────────────────────────
  const DocContent = () => {
    if (!selectedDoc) return null;
    const { prev, next } = getPrevNext(selectedDoc);
    
    // Guides du même thème pour la sub-nav
    const siblingDocs = docs.filter(d => d.category === selectedDoc.category);

    return (
      <div className="flex-1 h-full flex flex-col overflow-hidden">
        {/* NPM-style Header Navbar */}
        <div className="shrink-0 border-b-2 border-border bg-background z-40">
           <div className="px-8 py-5 flex items-center gap-3 text-xs font-mono uppercase text-muted-foreground">
              <button onClick={() => setSelectedDoc(null)} className="hover:text-foreground transition-colors font-bold">Docs</button>
              <span className="text-border">/</span>
              <button onClick={() => setSelectedDoc(null)} className="hover:text-foreground transition-colors font-bold">{activeCat?.label}</button>
              <span className="text-border">/</span>
              <span className="text-foreground font-black bg-muted px-2 py-0.5">{selectedDoc.title}</span>
           </div>
           
           <div className="px-8 pb-0 flex gap-6 overflow-x-auto no-scrollbar border-t border-border">
              {siblingDocs.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDoc(d)}
                  className={`py-4 text-xs font-bold uppercase tracking-widest border-b-[3px] transition-none shrink-0 ${
                    d.id === selectedDoc.id 
                      ? "border-foreground text-foreground" 
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  {d.title}
                </button>
              ))}
           </div>
        </div>

        {/* DocPage en mode embedded */}
        <div className="flex-1 overflow-y-auto">
          <DocPage
            doc={selectedDoc}
            categoryLabel={activeCat?.label ?? ""}
            onBack={() => setSelectedDoc(null)}
            prevDoc={prev ? { title: prev.title, onNavigate: () => setSelectedDoc(prev) } : undefined}
            nextDoc={next ? { title: next.title, onNavigate: () => setSelectedDoc(next) } : undefined}
            embedded
          />
        </div>
      </div>
    );
  };

  // ─── LAYOUT ─────────────────────────────────────────────────
  return (
    <div className="flex" style={{ height: "calc(100vh - 73px)", background: "var(--background)" }}>

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r overflow-hidden" style={{ borderColor: "var(--border)" }}>
        <SidebarContent />
      </aside>

      {/* Sidebar mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 lg:hidden" style={{ background: "rgba(0,0,0,0.5)" }} />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 lg:hidden border-r overflow-hidden bg-background"
              style={{ borderColor: "var(--border)" }}
            >
              <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 z-10 p-2 rounded-xl" style={{ background: "var(--muted)", color: "var(--foreground)" }}>
                <X className="w-4 h-4" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Panel droit */}
      <div className="flex-1 overflow-hidden flex flex-col">

        {/* Topbar mobile */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl" style={{ background: "var(--muted)", color: "var(--foreground)" }}>
            <Menu className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>
            {selectedDoc ? selectedDoc.title : activeCat?.label ?? "Documentation"}
          </span>
        </div>

        {/* Contenu animé */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedDoc ? (
              <motion.div
                key={`doc-${selectedDoc.id}`}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }}
                className="h-full flex flex-col overflow-hidden"
              >
                <DocContent />
              </motion.div>
            ) : (
              <motion.div
                key={`list-${activeCategory ?? "all"}-${search}`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.18 }}
                className="h-full overflow-y-auto"
              >
                <PagesList />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
