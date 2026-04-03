import { Button } from "../components/Button";
import { Card, CardHeader, CardContent } from "../components/Card";
import { motion } from "framer-motion";
import {
  Code2,
  Zap,
  Shield,
  BookOpen,
  Sparkles,
  ChevronRight,
  Check,
  TrendingUp,
  Users,
  Award,
  ArrowRight,
  Terminal,
  Globe,
  Cpu,
} from "lucide-react";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { format } from "date-fns";

export function Home() {
  return (
    <div className="relative">
      <HomeContent />
    </div>
  );
}

function TechAnimation() {
  const terminalLines = [
    "INIT LOGICIEL CELESTIAL...",
    "SCAN DES SYSTÈMES : OK",
    "CLIENTS RAPPORTÉS : +243%",
    "CHIFFRE D'AFFAIRES : +150%",
    "EFFICACITÉ MAXIMALE DÉTECTÉE."
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Background Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 1000 - 500, 
            y: Math.random() * 800 - 400,
            opacity: 0 
          }}
          animate={{ 
            y: [null, Math.random() * 200 - 100, null],
            opacity: [0.05, 0.15, 0.05],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 7 + Math.random() * 5, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="absolute w-2 h-2 rounded-full bg-primary/30 blur-[2px]"
        />
      ))}

      {/* Floating Terminal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, x: 100, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: [100, 80, 100] }}
        transition={{ 
          opacity: { duration: 1.5 },
          scale: { duration: 1.5 },
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute right-[10%] bottom-[20%] w-72 h-48 bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl hidden lg:block overflow-hidden"
      >
        <div className="h-6 bg-muted/50 border-b border-border/30 flex items-center px-3 gap-1.5 leading-none">
          <div className="w-2 h-2 rounded-full bg-red-500/20" />
          <div className="w-2 h-2 rounded-full bg-amber-500/20" />
          <div className="w-2 h-2 rounded-full bg-emerald-500/20" />
          <span className="text-[8px] font-black tracking-widest text-muted-foreground/30 ml-auto">RUNTIME.SYS</span>
        </div>
        <div className="p-4 space-y-2 font-mono text-[9px]">
          {terminalLines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + i * 0.4, duration: 0.5 }}
              className={`flex items-center gap-2 ${i > 1 && i < 4 ? "text-primary font-bold" : "text-muted-foreground/60"}`}
            >
              <span className="opacity-30 tracking-tighter">[{i + 1}]</span>
              <span className={i === terminalLines.length - 1 ? "animate-pulse" : ""}>{line}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
         <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
           <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
         </pattern>
         <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}

function HomeContent() {
  const features = [
    {
      icon: Code2,
      title: "Applications Sur-Mesure",
      description: "Nous forgeons des logiciels uniques, sculptés pour vos processus métiers les plus complexes.",
    },
    {
      icon: BookOpen,
      title: "Documentation Interactive",
      description: "Un savoir partagé en temps réel, accessible et structuré pour une autonomie totale.",
    },
    {
      icon: Zap,
      title: "Performance Ultime",
      description: "Optimisation de bas niveau pour une vitesse d'exécution qui défie la concurrence.",
    },
    {
      icon: Shield,
      title: "Sécurité Infaillible",
      description: "Arquitectures blindées protégeant l'intégrité de vos flux de données stratégiques.",
    },
    {
      icon: Globe,
      title: "Scalabilité Globale",
      description: "Prêt pour la croissance. Nos systèmes évoluent avec votre succès, sans friction.",
    },
    {
      icon: Cpu,
      title: "IA & Automation",
      description: "L'intelligence artificielle au service de votre productivité quotidienne.",
    },
  ];

  const stats = [
    { value: "500+", label: "Architectures Déployées" },
    { value: "99.9%", label: "Uptime Garanti" },
    { value: "24/7", label: "Expertise à l'écoute" },
    { value: "15+", label: "Ans d'Excellence" },
  ];

  const [recentChanges, setRecentChanges] = useState<any[]>([]);

  useEffect(() => {
    async function fetchHomeUpdates() {
      const { data } = await supabase
        .from("home_updates")
        .select("*")
        .order("order_index", { ascending: true })
        .order("date", { ascending: false });
      setRecentChanges((data || []).slice(0, 3));
    }
    fetchHomeUpdates();
  }, []);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden bg-background">
        <TechAnimation />
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border/50 to-transparent" />
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border/50 text-muted-foreground mb-10 hover:border-primary/30 transition-colors cursor-default">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Celestial OS v2.4 est en ligne</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black mb-6 sm:mb-8 leading-[0.9] tracking-tighter">
              L'Informatique <br />
              <span className="text-primary italic">Redéfinie.</span>
            </h1>
            
            <p className="text-base sm:text-xl text-muted-foreground/80 max-w-2xl mx-auto mb-8 sm:mb-12 font-medium leading-relaxed">
              Nous créons des écosystèmes numériques d'exception. <br className="hidden lg:block" /> 
              De la documentation intelligente aux SaaS haute performance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16 sm:mb-24">
              <Button href="/offres" size="lg" className="px-10 py-5 text-base font-black">
                Lancer un projet
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <Button href="/documentation" variant="outline" size="lg" className="px-10 py-5 text-base font-black border-border/50">
                Explorez l'univers
              </Button>
            </div>

            {/* Simple Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 max-w-4xl mx-auto border-t border-border/20 pt-10 md:pt-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group cursor-default">
                  <div className="text-3xl font-black tracking-tighter mb-2 group-hover:text-primary transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 lg:py-40 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16 md:mb-32 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-5xl font-black mb-6 tracking-tighter">Éprouvé par l'excellence.</h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto font-medium">Tout ce qu'il vous faut pour dominer votre marché digital.</p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {features.map((feature, index) => (
              <Card key={index} hover className="h-full border-border/30 bg-card/40 backdrop-blur-sm group/feature">
                <CardHeader>
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-8 border border-border/50 group-hover/feature:bg-primary group-hover/feature:text-white transition-all duration-500">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight mb-4 group-hover/feature:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground/80 leading-relaxed font-medium">{feature.description}</p>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Code Showcase - Premium Version */}
      <section className="py-24 lg:py-40 bg-muted/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05),transparent_50%)]" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-5xl font-black mb-8 tracking-tighter">
                Un langage <br /> de confiance.
              </h2>
              <p className="text-xl text-muted-foreground/80 mb-10 font-medium leading-relaxed">
                Nos architectures reposent sur des fondations solides. <br />
                Stables, pérennes et hautement performantes.
              </p>
              
              <div className="space-y-6 mb-12">
                {[
                  "Standards de code militaires",
                  "Tests de charge en temps réel",
                  "Intelligence distribuée",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <Check className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-bold tracking-tight">{item}</span>
                  </div>
                ))}
              </div>

              <Button href="/documentation" size="lg" className="px-10 py-5 font-black uppercase tracking-tighter">
                Voir la doc technique
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Card className="p-1 border-primary/20 bg-primary/5 shadow-2xl">
                <div className="bg-card rounded-2xl overflow-hidden border border-border/50">
                   <div className="flex items-center justify-between px-6 py-4 bg-muted border-b border-border/50">
                      <div className="flex gap-2">
                         <div className="w-3 h-3 rounded-full bg-red-400/30" />
                         <div className="w-3 h-3 rounded-full bg-yellow-400/30" />
                         <div className="w-3 h-3 rounded-full bg-green-400/30" />
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 shrink-0">Celestial Core v2.0</div>
                   </div>
                   <div className="p-4 sm:p-8 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto text-muted-foreground bg-[#020202]">
                      <div className="mb-2"><span className="text-primary font-bold">program</span> Celestial_Excellence;</div>
                      <div className="mb-2 text-muted-foreground/30"><span className="text-accent underline">uses</span> SysUtils, Network, Security;</div>
                      <br />
                      <div className="flex gap-4">
                         <span className="text-muted-foreground/20">01</span>
                         <span><span className="text-primary font-bold">begin</span></span>
                      </div>
                      <div className="flex gap-4">
                         <span className="text-muted-foreground/20">02</span>
                         <span className="pl-4 italic text-muted-foreground/40">// Optimizing client reach</span>
                      </div>
                      <div className="flex gap-4">
                         <span className="text-muted-foreground/20">03</span>
                         <span className="pl-4"><span className="text-foreground">App</span>.Connect(<span className="text-primary">Stripe_Global</span>);</span>
                      </div>
                      <div className="flex gap-4">
                         <span className="text-muted-foreground/20">04</span>
                         <span className="pl-4"><span className="text-foreground">Security</span>.ApplyLayer(<span className="text-accent">AES_256</span>);</span>
                      </div>
                      <div className="flex gap-4">
                         <span className="text-muted-foreground/20">05</span>
                         <span className="pl-4 italic text-muted-foreground/40">// Boosting visual prestige</span>
                      </div>
                      <div className="flex gap-4">
                         <span className="text-muted-foreground/20">06</span>
                         <span className="pl-4"><span className="text-foreground">UI</span>.Render(<span className="text-primary">Premium_Design</span>);</span>
                      </div>
                      <div className="flex gap-4">
                         <span className="text-muted-foreground/20">07</span>
                         <span className="pl-0"><span className="text-primary font-bold">end</span>.</span>
                      </div>
                      <motion.div 
                       animate={{ opacity: [0, 1, 0] }}
                       transition={{ duration: 0.8, repeat: Infinity }}
                       className="w-2 h-4 bg-primary mt-4 ml-10 rounded-sm" 
                      />
                   </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* New Feed / Changelog Mini-Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-16 border-l-4 border-primary pl-6 sm:pl-10 gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">Pulsations.</h2>
              <p className="text-muted-foreground uppercase text-xs font-black tracking-widest opacity-60">L'évolution constante de Celestial</p>
            </div>
            <Link to="/changelog" className="text-xs font-black uppercase tracking-widest text-primary hover:tracking-[.2em] transition-all flex items-center gap-3 shrink-0">
              Voir tout
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {recentChanges.map((change, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover className="h-full border-border/30 bg-muted/10 p-8 flex flex-col group/item">
                   <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">{change.date ? format(new Date(change.date), "dd/MM/yyyy") : ""}</div>
                   <h4 className="text-xl font-black tracking-tight mb-4 group-hover/item:text-primary transition-colors">Version {change.version}</h4>
                   <p className="text-sm text-muted-foreground line-clamp-3 font-medium leading-relaxed mb-6">{change.changes}</p>
                   <Link to="/changelog" className="mt-auto text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 group-hover/item:text-foreground transition-all">
                      Détails <ChevronRight className="w-3 h-3" />
                   </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Monumental CTA */}
      <section className="py-20 sm:py-32 lg:py-60 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />
        
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black mb-8 sm:mb-12 tracking-tighter">
              Vivez l'expérience <br className="hidden sm:block" /> <span className="text-primary italic">Celestial.</span>
            </h2>
            <p className="text-xl text-muted-foreground/80 mb-16 max-w-2xl mx-auto font-medium">
              Rejoignez les entreprises qui ont choisi le futur. <br />
              Parlons de votre prochaine révolution numérique.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 justify-center">
              <Button href="/contact" size="lg" className="px-10 sm:px-16 py-5 sm:py-6 text-base sm:text-lg font-black rounded-3xl">
                Lancer la Phase 1
              </Button>
              <Button href="/offres" variant="outline" size="lg" className="px-10 sm:px-16 py-5 sm:py-6 text-base sm:text-lg font-black rounded-3xl border-border/50">
                Voir les Plans
              </Button>
            </div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-0 inset-x-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />
      </section>
    </div>
  );
}
