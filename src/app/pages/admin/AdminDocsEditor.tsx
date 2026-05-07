import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { supabase } from "../../../lib/supabase";
import { Card, CardContent, CardHeader } from "../../components/Card";
import { Button } from "../../components/Button";
import { 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  ChevronRight,
  GripVertical, 
  Save, 
  Image as ImageIcon, 
  Video, 
  Code2, 
  Type, 
  Layout, 
  Eye, 
  XCircle,
  ArrowLeft,
  Settings2,
  Upload,
  Loader2,
  Play,
  Heading1,
  Heading2,
  AlignLeft,
  List,
  ListOrdered,
  Minus
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface Subsection {
  id: string;
  section_id: string;
  title: string;
  content: string;
  image_url: string;
  image_alt: string;
  image_caption: string;
  video_url: string;
  video_title: string;
  code_language: string;
  code_content: string;
  order_index: number;
  type?: "photo" | "video" | "title" | "subtitle" | "text" | "code" | "list" | "step_by_step" | "hr";
  isCollapsed?: boolean;
}

interface Section {
  id: string;
  page_id: string;
  title: string;
  order_index: number;
  subsections: Subsection[];
  hasChanges?: boolean;
  isCollapsed?: boolean;
}

export function AdminDocsEditor() {
  const { id: pageId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [pageInfo, setPageInfo] = useState<any>(null);
  const [reorderMode, setReorderMode] = useState<"buttons" | "dnd">("buttons");
  const [uploading, setUploading] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    if (!pageId) return;
    setLoading(true);

    const [pageRes, sectionsRes] = await Promise.all([
      supabase.from("docs_pages").select("*").eq("id", pageId).single(),
      supabase.from("docs_sections").select("*, docs_subsections(*)").eq("page_id", pageId).order("order_index")
    ]);

    if (pageRes.data) setPageInfo(pageRes.data);
    if (sectionsRes.data) {
      const formatted = sectionsRes.data.map((s: any) => ({
        ...s,
        subsections: (s.docs_subsections || []).sort((a: any, b: any) => a.order_index - b.order_index),
        isCollapsed: false
      }));
      setSections(formatted);
    }
    setLoading(false);
  }, [pageId]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // --- Handlers ---

  const addSection = async () => {
    if (!pageId) return;
    const newId = `sec-${Date.now()}`;
    const newSection: Section = {
      id: newId,
      page_id: pageId,
      title: "Nouvelle Section",
      order_index: sections.length,
      subsections: [],
      isCollapsed: false
    };
    
    const { error } = await supabase.from("docs_sections").insert({
      id: newId,
      page_id: pageId,
      title: "Nouvelle Section",
      order_index: sections.length
    });

    if (error) toast.error("Erreur création section");
    else setSections([...sections, newSection]);
  };

  const deleteSection = async (id: string) => {
    if (!confirm("Supprimer cette section ?")) return;
    const { error } = await supabase.from("docs_sections").delete().eq("id", id);
    if (!error) {
      setSections(sections.filter(s => s.id !== id));
      toast.success("Section supprimée");
    }
  };

  const addBlock = async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const newBlockId = `block-${Date.now()}`;
    const newBlock: Subsection = {
      id: newBlockId,
      section_id: sectionId,
      title: "",
      content: "",
      image_url: "",
      image_alt: "",
      image_caption: "",
      video_url: "",
      video_title: "",
      code_language: "javascript",
      code_content: "",
      order_index: section.subsections.length,
      type: "text"
    };

    const { error } = await supabase.from("docs_subsections").insert(newBlock);
    if (!error) {
      setSections(sections.map(s => s.id === sectionId ? { ...s, subsections: [...s.subsections, newBlock] } : s));
      toast.success("Bloc ajouté");
    }
  };

  const deleteBlock = async (id: string, sectionId: string) => {
    if (!confirm("Supprimer ce bloc ?")) return;
    const { error } = await supabase.from("docs_subsections").delete().eq("id", id);
    if (!error) {
      setSections(sections.map(s => s.id === sectionId ? { ...s, subsections: s.subsections.filter(b => b.id !== id) } : s));
      toast.success("Bloc supprimé");
    }
  };

  const updateSectionTitle = (id: string, title: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, title, hasChanges: true } : s));
  };

  const updateBlock = (sectionId: string, blockId: string, data: Partial<Subsection>) => {
    setSections(sections.map(s => s.id === sectionId ? {
      ...s,
      hasChanges: true,
      subsections: s.subsections.map(b => b.id === blockId ? { ...b, ...data } : b)
    } : s));
  };

  const toggleSection = (id: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, isCollapsed: !s.isCollapsed } : s));
  };

  const toggleBlock = (sectionId: string, blockId: string) => {
    setSections(sections.map(s => s.id === sectionId ? {
      ...s,
      subsections: s.subsections.map(b => b.id === blockId ? { ...b, isCollapsed: !b.isCollapsed } : b)
    } : s));
  };

  const setBlockType = (sectionId: string, blockId: string, type: Subsection["type"]) => {
    updateBlock(sectionId, blockId, { type });
  };

  const saveSection = async (section: Section) => {
    setSaving(true);
    const { id, title, subsections } = section;
    
    // Save section title
    const { error: sError } = await supabase.from("docs_sections").update({ title }).eq("id", id);
    
    // Delete blocks that are no longer in this section (moved or deleted)
    const { data: currentBlocks } = await supabase.from("docs_subsections").select("id").eq("section_id", id);
    const blockIdsToKeep = subsections.map(b => b.id);
    const blocksToDelete = currentBlocks?.filter(b => !blockIdsToKeep.includes(b.id)).map(b => b.id) || [];
    
    if (blocksToDelete.length > 0) {
      await supabase.from("docs_subsections").delete().in("id", blocksToDelete);
    }
    
    // Upsert all current subsections with the correct section_id and order_index
    const { error: bError } = await Promise.all(
      subsections.map((b, i) => supabase.from("docs_subsections").upsert({
        id: b.id,
        section_id: id,
        title: b.title || "",
        content: b.content || "",
        image_url: b.image_url,
        image_alt: b.image_alt,
        image_caption: b.image_caption,
        video_url: b.video_url,
        video_title: b.video_title,
        code_language: b.code_language,
        code_content: b.code_content,
        order_index: i,
        type: b.type
      }))
    ).then(res => ({ error: res.find(r => r.error)?.error }));

    if (sError || bError) {
      toast.error("Erreur lors de l'enregistrement");
    } else {
      setSections(sections.map(s => s.id === id ? { ...s, hasChanges: false } : s));
      toast.success("Section synchronisée !");
    }
    setSaving(false);
  };

  // --- Handlers Files ---
  const handleFileUpload = async (sectionId: string, blockId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `docs/${fileName}`;

    setUploading(blockId);
    const { error: uploadError } = await supabase.storage
      .from('docs_media')
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Erreur d'upload");
      setUploading(null);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('docs_media')
      .getPublicUrl(filePath);

    updateBlock(sectionId, blockId, { image_url: publicUrl });
    setUploading(null);
    toast.success("Média téléversé !");
  };

  const handleStepImageUpload = async (sectionId: string, blockId: string, stepIndex: number, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `docs/${fileName}`;

    setUploading(`${blockId}-${stepIndex}`);
    const { error: uploadError } = await supabase.storage
      .from('docs_media')
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Erreur d'upload");
      setUploading(null);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('docs_media')
      .getPublicUrl(filePath);

    // Update the specific step via updateBlock
    setSections(prev => {
      const section = prev.find(s => s.id === sectionId);
      if (!section) return prev;
      const block = section.subsections.find(b => b.id === blockId);
      if (!block) return prev;
      
      let steps: any[] = [];
      try { steps = JSON.parse(block.content || '[]'); } catch(e) {}
      if (!Array.isArray(steps)) steps = [];
      
      steps[stepIndex] = { ...steps[stepIndex], img: publicUrl };
      
      return prev.map(s => s.id === sectionId ? {
        ...s,
        hasChanges: true,
        subsections: s.subsections.map(b => b.id === blockId ? { ...b, content: JSON.stringify(steps) } : b)
      } : s);
    });
    setUploading(null);
  };


  // --- Reordering ---
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, type } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === "section") {
      const newSections = Array.from(sections);
      const [moved] = newSections.splice(source.index, 1);
      newSections.splice(destination.index, 0, moved);
      const updated = newSections.map((s, i) => ({ ...s, order_index: i }));
      setSections(updated);
      
      await Promise.all(updated.map(s => 
        supabase.from("docs_sections").update({ order_index: s.order_index }).eq("id", s.id)
      ));
    } else {
      const sourceSection = sections.find(s => s.id === source.droppableId);
      const destSection = sections.find(s => s.id === destination.droppableId);
      if (!sourceSection || !destSection) return;

      const sourceBlocks = Array.from(sourceSection.subsections);
      const [moved] = sourceBlocks.splice(source.index, 1);

      if (source.droppableId === destination.droppableId) {
        sourceBlocks.splice(destination.index, 0, moved);
        const updatedBlocks = sourceBlocks.map((b, i) => ({ ...b, order_index: i }));
        setSections(sections.map(s => s.id === sourceSection.id ? { ...s, subsections: updatedBlocks, hasChanges: true } : s));
      } else {
        const destBlocks = Array.from(destSection.subsections);
        destBlocks.splice(destination.index, 0, { ...moved, section_id: destination.droppableId });
        setSections(sections.map(s => {
          if (s.id === sourceSection.id) return { ...s, subsections: sourceBlocks.map((b, i) => ({ ...b, order_index: i })), hasChanges: true };
          if (s.id === destSection.id) return { ...s, subsections: destBlocks.map((b, i) => ({ ...b, order_index: i })), hasChanges: true };
          return s;
        }));
      }
    }
  };

  const moveItem = (type: 'section' | 'block', id: string, direction: 'up' | 'down', sectionId?: string) => {
    if (type === 'section') {
      const idx = sections.findIndex(s => s.id === id);
      if (direction === 'up' && idx === 0) return;
      if (direction === 'down' && idx === sections.length - 1) return;
      
      const newSections = Array.from(sections);
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      [newSections[idx], newSections[targetIdx]] = [newSections[targetIdx], newSections[idx]];
      
      const updated = newSections.map((s, i) => ({ ...s, order_index: i }));
      setSections(updated);
      updated.forEach(s => supabase.from("docs_sections").update({ order_index: s.order_index }).eq("id", s.id));
    } else if (sectionId) {
      const section = sections.find(s => s.id === sectionId);
      if (!section) return;
      const idx = section.subsections.findIndex(b => b.id === id);
      if (direction === 'up' && idx === 0) return;
      if (direction === 'down' && idx === section.subsections.length - 1) return;

      const newBlocks = Array.from(section.subsections);
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      [newBlocks[idx], newBlocks[targetIdx]] = [newBlocks[targetIdx], newBlocks[idx]];
      
      const updated = newBlocks.map((b, i) => ({ ...b, order_index: i }));
      setSections(sections.map(s => s.id === sectionId ? { ...s, subsections: updated, hasChanges: true } : s));
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-muted-foreground animate-pulse">Chargement de l'éditeur...</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 sticky top-4 z-50 bg-background/80 backdrop-blur-xl p-6 rounded-[2rem] border border-border/50 shadow-2xl">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/celestial-cms/docs")} className="p-3 rounded-2xl bg-muted/50 hover:bg-muted transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight">{pageInfo?.title || "Éditeur"}</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold opacity-50">{sections.length} sections au total</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-muted p-1 rounded-2xl border border-border/50">
            <button 
              onClick={() => setReorderMode("buttons")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${reorderMode === "buttons" ? "bg-background shadow-md text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Settings2 className="w-3.5 h-3.5" /> Boutons
            </button>
            <button 
              onClick={() => setReorderMode("dnd")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${reorderMode === "dnd" ? "bg-background shadow-md text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <GripVertical className="w-3.5 h-3.5" /> Drag & Drop
            </button>
          </div>
          <Button onClick={addSection} className="rounded-2xl shrink-0">
            <Plus className="w-4 h-4 mr-2" /> Section
          </Button>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-sections" type="section">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-12">
              {sections.map((section, sIdx) => (
                <Draggable key={section.id} draggableId={section.id} index={sIdx} isDragDisabled={reorderMode === "buttons"}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} className="group/section relative">
                      {/* Section Header */}
                      <div className="flex items-center gap-4 mb-6 group/h">
                        {reorderMode === "dnd" && (
                          <div {...provided.dragHandleProps} className="p-2 text-muted-foreground/30 hover:text-primary transition-colors cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-5 h-5" />
                          </div>
                        )}
                        {reorderMode === "buttons" && (
                          <div className="flex flex-col gap-1 items-center bg-muted/30 p-1 rounded-lg">
                            <button onClick={() => moveItem('section', section.id, 'up')} className="p-1 hover:bg-primary/10 hover:text-primary rounded text-muted-foreground disabled:opacity-30" disabled={sIdx === 0}><ChevronUp className="w-4 h-4" /></button>
                            <button onClick={() => moveItem('section', section.id, 'down')} className="p-1 hover:bg-primary/10 hover:text-primary rounded text-muted-foreground disabled:opacity-30" disabled={sIdx === sections.length - 1}><ChevronDown className="w-4 h-4" /></button>
                          </div>
                        )}
                        
                        <button 
                          onClick={() => toggleSection(section.id)}
                          className="p-1 px-3 py-2 rounded-xl bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all flex items-center gap-2 border border-border/50 shadow-sm"
                        >
                          {section.isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                            {section.subsections.length} blocs
                          </span>
                        </button>

                        <input 
                          value={section.title} 
                          onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                          className="text-3xl font-black bg-transparent border-none outline-none focus:text-primary transition-colors flex-1"
                          placeholder="Titre de la section..."
                        />

                        <div className="flex items-center gap-2">
                          <AnimatePresence>
                            {section.hasChanges && (
                              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                                <Button size="sm" onClick={() => saveSection(section)} className="rounded-xl shadow-lg shadow-primary/20" disabled={saving}>
                                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                  Sauver Section
                                </Button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <button onClick={() => deleteSection(section.id)} className="p-2.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover/h:opacity-100">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <AnimatePresence initial={false}>
                        {!section.isCollapsed && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <Droppable droppableId={section.id} type="block">
                              {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-8 ml-8 border-l-2 border-border/30 pl-10 group-hover/section:border-primary/20 transition-all">
                                  {section.subsections.map((block, bIdx) => (
                                    <Draggable key={block.id} draggableId={block.id} index={bIdx} isDragDisabled={reorderMode === "buttons"}>
                                      {(provided) => (
                                        <div ref={provided.innerRef} {...provided.draggableProps} className="group/block relative">
                                          <Card className="rounded-[2.5rem] border-border/60 hover:border-primary/20 hover:shadow-2xl transition-all overflow-hidden bg-card/50 backdrop-blur-sm">
                                            <div className="flex min-h-[140px]">
                                              {/* Sidebar du bloc */}
                                              <div className="w-14 flex-shrink-0 bg-muted/40 border-r border-border/50 flex flex-col items-center py-6 gap-6">
                                                {reorderMode === "dnd" ? (
                                                  <div {...provided.dragHandleProps} className="p-2 text-muted-foreground/30 hover:text-primary transition-colors cursor-grab active:cursor-grabbing">
                                                    <GripVertical className="w-5 h-5" />
                                                  </div>
                                                ) : (
                                                  <div className="flex flex-col gap-2 bg-background/50 p-1 rounded-xl border border-border/50">
                                                    <button onClick={() => moveItem('block', block.id, 'up', section.id)} className="p-1 hover:bg-primary/10 hover:text-primary rounded-lg text-muted-foreground disabled:opacity-20" disabled={bIdx === 0}><ChevronUp className="w-4 h-4" /></button>
                                                    <button onClick={() => moveItem('block', block.id, 'down', section.id)} className="p-1 hover:bg-primary/10 hover:text-primary rounded-lg text-muted-foreground disabled:opacity-20" disabled={bIdx === section.subsections.length - 1}><ChevronDown className="w-4 h-4" /></button>
                                                  </div>
                                                )}
                                                <button onClick={() => deleteBlock(block.id, section.id)} className="p-3 text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all">
                                                  <Trash2 className="w-5 h-5" />
                                                </button>
                                              </div>

                                              {/* Contenu du bloc */}
                                              <div className="flex-1 p-8 space-y-8">
                                                {/* Selecteur de type et bouton collapse */}
                                                <div className="flex items-center justify-between gap-4">
                                                  <div className="flex flex-wrap gap-2 p-1.5 bg-muted/50 rounded-2xl w-fit border border-border/50">
                                                   {[
                                                      { id: 'title', icon: <Heading1 className="w-4 h-4" />, label: 'Titre' },
                                                      { id: 'subtitle', icon: <Heading2 className="w-4 h-4" />, label: 'Sous-titre' },
                                                      { id: 'text', icon: <AlignLeft className="w-4 h-4" />, label: 'Texte' },
                                                      { id: 'list', icon: <List className="w-4 h-4" />, label: 'Liste' },
                                                      { id: 'step_by_step', icon: <ListOrdered className="w-4 h-4" />, label: 'Étapes' },
                                                      { id: 'hr', icon: <Minus className="w-4 h-4" />, label: 'Ligne' },
                                                      { id: 'photo', icon: <ImageIcon className="w-4 h-4" />, label: 'Photo' },
                                                      { id: 'video', icon: <Video className="w-4 h-4" />, label: 'Vidéo' },
                                                      { id: 'code', icon: <Code2 className="w-4 h-4" />, label: 'Code' },
                                                   ].map(t => (
                                                      <button 
                                                         key={t.id}
                                                         onClick={() => setBlockType(section.id, block.id, t.id as any)}
                                                         className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${block.type === t.id ? 'bg-background shadow-md text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                                      >
                                                         {t.icon} <span className="hidden sm:inline">{t.label}</span>
                                                      </button>
                                                   ))}
                                                </div>
                                                <button 
                                                    onClick={() => toggleBlock(section.id, block.id)}
                                                    className="p-2 px-4 rounded-xl bg-muted/30 hover:bg-primary/10 hover:text-primary transition-all flex items-center gap-2 border border-border/50 shrink-0"
                                                  >
                                                    {block.isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                                      {block.isCollapsed ? 'Déplier' : 'Réduire'}
                                                    </span>
                                                  </button>
                                                </div>

                                                {!block.isCollapsed && (
                                                  <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                                   {/* Champs communs ou spécifiques */}
                                                   {(block.type === 'title' || block.type === 'subtitle' || !block.type || block.type === 'text') && (
                                                      <input 
                                                         value={block.title} 
                                                         onChange={(e) => updateBlock(section.id, block.id, { title: e.target.value })}
                                                         className="text-xl font-bold bg-transparent border-none outline-none focus:text-primary w-full"
                                                         placeholder={block.type === 'title' ? "Entrez votre titre..." : "Titre optionnel..."}
                                                      />
                                                   )}

                                                   {(block.type === 'subtitle' || block.type === 'text' || !block.type) && (
                                                      <textarea 
                                                         value={block.content} 
                                                         onChange={(e) => updateBlock(section.id, block.id, { content: e.target.value })}
                                                         className="w-full bg-transparent border-none outline-none focus:text-foreground text-muted-foreground leading-relaxed resize-none"
                                                         placeholder="Écrivez ici le contenu de votre bloc..."
                                                         rows={block.type === 'subtitle' ? 2 : 4}
                                                      />
                                                   )}

                                                   
                                                   {block.type === 'list' && (
                                                      <div className="space-y-3">
                                                         <input
                                                            value={block.title}
                                                            onChange={(e) => updateBlock(section.id, block.id, { title: e.target.value })}
                                                            className="text-base font-bold bg-transparent border-none outline-none focus:text-primary w-full"
                                                            placeholder="Titre de la liste (optionnel)..."
                                                         />
                                                         <div className="rounded-xl bg-muted/30 border border-border/40 p-4">
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 mb-2">Une entree par ligne (ex: - Element)</p>
                                                            <textarea
                                                               value={block.content}
                                                               onChange={(e) => updateBlock(section.id, block.id, { content: e.target.value })}
                                                               className="w-full bg-transparent border-none outline-none text-muted-foreground leading-relaxed resize-none font-mono text-sm"
                                                               placeholder="- Premier element"
                                                               rows={6}
                                                            />
                                                         </div>
                                                         {block.content && (
                                                            <div className="rounded-xl bg-card border border-border/30 p-4">
                                                               <p className="text-[9px] font-black uppercase tracking-widest text-primary/60 mb-3">Apercu</p>
                                                               <ul className="space-y-1.5">
                                                                  {block.content.split('\n').filter((l: string) => l.trim()).map((line: string, i: number) => (
                                                                     <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                                                                        {line.replace(/^[-*\u2022]\s*/, '')}
                                                                     </li>
                                                                  ))}
                                                               </ul>
                                                            </div>
                                                         )}
                                                      </div>
                                                   )}


                                                   {block.type === 'step_by_step' && (() => {
                                                      let steps: any[] = [];
                                                      try { steps = JSON.parse(block.content || '[]'); } catch(e) {}
                                                      if (!Array.isArray(steps)) steps = [];
                                                      
                                                      const updateStep = (idx: number, updates: any) => {
                                                         const newSteps = [...steps];
                                                         newSteps[idx] = { ...newSteps[idx], ...updates };
                                                         updateBlock(section.id, block.id, { content: JSON.stringify(newSteps) });
                                                      };
                                                      
                                                      const addStep = () => {
                                                         const newSteps = [...steps, { title: '', desc: '', img: '' }];
                                                         updateBlock(section.id, block.id, { content: JSON.stringify(newSteps) });
                                                      };
                                                      
                                                      const removeStep = (idx: number) => {
                                                         const newSteps = steps.filter((_, i) => i !== idx);
                                                         updateBlock(section.id, block.id, { content: JSON.stringify(newSteps) });
                                                      };
                                                      
                                                      return (
                                                         <div className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                               <input 
                                                                  value={block.title} 
                                                                  onChange={(e) => updateBlock(section.id, block.id, { title: e.target.value })}
                                                                  className="text-lg font-bold bg-transparent border-none outline-none focus:text-primary"
                                                                  placeholder="Titre global des étapes (optionnel)..."
                                                               />
                                                               <Button size="sm" variant="outline" onClick={addStep} className="gap-2">
                                                                  <Plus className="w-4 h-4" /> Ajouter une étape
                                                               </Button>
                                                            </div>
                                                            
                                                            <div className="space-y-4">
                                                               {steps.map((step, idx) => (
                                                                  <div key={idx} className="p-4 rounded-xl border border-border/50 bg-muted/20 relative group/step">
                                                                     <div className="absolute top-2 right-2 opacity-0 group-hover/step:opacity-100 transition-opacity">
                                                                        <button onClick={() => removeStep(idx)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                                                                           <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                     </div>
                                                                     
                                                                     <div className="flex gap-4 items-start">
                                                                        <div className="w-8 h-8 shrink-0 rounded-full bg-primary/20 text-primary font-black flex items-center justify-center">
                                                                           {idx + 1}
                                                                        </div>
                                                                        
                                                                        <div className="flex-1 space-y-3">
                                                                           <input 
                                                                              value={step.title || ''} 
                                                                              onChange={(e) => updateStep(idx, { title: e.target.value })}
                                                                              className="text-base font-bold bg-transparent border-none outline-none focus:text-primary w-full"
                                                                              placeholder={`Titre de l'étape ${idx + 1}...`}
                                                                           />
                                                                           <textarea 
                                                                              value={step.desc || ''} 
                                                                              onChange={(e) => updateStep(idx, { desc: e.target.value })}
                                                                              className="w-full text-sm bg-transparent border-none outline-none focus:text-foreground text-muted-foreground leading-relaxed resize-none"
                                                                              placeholder="Description de l'étape..."
                                                                              rows={2}
                                                                           />
                                                                        </div>
                                                                        
                                                                        <div className="w-32 h-24 shrink-0 rounded-lg bg-muted border border-dashed border-border flex flex-col items-center justify-center gap-2 group/drop relative overflow-hidden">
                                                                           {step.img ? (
                                                                              <>
                                                                                 <img src={step.img} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                                                                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/drop:opacity-100 transition-opacity flex items-center justify-center">
                                                                                    <Upload className="w-5 h-5 text-white" />
                                                                                 </div>
                                                                              </>
                                                                           ) : (
                                                                              <>
                                                                                 <ImageIcon className="w-5 h-5 text-muted-foreground/30" />
                                                                                 <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground/50">Photo</span>
                                                                              </>
                                                                           )}
                                                                           <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files?.[0] && handleStepImageUpload(section.id, block.id, idx, e.target.files[0])} />
                                                                           {uploading === `${block.id}-${idx}` && <div className="absolute inset-0 bg-background/80 flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin" /></div>}
                                                                        </div>
                                                                     </div>
                                                                  </div>
                                                               ))}
                                                               {steps.length === 0 && (
                                                                  <div className="text-center p-8 border-2 border-dashed border-border rounded-xl text-muted-foreground">
                                                                     Aucune étape pour le moment.
                                                                  </div>
                                                               )}
                                                            </div>
                                                         </div>
                                                      );
                                                   })()}

                                                   {block.type === 'photo' && (
                                                      <div className="grid md:grid-cols-[200px_1fr] gap-8">
                                                         <div className="aspect-square rounded-3xl bg-muted border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 group/drop relative overflow-hidden">
                                                            {block.image_url ? (
                                                               <>
                                                                  <img src={block.image_url} alt="Preview" className="absolute inset-0 w-full h-full object-cover transition-transform group-hover/drop:scale-110" />
                                                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/drop:opacity-100 transition-opacity flex items-center justify-center">
                                                                     <Upload className="w-8 h-8 text-white" />
                                                                  </div>
                                                               </>
                                                            ) : (
                                                               <>
                                                                  <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                                                                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Logo / Photo</p>
                                                               </>
                                                            )}
                                                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files?.[0] && handleFileUpload(section.id, block.id, e.target.files[0])} />
                                                            {uploading === block.id && <div className="absolute inset-0 bg-background/80 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>}
                                                         </div>
                                                         <div className="space-y-4">
                                                            <input value={block.image_url} onChange={(e) => updateBlock(section.id, block.id, { image_url: e.target.value })} className="w-full bg-muted/50 px-4 py-2 rounded-xl text-sm border-none outline-none" placeholder="URL de l'image" />
                                                            <input value={block.image_alt} onChange={(e) => updateBlock(section.id, block.id, { image_alt: e.target.value })} className="w-full bg-muted/50 px-4 py-2 rounded-xl text-sm border-none outline-none" placeholder="Texte alternatif (SEO)" />
                                                            <input value={block.image_caption} onChange={(e) => updateBlock(section.id, block.id, { image_caption: e.target.value })} className="w-full bg-muted/50 px-4 py-2 rounded-xl text-sm border-none outline-none" placeholder="Légende discrète" />
                                                         </div>
                                                      </div>
                                                   )}

                                                   {block.type === 'video' && (
                                                      <div className="space-y-4">
                                                         <div className="flex items-center gap-4">
                                                            <div className="p-3 rounded-2xl bg-red-500/10 text-red-500"><Play className="w-6 h-6" /></div>
                                                            <input value={block.video_url} onChange={(e) => updateBlock(section.id, block.id, { video_url: e.target.value })} className="flex-1 bg-muted/50 px-6 py-3 rounded-2xl text-sm font-bold border-none outline-none focus:bg-muted" placeholder="Lien vers la vidéo (MP4 ou YouTube Embed)" />
                                                         </div>
                                                         <input value={block.video_title} onChange={(e) => updateBlock(section.id, block.id, { video_title: e.target.value })} className="w-full bg-muted/30 px-6 py-2 rounded-xl text-xs border-none outline-none" placeholder="Titre de la vidéo" />
                                                      </div>
                                                   )}

                                                   {block.type === 'code' && (
                                                      <div className="rounded-2xl overflow-hidden border border-border/50 bg-[#0d0f14] shadow-2xl">
                                                         <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-white/5">
                                                            <select value={block.code_language} onChange={(e) => updateBlock(section.id, block.id, { code_language: e.target.value })} className="bg-transparent text-[10px] font-black uppercase tracking-widest text-white/50 outline-none border-none">
                                                               <option value="javascript">JavaScript</option>
                                                               <option value="typescript">TypeScript</option>
                                                               <option value="python">Python</option>
                                                               <option value="bash">Terminal / Bash</option>
                                                               <option value="sql">SQL</option>
                                                               <option value="html">HTML</option>
                                                               <option value="css">CSS</option>
                                                            </select>
                                                            <Code2 className="w-4 h-4 text-white/20" />
                                                         </div>
                                                         <textarea 
                                                            value={block.code_content} 
                                                            onChange={(e) => updateBlock(section.id, block.id, { code_content: e.target.value })}
                                                            className="w-full bg-transparent border-none outline-none text-blue-100 p-6 font-mono text-xs leading-relaxed min-h-[150px] resize-none"
                                                            placeholder="Collez votre code ici..."
                                                         />
                                                      </div>
                                                   )}

                                                   {block.type === 'hr' && (
                                                      <div className="py-8 flex items-center justify-center">
                                                        <div className="w-full h-[2px] bg-[#000000] relative">
                                                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">Séparateur</div>
                                                        </div>
                                                      </div>
                                                   )}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </Card>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                  
                                  <button 
                                    onClick={() => addBlock(section.id)}
                                    className="w-full py-4 rounded-[2rem] border-2 border-dashed border-border/40 text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all font-bold text-sm tracking-tight"
                                  >
                                    <Plus className="w-4 h-4 inline-block mr-2" /> Ajouter un bloc à cette section
                                  </button>
                                </div>
                              )}
                            </Droppable>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="mt-20 flex justify-center pb-20">
         <button 
            onClick={addSection}
            className="group flex items-center gap-4 px-10 py-5 rounded-[2.5rem] bg-foreground text-background font-black text-xl hover:scale-105 transition-transform shadow-2xl active:scale-95"
         >
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" /> Nouvelles Section
         </button>
      </div>
    </div>
  );
}


