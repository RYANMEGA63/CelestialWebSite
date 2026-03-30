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
    <div className="flex flex-col h-full py-6 px-3" style={{ background: "var(--card)" }}>
      {/* Header */}
      <div className="px-3 mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}>
            <BookOpen className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-black tracking-tight" style={{ color: "var(--foreground)" }}>
            Documentation
          </span>
        </div>
        <p className="text-[11px] ml-9" style={{ color: "var(--muted-foreground)" }}>
          {categories.length} thèmes · {docs.length} guides
        </p>
      </div>

      {/* Search */}
      <div className="px-2 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--muted-foreground)" }} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelectedDoc(null); }}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs outline-none border transition-all"
            style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
        </div>
      </div>

      {/* Nav */}
      <p className="text-[9px] font-black uppercase tracking-[0.2em] px-3 mb-2" style={{ color: "var(--muted-foreground)" }}>
        Thèmes
      </p>
      <nav className="flex-1 overflow-y-auto space-y-0.5 no-scrollbar">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 rounded-xl animate-pulse mx-1" style={{ background: "var(--muted)" }} />
            ))
          : categories.map((cat) => {
              const Icon = getCategoryIcon(cat.id);
              const isActive = cat.id === activeCategory;
              const count = docs.filter((d) => d.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150"
                  style={{
                    background: isActive ? "var(--primary)" : "transparent",
                    color: isActive ? "#fff" : "var(--muted-foreground)",
                  }}
                  onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "var(--muted)"; }}
                  onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <Icon className="w-4 h-4 shrink-0" style={{ opacity: isActive ? 1 : 0.6 }} />
                  <span className="text-sm font-semibold flex-1 truncate" style={{ color: isActive ? "#fff" : "var(--foreground)" }}>
                    {cat.label}
                  </span>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 tabular-nums"
                    style={{
                      background: isActive ? "rgba(255,255,255,0.2)" : "var(--muted)",
                      color: isActive ? "#fff" : "var(--muted-foreground)",
                    }}
                  >
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
    <div className="flex-1 overflow-y-auto p-6">
      <motion.div key={activeCategory} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="mb-6">
        {activeCat && (
          <>
            <nav className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
              <span>Documentation</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground/60">{activeCat.label}</span>
            </nav>

            <div className="flex items-center gap-3 mb-2">
              {(() => {
                const Icon = getCategoryIcon(activeCat.id);
                return (
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-primary/20 bg-primary/5">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                );
              })()}
              <div>
                <h1 className="text-xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
                  {activeCat.label}
                </h1>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {visibleDocs.length} guide{visibleDocs.length !== 1 ? "s" : ""}
                  {search ? ` pour "${search}"` : ""}
                </p>
              </div>
            </div>
            <div className="h-px mt-4" style={{ background: "var(--border)" }} />
          </>
        )}
      </motion.div>

      {visibleDocs.length === 0 ? (
        <div className="text-center py-20" style={{ color: "var(--muted-foreground)" }}>
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-sm">Aucun guide correspondant</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {visibleDocs.map((doc, i) => (
              <motion.button
                key={doc.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ delay: i * 0.035, duration: 0.18 }}
                onClick={() => setSelectedDoc(doc)}
                className="group text-left p-4 rounded-xl border bg-card/30 hover:bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex flex-col h-full">
                   <div className="flex items-start justify-between mb-3">
                     <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <FileText className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary" />
                     </div>
                     <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">
                        <Clock className="w-3 h-3" />
                        {doc.time}
                     </div>
                   </div>
                   <h3 className="text-sm font-black tracking-tight group-hover:text-primary transition-colors mb-1">
                     {doc.title}
                   </h3>
                   <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                     {doc.description}
                   </p>
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
        {/* Breadcrumb & Sub-nav sticky */}
        <div className="shrink-0 border-b bg-background/80 backdrop-blur-md z-40" style={{ borderColor: "var(--border)" }}>
           <div className="px-6 py-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
              <button onClick={() => setSelectedDoc(null)} className="hover:text-foreground transition-colors">Documentation</button>
              <ChevronRight className="w-3 h-3" />
              <button onClick={() => setSelectedDoc(null)} className="hover:text-foreground transition-colors">{activeCat?.label}</button>
              <ChevronRight className="w-3 h-3" />
              <span className="text-primary truncate">{selectedDoc.title}</span>
           </div>
           
           <div className="px-4 pb-0 flex gap-1 overflow-x-auto no-scrollbar">
              {siblingDocs.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDoc(d)}
                  className={`px-4 py-3 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all shrink-0 ${d.id === selectedDoc.id ? "border-primary text-primary" : "border-transparent text-muted-foreground/40 hover:text-foreground hover:border-border"}`}
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
