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
      <div className="relative border-b border-border/50 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-16 py-24 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p className="font-body text-[10px] tracking-[0.25em] uppercase text-secondary font-medium mb-6">
              Portfolio
            </p>
            <h1 className="text-foreground mb-6">
              Nos <em className="text-secondary">Réalisations.</em>
            </h1>
            <p className="font-body text-lg text-muted-foreground font-light leading-relaxed max-w-xl">
              Découvrez les projets qui définissent notre expertise et notre engagement envers l'excellence.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-6 lg:px-16 py-16">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center gap-4">
             <div className="w-8 h-8 border-2 border-secondary border-t-transparent animate-spin" />
             <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-medium">Chargement des données...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
      <Card className="h-full border-border/50 bg-card flex flex-col rounded-sm">
        {images.length > 0 ? (
          <div className="relative aspect-video overflow-hidden group/carousel bg-muted">
            <img
              src={images[currentImageIndex]}
              alt={project.project_name}
              className="w-full h-full object-contain transition-all duration-500"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {images.length > 1 && (
              <>
                <button 
                  onClick={prevImage} 
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/90 text-foreground p-1.5 opacity-0 group-hover/carousel:opacity-100 transition-all z-20 border border-border"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={nextImage} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/90 text-foreground p-1.5 opacity-0 group-hover/carousel:opacity-100 transition-all z-20 border border-border"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {images.map((_: string, i: number) => (
                    <div 
                      key={i} 
                      className={`w-1.5 h-1.5 transition-all duration-300 ${i === currentImageIndex ? 'bg-white' : 'bg-white/40'}`} 
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="relative aspect-video bg-muted border-b border-border flex flex-col items-center justify-center p-8 overflow-hidden group/fallback">
            <div className="absolute inset-0 bg-muted" />
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
        
        <CardHeader className="flex-1 p-6">
          <div className="flex flex-col gap-2 mb-4">
            <h3 className="text-xl font-display font-medium tracking-tight group-hover:text-secondary transition-colors duration-300">
              {project.project_name}
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-4 h-px bg-secondary/40" />
              <p className="font-body text-[9px] text-secondary tracking-[0.1em] uppercase">{project.client_name}</p>
            </div>
          </div>
          
          <p className="font-body text-sm text-muted-foreground line-clamp-3 leading-relaxed font-light mb-6">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2 mt-auto">
            {(project.tags || []).map((tech: string) => {
              const cat = categories.find((c: any) => c.name === tech);
              return (
                <span
                  key={tech}
                  className="px-2 py-1 bg-muted border border-border/40 text-[9px] font-body uppercase tracking-[0.1em] text-muted-foreground"
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
