import { Card, CardHeader } from "../components/Card";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Layers,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export function Realisations() {
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: projectsData } = await supabase.from("portfolio_projects").select("*").order("order_index", { ascending: true });
      setProjects(projectsData || []);
      setCategories([]); // On retire les catégories distantes qui n'existent pas
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="relative border-b border-border/40 overflow-hidden bg-background">
        <div className="absolute inset-0 bg-linear-to-tr from-primary/5 via-transparent to-secondary/5" />
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
              <Layers className="w-3 h-3" />
              Portfolio
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tighter">
              Nos <span className="text-primary italic">Réalisations</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
              Découvrez les projets qui définissent notre expertise et notre engagement envers l'excellence.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center gap-4">
             <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
             <p className="text-muted-foreground font-medium italic">Chargement de nos succès...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} categories={categories} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project, categories, index }: { project: any; categories: any[], index: number }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = (project.image_urls && project.image_urls.length > 0) ? project.image_urls : (project.image_url ? [project.image_url] : []);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: (index % 2) * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Card hover className="h-full border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden flex flex-col">
        {images.length > 0 ? (
          <div className="relative aspect-video overflow-hidden group/carousel bg-muted/20">
            <img
              src={images[currentImageIndex]}
              alt={project.project_name}
              className="w-full h-full object-contain transition-all duration-500"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {images.length > 1 && (
              <>
                <button 
                  onClick={prevImage} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-2 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-all z-20 border border-white/20"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={nextImage} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-2 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-all z-20 border border-white/20"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {images.map((_: string, i: number) => (
                    <div 
                      key={i} 
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'bg-white w-4' : 'bg-white/40'}`} 
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="relative aspect-video bg-muted/30 border-b border-border/20 flex flex-col items-center justify-center p-12 overflow-hidden group/fallback">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-secondary/5" />
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-20 h-20 text-primary/30 group-hover/fallback:text-primary/50 transition-colors duration-500" />
            </motion.div>
            <div className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">Visual pending</div>
          </div>
        )}
        
        <CardHeader className="flex-1 p-8">
          <div className="flex items-start justify-between gap-6 mb-6">
            <div className="flex-1">
              <h3 className="text-3xl font-black tracking-tighter mb-2 group-hover:text-primary transition-colors duration-300">
                {project.project_name}
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-6 h-px bg-primary/40" />
                <p className="text-sm font-bold text-primary/80 tracking-wide uppercase">{project.client_name}</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-muted border border-border/50 group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <ExternalLink className="w-5 h-5" />
            </div>
          </div>
          
          <p className="text-muted-foreground line-clamp-3 leading-relaxed font-medium mb-8">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2 mt-auto">
            {(project.tags || []).map((tech: string) => {
              const cat = categories.find((c: any) => c.name === tech);
              return (
                <span
                  key={tech}
                  className="px-4 py-1.5 bg-muted/80 backdrop-blur-sm border border-border/40 rounded-lg text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:border-primary/30 hover:text-primary transition-all cursor-default"
                >
                  {cat ? cat.label : tech}
                </span>
              );
            })}
          </div>
        </CardHeader>
      </Card>
    </motion.div>
  );
}
