import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen, ChevronRight, Clock, Search, FileText,
  Zap, Code2, Blocks, Database, Lock, Menu, X
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
  const [selectedDoc, setSelectedDoc] = useState<DocPageData | null>(null);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Track which categories are expanded (all open by default)
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

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
      // Expand all categories by default
      setExpandedCats(new Set(cats.map((c: any) => c.id)));
      setLoading(false);
    }
    fetchData();
  }, []);

  const toggleCat = (id: string) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredDocs = (catId: string) =>
    docs.filter(d => {
      const matchCat = d.category === catId;
      const matchSearch =
        !search ||
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });

  const allDocsForSearch = docs.filter(d =>
    search &&
    (d.title.toLowerCase().includes(search.toLowerCase()) ||
     d.description.toLowerCase().includes(search.toLowerCase()))
  );

  const activeCat = categories.find(c => c.id === selectedDoc?.category);

  const allVisibleDocs = selectedDoc
    ? docs.filter(d => d.category === selectedDoc.category)
    : [];
  const selectedIdx = allVisibleDocs.findIndex(d => d.id === selectedDoc?.id);
  const prevDoc = selectedIdx > 0 ? allVisibleDocs[selectedIdx - 1] : undefined;
  const nextDoc = selectedIdx < allVisibleDocs.length - 1 ? allVisibleDocs[selectedIdx + 1] : undefined;

  // ─── SIDEBAR ────────────────────────────────────────────────
  const SidebarContent = () => (
    <div className="flex flex-col h-full py-6 px-0 bg-background">
      {/* Header */}
      <div className="px-5 mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-7 h-7 flex items-center justify-center bg-foreground text-background shrink-0">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-black tracking-tighter uppercase text-foreground">
            Documentation
          </span>
        </div>
        <p className="text-[10px] font-mono text-muted-foreground ml-10">
          {categories.length} THÈMES · {docs.length} GUIDES
        </p>
      </div>

      {/* Search */}
      <div className="px-5 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); }}
            className="w-full pl-9 pr-3 py-2 text-xs font-mono outline-none border border-border bg-background text-foreground focus:border-foreground transition-none"
          />
        </div>
      </div>

      {/* Accordion Nav */}
      <nav className="flex-1 overflow-y-auto no-scrollbar">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-9 animate-pulse border-b border-border/40 mx-5 mb-1 bg-muted/40" />
            ))
          : search
          ? (
            // Search results across all categories
            <div className="px-5">
              <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Résultats ({allDocsForSearch.length})
              </p>
              {allDocsForSearch.length === 0
                ? <p className="text-xs text-muted-foreground py-4 text-center">Aucun résultat</p>
                : allDocsForSearch.map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => { setSelectedDoc(doc); setSidebarOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium truncate border-l-2 mb-0.5 transition-none ${
                        selectedDoc?.id === doc.id
                          ? "border-foreground text-foreground bg-muted/30"
                          : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20"
                      }`}
                    >
                      {doc.title}
                    </button>
                  ))
              }
            </div>
          )
          : categories.map((cat) => {
              const Icon = getCategoryIcon(cat.id);
              const isExpanded = expandedCats.has(cat.id);
              const catDocs = filteredDocs(cat.id);

              return (
                <div key={cat.id}>
                  {/* Category header (toggle) */}
                  <button
                    onClick={() => toggleCat(cat.id)}
                    className="w-full flex items-center gap-2.5 px-5 py-2.5 text-left hover:bg-muted/20 transition-none group"
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 text-muted-foreground group-hover:text-foreground" />
                    <span className="text-xs font-black uppercase tracking-widest flex-1 truncate text-foreground">
                      {cat.label}
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground/60 mr-1">{catDocs.length}</span>
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                    </motion.div>
                  </button>

                  {/* Sub-items */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-5 border-l border-border/40 pl-0 mb-1">
                          {catDocs.length === 0 ? (
                            <p className="text-[10px] text-muted-foreground/40 pl-4 py-2 font-mono">Aucun guide</p>
                          ) : catDocs.map(doc => (
                            <button
                              key={doc.id}
                              onClick={() => { setSelectedDoc(doc); setSidebarOpen(false); }}
                              className={`w-full text-left pl-4 pr-3 py-2 text-xs font-medium truncate border-l-2 -ml-px transition-none flex items-center gap-2 ${
                                selectedDoc?.id === doc.id
                                  ? "border-primary text-foreground bg-primary/5 font-bold"
                                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/10"
                              }`}
                            >
                              <FileText className="w-3 h-3 shrink-0 opacity-50" />
                              <span className="truncate">{doc.title}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
        }
      </nav>
    </div>
  );

  // ─── WELCOME (rien de sélectionné) ──────────────────────────
  const WelcomeView = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
      <div className="w-16 h-16 flex items-center justify-center bg-foreground text-background mb-6">
        <BookOpen className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-black tracking-tight mb-3">Documentation Celestial</h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-8">
        Sélectionnez un guide dans la barre de navigation à gauche pour commencer.
      </p>
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {categories.slice(0, 4).map(cat => {
          const Icon = getCategoryIcon(cat.id);
          const count = docs.filter(d => d.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setExpandedCats(prev => new Set([...prev, cat.id]));
                const firstDoc = docs.find(d => d.category === cat.id);
                if (firstDoc) setSelectedDoc(firstDoc);
              }}
              className="flex items-center gap-3 p-4 border border-border hover:border-foreground bg-background hover:bg-muted/20 text-left transition-none group"
            >
              <Icon className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
              <div>
                <p className="text-xs font-black text-foreground">{cat.label}</p>
                <p className="text-[10px] font-mono text-muted-foreground">{count} guide{count !== 1 ? "s" : ""}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ─── LAYOUT ─────────────────────────────────────────────────
  return (
    <div className="flex min-h-[calc(100vh-5rem)]" style={{ background: "var(--background)" }}>

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto no-scrollbar">
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
      <div className="flex-1 flex flex-col min-w-0 lg:border-l" style={{ borderColor: "var(--border)" }}>

        {/* Topbar mobile */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl" style={{ background: "var(--muted)", color: "var(--foreground)" }}>
            <Menu className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>
            {selectedDoc ? selectedDoc.title : "Documentation"}
          </span>
        </div>

        {/* Contenu */}
        <AnimatePresence mode="wait">
          {selectedDoc ? (
            <motion.div
              key={`doc-${selectedDoc.id}`}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col flex-1"
            >
              {/* Breadcrumb + sibling sub-nav */}
              <div className="shrink-0 border-b-2 border-border bg-background z-30 sticky top-20">
                <div className="px-8 py-3 flex items-center gap-2 text-xs font-mono uppercase text-muted-foreground">
                  <button onClick={() => setSelectedDoc(null)} className="hover:text-foreground transition-colors font-bold">Docs</button>
                  <span className="text-border">/</span>
                  <span className="text-foreground font-black">{activeCat?.label}</span>
                  <span className="text-border">/</span>
                  <span className="text-muted-foreground truncate max-w-xs">{selectedDoc.title}</span>
                </div>
                <div className="px-8 pb-0 flex gap-6 overflow-x-auto no-scrollbar border-t border-border">
                  {allVisibleDocs.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDoc(d)}
                      className={`py-3 text-xs font-bold uppercase tracking-widest border-b-[3px] transition-none shrink-0 ${
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

              <div className="flex-1">
                <DocPage
                  doc={selectedDoc}
                  categoryLabel={activeCat?.label ?? ""}
                  onBack={() => setSelectedDoc(null)}
                  prevDoc={prevDoc ? { title: prevDoc.title, onNavigate: () => setSelectedDoc(prevDoc) } : undefined}
                  nextDoc={nextDoc ? { title: nextDoc.title, onNavigate: () => setSelectedDoc(nextDoc) } : undefined}
                  embedded
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex-1 flex"
            >
              <WelcomeView />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
