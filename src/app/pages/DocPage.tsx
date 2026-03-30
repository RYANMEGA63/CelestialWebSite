import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  Menu,
  X,
  Layout,
  BookOpen,
  Code2,
  ArrowLeft,
  Hash,
  Maximize2,
  Minimize2,
  Settings2,
  Eye,
  EyeOff,
  Image as ImageIcon
} from "lucide-react";
import { Skeleton } from "../components/Skeleton";
import { type DocPageData } from "./Documentation";
import { supabase } from "../../lib/supabase";

interface DocPageProps {
  doc: DocPageData;
  categoryLabel: string;
  onBack: () => void;
  prevDoc?: { title: string; onNavigate: () => void };
  nextDoc?: { title: string; onNavigate: () => void };
  embedded?: boolean;
}

export function DocPage({ doc, categoryLabel, onBack, prevDoc, nextDoc, embedded = false }: DocPageProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [tocOpen, setTocOpen] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mediaSize, setMediaSize] = useState<'xs' | 'sm' | 'md' | 'lg'>('md');
  const [hideImages, setHideImages] = useState(false);
  const [blockConfigs, setBlockConfigs] = useState<Record<string, { size: string, hidden: boolean }>>({});
  const sectionRefs = useRef<Record<string, HTMLElement>>({});

  const fetchDocContent = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('docs_sections')
      .select('*, docs_subsections(*)')
      .eq('page_id', doc.id)
      .order('order_index', { ascending: true });
      
    if (data) {
      const sortedSections = data.map((sec: any) => ({
        ...sec,
        docs_subsections: (sec.docs_subsections || []).sort((a: any, b: any) => a.order_index - b.order_index)
      }));
      setSections(sortedSections);
    }
    setLoading(false);
  }, [doc.id]);

  useEffect(() => {
    fetchDocContent();

    // Persistence load
    const saved = localStorage.getItem(`doc-prefs-${doc.id}`);
    if (saved) {
      try { setBlockConfigs(JSON.parse(saved)); } catch(e) {}
    }
  }, [fetchDocContent, doc.id]);

  // Save on change
  useEffect(() => {
    if (Object.keys(blockConfigs).length > 0) {
      localStorage.setItem(`doc-prefs-${doc.id}`, JSON.stringify(blockConfigs));
    }
  }, [blockConfigs, doc.id]);

  const updateBlockConfig = (id: string, updates: Partial<{ size: string, hidden: boolean }>) => {
    setBlockConfigs(prev => ({
      ...prev,
      [id]: { ...(prev[id] || { size: mediaSize, hidden: false }), ...updates }
    }));
  };

  // Suivi de la section active
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-20% 0% -70% 0%", threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach(el => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  const setRef = (id: string) => (el: HTMLElement | null) => {
    if (el) sectionRefs.current[id] = el;
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
    setTocOpen(false);
  };

  if (loading) return (
    <div className={`${embedded ? "pt-8 px-6" : "min-h-screen bg-background pt-32 px-4"} animate-in fade-in duration-700`}>
      <div className="mx-auto max-w-5xl">
        <div className="grid lg:grid-cols-[1fr_300px] gap-12">
          <div className="space-y-12">
            <div className="space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
            {[1, 2].map(i => (
              <div key={i} className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-64 w-full rounded-2xl" />
              </div>
            ))}
          </div>
          <div className="hidden lg:block space-y-4">
            <Skeleton className="h-8 w-full" />
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-4 w-full" />)}
          </div>
        </div>
      </div>
    </div>
  );

  return (
       <div className={`${embedded ? "" : "min-h-screen bg-background"} selection:bg-primary/20`}>
         {/* Floating TOC (Sommaire Flottant) */}
         {!embedded && (<aside className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden xl:block w-72">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-8 border border-border/40 bg-card/40 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden group"
            >
               <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />
               <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border/20 relative z-10">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                     <BookOpen className="w-4 h-4" />
                  </div>
                  <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/50">Sommaire</h4>
               </div>
               <nav className="space-y-3 relative z-10 max-h-[60vh] overflow-y-auto no-scrollbar pr-2">
                  {sections.map((section, idx) => (
                    <div key={section.id} className="space-y-2">
                      <button
                        onClick={() => scrollTo(section.id)}
                        className={`w-full text-left py-1 text-[11px] font-black transition-all flex items-start gap-3 group/item ${
                          activeId === section.id ? "text-primary" : "text-muted-foreground/40 hover:text-foreground"
                        }`}
                      >
                        <span className={`tabular-nums italic text-[12px] ${activeId === section.id ? "text-primary" : "text-muted-foreground/10"}`}>
                          {(idx + 1).toString().padStart(2, '0')}
                        </span>
                        <span className={activeId === section.id ? "" : "group-hover/item:translate-x-1 transition-transform"}>{section.title}</span>
                      </button>
                    </div>
                  ))}
               </nav>
            </motion.div>
         </aside>)}
  
         {/* Main Content Area */}
         <div className={`px-6 ${embedded ? "pt-4 pb-16" : "pt-32 pb-48"}`}>
           <motion.header 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="mb-16"
           >
             <div className="flex items-center justify-between mb-6">
                {!embedded && (
                <button 
                  onClick={onBack}
                  className="group flex items-center gap-3 px-5 py-2.5 rounded-full bg-muted border border-border/50 text-[10px] font-black uppercase tracking-widest hover:border-primary/50 transition-all shadow-sm"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                  Documentation
                </button>
                )}
                <div className="flex items-center gap-2">
                  {/* Hide images toggle */}
                  <button
                    onClick={() => setHideImages(h => !h)}
                    title={hideImages ? "Afficher les images" : "Masquer les images"}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                      hideImages
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-muted/30 border-border/40 text-muted-foreground/40 hover:text-foreground"
                    }`}
                  >
                    {hideImages ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    {hideImages ? "Images" : "Masquer"}
                  </button>
                  {/* Media size */}
                  <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-xl border border-border/40">
                     {['xs', 'sm', 'md', 'lg'].map(s => (
                       <button 
                         key={s}
                         onClick={() => setMediaSize(s as any)}
                         className={`px-2.5 py-1 rounded-lg transition-all text-[9px] font-black uppercase ${mediaSize === s ? "bg-primary text-white shadow" : "text-muted-foreground/40 hover:bg-muted"}`}
                       >
                         {s}
                       </button>
                     ))}
                  </div>
                </div>
             </div>
  
             {/* Hero meta card */}
             <div className="rounded-xl border border-border/50 bg-card/60 p-4 mb-6">
               <div className="flex items-start justify-between gap-4">
                 <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-2">
                     <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary">
                       <span className="w-1 h-1 rounded-full bg-primary" />
                       {categoryLabel}
                     </span>
                   </div>
                   <h1 className="text-2xl font-black tracking-tight text-foreground leading-tight mb-1">
                     {doc.title}
                   </h1>
                   <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                     {doc.description}
                   </p>
                 </div>
               </div>
               {/* Meta stats */}
               <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-border/30">
                 <span className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                   <Clock className="w-3.5 h-3.5" />
                   {doc.time || "5 min"}
                 </span>
                 <span className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                   <Hash className="w-3.5 h-3.5" />
                   {sections.length} section{sections.length !== 1 ? "s" : ""}
                 </span>
                 <span className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                   <Layout className="w-3.5 h-3.5" />
                   {sections.reduce((acc: number, s: any) => acc + (s.docs_subsections?.length || 0), 0)} blocs
                 </span>
                 {sections.some((s: any) => s.docs_subsections?.some((sub: any) => sub.image_url)) && (
                   <span className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                     <ImageIcon className="w-3.5 h-3.5" />
                     {sections.reduce((acc: number, s: any) => acc + (s.docs_subsections?.filter((sub: any) => sub.image_url)?.length || 0), 0)} image{sections.reduce((acc: number, s: any) => acc + (s.docs_subsections?.filter((sub: any) => sub.image_url)?.length || 0), 0) !== 1 ? "s" : ""}
                   </span>
                 )}
               </div>
             </div>
           </motion.header>
  
           <main className="space-y-6">
             {sections.map((section, sIdx) => (
               <motion.section
                 key={section.id}
                 id={section.id}
                 ref={setRef(section.id)}
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true, margin: "-100px" }}
                 className="scroll-mt-32"
               >
                 <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-2xl font-black tracking-tight text-foreground">
                      {section.title}
                    </h2>
                    <div className="h-px flex-1 bg-border/20" />
                 </div>
  
                 <div className="space-y-4">
                   {section.docs_subsections?.map((sub: any) => {
                     // Check for component markers
                     const isStep = sub.title && /^\d+[\.\)]/.test(sub.title);
                     const isCallout = sub.content && sub.content.startsWith('::');
                     
                     return (
                       <div key={sub.id} id={sub.id} ref={setRef(sub.id)} className="scroll-mt-24 space-y-6 group/sub">
                         {sub.title && sub.title !== "Nouveau Bloc" && (
                           <h3 className={`font-black flex items-center gap-3 transition-colors ${isStep ? "text-lg text-primary" : "text-base text-foreground group-hover/sub:text-primary"}`}>
                             {isStep && <span className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center text-xs">{sub.title.match(/^\d+/)?.[0]}</span>}
                             {isStep ? sub.title.replace(/^\d+[\.\)]\s*/, '') : sub.title}
                           </h3>
                         )}
  
                         {sub.content && (() => {
                            if (isCallout) {
                              const type = sub.content.split('\n')[0].replace('::', '').toLowerCase();
                              const text = sub.content.split('\n').slice(1).join('\n');
                              const styles: Record<string, string> = {
                                config: "border-blue-500/30 bg-blue-500/5 text-blue-200/80",
                                deploy: "border-emerald-500/30 bg-emerald-500/5 text-emerald-200/80",
                                error: "border-red-500/30 bg-red-500/5 text-red-200/80",
                              };
                              return (
                                <div className={`p-6 rounded-2xl border-l-4 font-medium text-sm leading-relaxed whitespace-pre-wrap ${styles[type] || 'border-border/30 bg-muted/5'}`}>
                                   {text}
                                </div>
                              );
                            }
                            return (
                              <div className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap max-w-3xl font-medium prose prose-invert prose-p:mb-4">
                                {sub.content}
                              </div>
                            );
                         })()}
  
                         {sub.image_url && (() => {
                           const config = blockConfigs[sub.id] || { size: mediaSize, hidden: false };
                           if (config.hidden || hideImages) {
                             return (
                               <button
                                 onClick={() => { if (hideImages) setHideImages(false); else updateBlockConfig(sub.id, { hidden: false }); }}
                                 className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/40 hover:text-primary transition-colors py-1"
                               >
                                 <Eye className="w-3.5 h-3.5" />
                                 {hideImages ? "Images masquées globalement" : "Afficher l'image"}
                               </button>
                             );
                           }
                           return (
                             <div className="group/box relative">
                               {/* Per-image controls */}
                               <div className="flex items-center gap-2 mb-1.5 opacity-0 group-hover/box:opacity-100 transition-opacity">
                                 {['xs', 'sm', 'md', 'lg'].map((s) => (
                                   <button
                                     key={s}
                                     onClick={() => updateBlockConfig(sub.id, { size: s as any })}
                                     className={`px-2 py-0.5 rounded text-[9px] font-black uppercase transition-all ${
                                       config.size === s ? "bg-primary text-white" : "text-muted-foreground/40 hover:bg-muted"
                                     }`}
                                   >{s}</button>
                                 ))}
                                 <button
                                   onClick={() => updateBlockConfig(sub.id, { hidden: true })}
                                   className="ml-auto flex items-center gap-1 text-[9px] font-black uppercase text-muted-foreground/30 hover:text-red-400 transition-colors"
                                 >
                                   <EyeOff className="w-3 h-3" /> Masquer
                                 </button>
                               </div>
                               <motion.figure
                                  className={`transition-all duration-500 ${
                                    config.size === 'xs' ? 'max-w-sm' :
                                    config.size === 'sm' ? 'max-w-lg' :
                                    config.size === 'md' ? 'max-w-2xl' : 'max-w-full'
                                  }`}
                               >
                                  <div className="rounded-xl overflow-hidden border border-border/20 bg-card shadow-sm">
                                     <img src={sub.image_url} alt={sub.image_alt || sub.title} className="w-full h-auto" />
                                  </div>
                               </motion.figure>
                             </div>
                           );
                         })()}
  
                         {sub.code_content && (() => {
                            const hasTabs = sub.code_content.includes('---TAB:');
                            if (hasTabs) {
                              const tabParts = sub.code_content.split('---TAB:').filter(Boolean);
                              const tabs = tabParts.map((p: string) => {
                                const name = p.split('\n')[0].trim();
                                const content = p.split('\n').slice(1).join('\n').trim();
                                return { name, content };
                              });
                              return (
                                <div className="rounded-xl overflow-hidden border border-border/20 bg-[#030303]">
                                   <div className="flex border-b border-border/10 bg-muted/5">
                                      {tabs.map((t: { name: string; content: string }, ti: number) => (
                                        <div key={ti} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border-r border-border/10 ${ti === 0 ? "bg-primary/10 text-primary" : "text-muted-foreground/30"}`}>
                                           {t.name}
                                        </div>
                                      ))}
                                   </div>
                                   <div className="p-6 overflow-x-auto font-mono text-[13px] leading-relaxed text-blue-200/70">
                                      <pre><code>{tabs[0].content}</code></pre>
                                   </div>
                                </div>
                              );
                            }
                            return (
                               <div className="rounded-xl overflow-hidden border border-border/20 bg-[#030303] group/code">
                                  <div className="flex items-center justify-between px-6 py-3 border-b border-border/10 bg-muted/5">
                                     <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/20">
                                        {sub.code_language || "shell"}
                                     </span>
                                  </div>
                                  <div className="p-8 overflow-x-auto font-mono text-[13px] leading-relaxed text-blue-200/70">
                                     <pre><code>{sub.code_content}</code></pre>
                                  </div>
                               </div>
                            );
                         })()}
                       </div>
                     );
                   })}
                 </div>
               </motion.section>
             ))}
  
             {/* Pagination Navigation */}
             <nav className="pt-6 border-t border-border/10 grid sm:grid-cols-2 gap-4">
               {prevDoc ? (
                 <button
                   onClick={prevDoc.onNavigate}
                   className="group p-4 rounded-xl border border-border/40 bg-card/20 hover:border-primary/30 transition-all text-left"
                 >
                   <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 group-hover:text-primary transition-colors flex items-center gap-1.5 mb-1">
                     <ChevronLeft className="w-3 h-3" /> Précédent
                   </span>
                   <p className="text-sm font-black">{prevDoc.title}</p>
                 </button>
               ) : <div />}
               {nextDoc && (
                 <button
                   onClick={nextDoc.onNavigate}
                   className="group p-4 rounded-xl border border-border/40 bg-card/20 hover:border-primary/30 transition-all text-right flex flex-col items-end"
                 >
                   <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 group-hover:text-primary transition-colors flex items-center gap-1.5 mb-1">
                     Suivant <ChevronRight className="w-3 h-3" />
                   </span>
                   <p className="text-sm font-black">{nextDoc.title}</p>
                 </button>
               )}
             </nav>
           </main>
         </div>
  
         {/* Mobile TOC Button */}
         <button 
           onClick={() => setTocOpen(true)}
           className="lg:hidden fixed bottom-10 right-10 w-14 h-14 rounded-2xl bg-primary text-white shadow-2xl z-50 flex items-center justify-center border border-white/20 active:scale-95 transition-all"
         >
           <Menu className="w-6 h-6" />
         </button>
  
         <AnimatePresence>
           {tocOpen && (
             <>
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setTocOpen(false)} className="fixed inset-0 bg-background/90 backdrop-blur-xl z-[100]" />
               <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-card border-l border-border/50 z-[101] p-10 shadow-2xl overflow-y-auto no-scrollbar" >
                 <div className="flex justify-between items-center mb-10">
                   <h4 className="font-black uppercase tracking-[0.3em] text-[10px] text-primary">Sommaire</h4>
                   <button onClick={() => setTocOpen(false)} className="p-2 rounded-xl bg-muted/50"><X className="w-5 h-5" /></button>
                 </div>
                 <nav className="space-y-6">
                   {sections.map((section, idx) => (
                     <div key={section.id} className="space-y-3">
                       <button onClick={() => scrollTo(section.id)} className={`block text-left font-black text-xl tracking-tight ${activeId === section.id ? "text-primary" : "text-foreground"}`} >
                         <span className="text-primary/20 mr-2 tabular-nums">{(idx + 1).toString().padStart(2, '0')}</span> {section.title}
                       </button>
                     </div>
                   ))}
                 </nav>
               </motion.div>
             </>
           )}
         </AnimatePresence>
       </div>
  );
}
