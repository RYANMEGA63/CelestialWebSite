import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Database } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

function EyebrowLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-body text-[11px] tracking-[0.2em] uppercase text-secondary font-medium mb-5">{children}</p>;
}

export function Realisations() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("portfolio_projects").select("*")
      .order("order_index", { ascending: true })
      .then(({ data }) => { setProjects(data || []); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Page header */}
      <div className="relative border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-16 py-20 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <EyebrowLabel>Portfolio</EyebrowLabel>
            <h1 className="text-foreground mb-5">
              Nos <span className="text-secondary">Réalisations.</span>
            </h1>
            <p className="font-body text-lg text-muted-foreground font-light leading-relaxed max-w-xl">
              Découvrez les projets qui définissent notre expertise et notre engagement envers l'excellence.
            </p>
          </motion.div>

          {/* Marquee ticker */}
          {!loading && projects.length > 0 && (
            <div className="mt-10 overflow-hidden border-t border-border pt-5">
              <div className="flex animate-marquee whitespace-nowrap gap-8" style={{ width: "max-content" }}>
                {[...projects, ...projects].map((p, i) => (
                  <span key={i} className="flex items-center gap-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body">
                    <span className="w-1 h-1 rounded-full bg-secondary inline-block" />
                    {p.project_name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-[1600px] px-6 lg:px-16 py-14">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="border border-border">
                <div className={`skeleton ${i % 3 === 0 ? "aspect-[4/3]" : "aspect-video"} w-full`} />
                <div className="p-5 space-y-3">
                  <div className="skeleton h-5 w-3/4 rounded" />
                  <div className="skeleton h-4 w-1/2 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project, index }: { project: any; index: number }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = project.image_urls?.length > 0 ? project.image_urls : project.image_url ? [project.image_url] : [];
  // Alternate aspect ratio for visual variety
  const isTall = index % 4 === 2;

  const nextImage = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setCurrentImageIndex((p) => (p + 1) % images.length); };
  const prevImage = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setCurrentImageIndex((p) => (p - 1 + images.length) % images.length); };

  const tagBgShades = ["bg-secondary/5 text-secondary border-secondary/20", "bg-secondary/10 text-secondary border-secondary/30", "bg-secondary/15 text-secondary border-secondary/40"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: (index % 3) * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="group border border-border bg-card flex flex-col hover-glow transition-all duration-300">

      {/* Image area */}
      {images.length > 0 ? (
        <div className={`relative overflow-hidden group/img bg-muted ${isTall ? "aspect-[4/3]" : "aspect-video"}`}>
          <img src={images[currentImageIndex]} alt={project.project_name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover/img:scale-105" />
          {/* Blue overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-secondary/20 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-400" />
          {images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/90 text-foreground p-1.5 opacity-0 group-hover/img:opacity-100 transition-all border border-border">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/90 text-foreground p-1.5 opacity-0 group-hover/img:opacity-100 transition-all border border-border">
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_: string, i: number) => (
                  <div key={i} className={`w-1.5 h-1.5 transition-all duration-300 ${i === currentImageIndex ? "bg-white" : "bg-white/40"}`} />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        // Improved empty state — blueprint style
        <div className={`relative overflow-hidden bg-muted border-b border-border flex flex-col items-center justify-center ${isTall ? "aspect-[4/3]" : "aspect-video"}`}
          style={{ backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
            <Database className="w-12 h-12 text-secondary/30" strokeWidth={1} />
          </motion.div>
          <div className="mt-3 text-[9px] font-mono tracking-[0.2em] uppercase text-muted-foreground/40">Visuel en préparation</div>
        </div>
      )}

      {/* Card body */}
      <div className="flex-1 p-6 flex flex-col">
        <div className="flex flex-col gap-1.5 mb-4">
          <h3 className="text-lg font-semibold tracking-tight group-hover:text-secondary transition-colors duration-300"
            style={{ fontFamily: "var(--font-display)" }}>
            {project.project_name}
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-4 h-px bg-secondary/40" />
            <p className="font-body text-[9px] text-secondary tracking-[0.1em] uppercase">{project.client_name}</p>
          </div>
        </div>
        <p className="font-body text-sm text-muted-foreground line-clamp-3 leading-relaxed font-light mb-5 flex-1">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {(project.tags || []).map((tech: string, ti: number) => (
            <span key={tech}
              className={`px-2 py-0.5 text-[9px] font-body uppercase tracking-[0.1em] border ${tagBgShades[ti % tagBgShades.length]}`}>
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
