import { Card, CardHeader } from "../components/Card";
import { motion } from "framer-motion";
import { 
  History, 
  Target, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Rocket,
  Globe2,
  Cpu,
  Award,
  Users,
  Zap,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "../components/Button";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";

const IconMapping: Record<string, any> = {
  Rocket,
  Globe2,
  Cpu,
  Award,
  Sparkles,
  Target,
  ShieldCheck,
  Users,
  Zap,
  Layers,
};

export function APropos() {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchMilestones() {
      const { data } = await supabase.from("company_milestones").select("*").order("order_index");
      setMilestones(data || []);
      setLoading(false);
    }
    fetchMilestones();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (timelineRef.current) {
      const scrollAmount = 400;
      timelineRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const values = [
    {
      icon: Target,
      title: "Précision Chirurgicale",
      description: "Chaque ligne de code est pesée, optimisée et justifiée pour offrir une performance sans compromis.",
    },
    {
      icon: ShieldCheck,
      title: "Intégrité Totale",
      description: "Votre confiance est notre capital le plus précieux. Nous bâtissons des forteresses numériques.",
    },
    {
      icon: Sparkles,
      title: "Innovation de Rupture",
      description: "Nous ne suivons pas les tendances, nous créons les standards de demain pour votre industrie.",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Hero Section */}
      <div className="relative border-b border-border/40 overflow-hidden bg-background">
        <div className="absolute inset-0 bg-linear-to-bl from-primary/5 via-transparent to-secondary/5" />
        <div className="mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-8">
              L'Héritage Celestial
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8 tracking-tighter">
              Bâtir le futur de <br /> <span className="text-primary italic">l'intelligence logicielle.</span>
            </h1>
            <p className="text-xl text-muted-foreground/80 max-w-2xl mx-auto font-medium leading-relaxed">
              Depuis 2010, nous accompagnons les visionnaires dans la création de systèmes complexes qui redéfinissent la productivité mondiale.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center mb-20 lg:mb-40">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-black mb-8 tracking-tight flex items-center gap-4">
              <History className="w-8 h-8 text-primary" />
              Notre Histoire
            </h2>
            <div className="space-y-6 text-lg text-muted-foreground font-medium leading-relaxed">
              <p>
                <span className="text-foreground font-bold italic">Celestial</span> est né d'une volonté simple : libérer l'homme des contraintes techniques par l'élégance algorithmique. Ce qui a commencé comme un laboratoire de R&D est aujourd'hui une référence en ingénierie SaaS de haute précision.
              </p>
              <p>
                Nous ne vendons pas seulement du logiciel. Nous installons des moteurs de croissance durables au cœur de votre organisation, basés sur une documentation ultra-transparente et une architecture sans faille.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mt-12 pt-12 border-t border-border/20">
              <div>
                <div className="text-4xl font-black tracking-tighter text-primary">15+</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mt-1">Années de R&D</div>
              </div>
              <div>
                <div className="text-4xl font-black tracking-tighter text-primary">200+</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mt-1">Vies Impactées</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <Card className="aspect-square bg-muted/30 border-border/40 p-1">
              <div className="w-full h-full bg-background rounded-2xl overflow-hidden flex items-center justify-center relative">
                <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent" />
                <Rocket className="w-32 h-32 text-primary opacity-20" />
                <div className="absolute bottom-10 left-10 right-10 flex flex-col items-center">
                  <div className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/30 mb-2">Established 2010</div>
                  <div className="h-px w-20 bg-primary/20" />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Horizontal Timeline Section */}
        <div className="mb-20 lg:mb-40 py-12 lg:py-24 relative">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent -translate-y-1/2" />
          
          <div className="flex justify-between items-end mb-12 relative z-20">
             <div className="flex-1" />
             <div className="flex gap-4">
                <button 
                  onClick={() => scroll('left')}
                  className="p-4 rounded-full bg-background border border-border/40 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all shadow-lg"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => scroll('right')}
                  className="p-4 rounded-full bg-background border border-border/40 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all shadow-lg"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
             </div>
          </div>

          <motion.div 
            ref={timelineRef}
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex gap-12 overflow-x-auto pb-16 pt-8 px-4 snap-x hide-scrollbar"
            style={{ scrollbarWidth: 'none' }}
          >
            {loading ? (
               Array.from({ length: 5 }).map((_, i) => (
                 <div key={i} className="flex-shrink-0 w-80 animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-8" />
                    <div className="h-4 w-12 bg-muted mx-auto mb-4" />
                    <div className="h-6 w-32 bg-muted mx-auto mb-4" />
                    <div className="h-3 w-48 bg-muted mx-auto" />
                 </div>
               ))
            ) : (
               milestones.map((milestone, idx) => {
                 const Icon = IconMapping[milestone.icon] || Rocket;
                 return (
                   <motion.div
                     key={milestone.id}
                     className="flex-shrink-0 w-80 snap-center group px-4"
                     whileHover={{ y: -8 }}
                   >
                     <div className="relative mb-8 flex justify-center">
                       <div className="w-14 h-14 rounded-2xl bg-background border border-primary/20 flex items-center justify-center relative z-10 group-hover:border-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-xl shadow-primary/5">
                         <Icon className="w-6 h-6" />
                       </div>
                       <div className="absolute top-1/2 left-0 right-0 h-px bg-primary/10 -translate-y-1/2 group-hover:bg-primary/30 transition-colors" />
                     </div>
                     <div className="text-center">
                       <span className="text-4xl font-black tracking-tighter text-primary/10 group-hover:text-primary transition-colors duration-500">{milestone.year}</span>
                       <h3 className="text-xl font-black mb-3 tracking-tight mt-2">{milestone.event}</h3>
                       <p className="text-sm text-muted-foreground/60 font-medium leading-relaxed italic">{milestone.description}</p>
                     </div>
                   </motion.div>
                 );
               })
            )}
          </motion.div>
        </div>

        {/* Values Section */}
        <div className="mb-20 lg:mb-40">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-black tracking-tighter mb-4">L'ADN Celestial</h2>
            <p className="text-muted-foreground font-medium">Les piliers sur lesquels reposent chaque décision technique.</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover className="h-full border-border/30 bg-card/40 backdrop-blur-sm p-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                    <value.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight mb-4">{value.title}</h3>
                  <p className="text-muted-foreground font-medium leading-relaxed">{value.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <Card className="bg-primary/5 border-primary/20 p-8 sm:p-12 lg:p-20 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-tr from-primary/10 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-8 tracking-tighter">Devenez le prochain succès Celestial.</h2>
              <p className="text-lg text-muted-foreground/80 mb-12 max-w-2xl mx-auto font-medium">
                Que vous soyez une startup audacieuse ou un groupe industriel établi, nous avons la clé de votre performance numérique.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                <Button href="/contact" size="lg" className="px-8 sm:px-12 py-5 sm:py-6 text-sm sm:text-base font-black uppercase tracking-widest">
                  Parlez à un jour
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
