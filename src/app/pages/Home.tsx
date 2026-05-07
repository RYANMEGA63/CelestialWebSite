import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ChevronRight, ArrowRight, Code2, Zap, Shield, BookOpen, Globe, Cpu } from "lucide-react";
import { Link } from "react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import { format } from "date-fns";
import { useUIStore } from "../../store/useUIStore";

function EyebrowLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body text-[11px] tracking-[0.2em] uppercase text-secondary font-medium mb-5">
      {children}
    </p>
  );
}

function BlueLine() {
  return <div className="h-px w-12 bg-secondary my-6" />;
}

// Animated counter hook
function useCounter(target: number, duration = 1.5) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, target, duration]);
  return { ref, count };
}

// ── Hero ──────────────────────────────────────────────────────
function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const openWizard = useUIStore((s) => s.openWizard);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0px", "80px"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[100svh] flex flex-col overflow-hidden bg-background">
      {/* Grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
      />
      {/* Blue radial ambient */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full opacity-[0.08] blur-[140px] pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)" }} />
      {/* Left vertical rule */}
      <div className="absolute left-8 md:left-16 top-32 bottom-32 w-px bg-border hidden lg:block" />

      <div className="relative z-10 flex-1 min-h-[8rem] lg:min-h-[12rem]" />

      <motion.div style={{ y, opacity }} className="relative z-10 mx-auto max-w-7xl w-full px-6 lg:px-16">
        {/* Status badge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3 mb-10">
          <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          <span className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-body">
            Celestial — Solutions d'Excellence
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
          <h1 className="text-foreground leading-none mb-6 max-w-5xl"
            style={{ fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: "-0.03em" }}>
            <span className="block">L'Informatique</span>
            <span className="block text-secondary">Redéfinie.</span>
          </h1>
          <BlueLine />
          <p className="mt-4 text-muted-foreground font-body text-base sm:text-lg font-light max-w-lg leading-relaxed">
            Des architectures numériques conçues pour durer. Solutions SaaS, applications métier et documentation de classe mondiale.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-10 flex flex-wrap items-center gap-5">
          <motion.button onClick={() => openWizard()}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="group flex items-center gap-3 px-7 py-3.5 bg-secondary text-white font-body font-medium text-sm tracking-wide transition-colors hover:bg-accent">
            Lancer un projet
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </motion.button>
          <Link to="/realisations"
            className="group flex items-center gap-2 text-muted-foreground font-body text-sm hover:text-foreground transition-colors">
            Voir nos réalisations
            <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-20 pt-8 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: 500, suffix: "+", label: "Architectures déployées" },
            { value: 99, suffix: ".9%", label: "Uptime garanti" },
            { value: 24, suffix: "/7", label: "Support dédié" },
            { value: 15, suffix: " ans", label: "D'excellence" },
          ].map((s, i) => {
            const { ref, count } = useCounter(s.value);
            return (
              <div key={i} ref={ref}>
                <div className="text-foreground font-display text-3xl md:text-4xl font-bold tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}>
                  {count}{s.suffix}
                </div>
                <div className="text-muted-foreground font-body text-[10px] tracking-[0.15em] uppercase mt-1.5">
                  {s.label}
                </div>
              </div>
            );
          })}
        </motion.div>
      </motion.div>

      <div className="relative z-10 flex-1 min-h-[5rem]" />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-12 bg-gradient-to-b from-secondary/70 to-transparent" />
      </motion.div>
    </section>
  );
}

// ── Services / Bento ──────────────────────────────────────────
function ServicesSection() {
  const services = [
    { icon: Code2, title: "Applications Sur-Mesure", description: "Logiciels uniques sculptés pour vos processus métiers. De la conception à la livraison, une exécution irréprochable.", tag: "Développement", wide: true },
    { icon: BookOpen, title: "Documentation Interactive", description: "Un savoir partagé, structuré et accessible en temps réel. Transformez votre expertise en actif stratégique.", tag: "Knowledge", wide: true },
    { icon: Zap, title: "Performance Ultime", description: "Optimisation de bas niveau pour une vitesse qui défie la concurrence.", tag: "Optimisation", wide: false },
    { icon: Shield, title: "Sécurité Infaillible", description: "Architectures blindées protégeant l'intégrité de vos données stratégiques.", tag: "Sécurité", wide: false },
    { icon: Globe, title: "Scalabilité Globale", description: "Nos systèmes évoluent avec votre succès — sans friction.", tag: "Infrastructure", wide: false },
    { icon: Cpu, title: "IA & Automation", description: "L'intelligence artificielle au service de votre productivité.", tag: "Intelligence", wide: false },
  ];

  return (
    <section className="py-28 lg:py-40 bg-background relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />
      <div className="mx-auto max-w-7xl px-6 lg:px-16">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end gap-8 md:gap-20">
          <div className="flex-1">
            <EyebrowLabel>Nos produits</EyebrowLabel>
            <h2 className="text-foreground">Éprouvé par<br /><span className="text-secondary">l'excellence.</span></h2>
          </div>
          <p className="text-muted-foreground font-body text-lg font-light leading-relaxed max-w-sm md:mb-2">
            Chaque solution est conçue avec le même niveau d'exigence — celui que vous méritez.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-0 border border-border grid-flow-dense">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.06 }}
                className={`group relative p-8 border-b border-r border-border hover-glow transition-all duration-300 cursor-default overflow-hidden ${s.wide ? "lg:col-span-2" : "lg:col-span-1"}`}>
                {/* Hover top bar */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
                <div className="text-[10px] tracking-[0.2em] text-muted-foreground/40 font-body mb-6 flex items-center justify-between">
                  <span className="font-mono">0{i + 1}</span>
                  <span className="text-[9px] tracking-[0.15em] uppercase text-secondary/70 border border-secondary/20 px-2 py-0.5">
                    {s.tag}
                  </span>
                </div>
                <div className="mb-5 w-9 h-9 flex items-center justify-center text-secondary bg-secondary/5 border border-secondary/10">
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <h3 className="text-foreground text-lg mb-3" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
                  {s.title}
                </h3>
                <p className="text-muted-foreground font-body text-sm font-light leading-relaxed">{s.description}</p>
                <div className="mt-6 flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-secondary opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                  <span>Explorer</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Philosophy Statement ──────────────────────────────────────
function StatementSection() {
  const ref = useRef<HTMLElement>(null);
  const words = ["Nous", "ne", "construisons", "pas", "des", "logiciels.", "Nous", "créons", "des", "instruments", "de", "croissance."];
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-28 lg:py-40 bg-muted/40 relative overflow-hidden">
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[300px] rounded-full opacity-[0.05] blur-[80px] pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)" }} />
      <div className="mx-auto max-w-7xl px-6 lg:px-16 relative z-10">
        <EyebrowLabel>Notre philosophie</EyebrowLabel>
        <blockquote className="text-foreground leading-tight mb-16 max-w-4xl"
          style={{ fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: "-0.025em", fontSize: "clamp(1.75rem, 4vw, 4rem)" }}>
          {words.map((word, i) => (
            <motion.span key={i}
              initial={{ opacity: 0.15 }}
              animate={inView ? { opacity: i >= 8 ? 1 : 0.9 } : { opacity: 0.15 }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              className={i >= 8 ? "text-secondary" : ""}
              style={{ display: "inline-block", marginRight: "0.3em" }}>
              {word}
            </motion.span>
          ))}
        </blockquote>
        <BlueLine />
        <div className="mt-10 grid md:grid-cols-3 gap-10 md:gap-16">
          {[
            { title: "Précision", body: "Chaque ligne de code est intentionnelle. Chaque décision architecturale, réfléchie." },
            { title: "Durabilité", body: "Nous construisons pour le long terme. Pas de raccourcis, pas de compromis techniques." },
            { title: "Humanité", body: "La technologie au service des personnes. Toujours. Sans exception." },
          ].map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="border-t-2 border-secondary/20 pt-6">
              <h4 className="text-foreground mb-3 text-xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                {p.title}
              </h4>
              <p className="text-muted-foreground font-body text-sm font-light leading-relaxed">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Product Spotlight ─────────────────────────────────────────
function ProductSpotlightSection() {
  return (
    <section className="py-28 lg:py-40 bg-background relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />
      <div className="mx-auto max-w-7xl px-6 lg:px-16">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Product visual */}
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.9 }}
            className="order-2 lg:order-1">
            <div className="relative">
              <div className="absolute -inset-6 bg-secondary/5 blur-3xl rounded-full" />
              <motion.div whileHover={{ rotateX: 2, rotateY: -3, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative bg-card border border-border shadow-2xl overflow-hidden" style={{ perspective: 1000 }}>
                <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-border" />
                  <div className="w-2 h-2 rounded-full bg-border" />
                  <div className="w-2 h-2 rounded-full bg-border" />
                  <span className="ml-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body">Celestial DB — Workspace</span>
                </div>
                <div className="p-6 space-y-2.5">
                  {["Équipe Commerciale", "Infrastructure IT", "R&D & Innovation"].map((ws, i) => (
                    <motion.div key={ws}
                      initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.12 }}
                      className={`flex items-center justify-between p-3.5 border ${i === 1 ? "border-secondary/30 bg-secondary/5" : "border-border/50"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${i === 1 ? "bg-secondary animate-pulse" : "bg-muted-foreground/30"}`} />
                        <span className="text-foreground font-body text-sm">{ws}</span>
                      </div>
                      <span className={`text-[10px] tracking-wider uppercase font-body ${i === 1 ? "text-secondary" : "text-muted-foreground"}`}>
                        {i === 1 ? "Actif" : "3 membres"}
                      </span>
                    </motion.div>
                  ))}
                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-muted-foreground font-body text-[11px]">3 espaces de travail</span>
                    <span className="text-secondary font-body text-[11px] tracking-wider uppercase">Voir tout →</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Copy */}
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.9 }}
            className="order-1 lg:order-2">
            <EyebrowLabel>Produit phare</EyebrowLabel>
            <h2 className="text-foreground mb-4">Celestial DB —<br /><span className="text-secondary">la gestion de données réinventée.</span></h2>
            <BlueLine />
            <p className="mt-4 text-muted-foreground font-body text-lg font-light leading-relaxed mb-8">
              Un SaaS de gestion de bases de données multi-comptes avec workspaces, rôles, permissions granulaires et messagerie temps-réel.
            </p>
            <div className="space-y-3 mb-10">
              {["Workspaces isolés par équipe", "Permissions granulaires par rôle", "Explorateur de tables intégré", "Messagerie temps-réel"].map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3">
                  <div className="w-4 h-px bg-secondary" />
                  <span className="text-foreground font-body text-sm">{f}</span>
                </motion.div>
              ))}
            </div>
            <Link to="/offres"
              className="group inline-flex items-center gap-3 border border-border px-7 py-3.5 font-body text-sm text-foreground hover:border-secondary hover:text-secondary transition-all duration-300">
              Découvrir les offres
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ── Updates ───────────────────────────────────────────────────
function UpdatesSection() {
  const [recentChanges, setRecentChanges] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("home_updates").select("*")
      .order("order_index", { ascending: true }).order("date", { ascending: false })
      .then(({ data }) => setRecentChanges((data || []).slice(0, 3)));
  }, []);
  if (recentChanges.length === 0) return null;

  return (
    <section className="py-24 lg:py-32 bg-muted/40 relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="mx-auto max-w-7xl px-6 lg:px-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <div>
            <EyebrowLabel>Journal</EyebrowLabel>
            <h2 className="text-foreground">Dernières mises à jour.</h2>
          </div>
          <Link to="/changelog" className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-secondary font-body hover:gap-4 transition-all">
            Tout voir <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-3 gap-0 border border-border">
          {recentChanges.map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="p-7 border-r border-border last:border-r-0 group hover:bg-background transition-all duration-300">
              <div className="text-[10px] tracking-[0.2em] uppercase text-secondary mb-3 font-body font-mono">
                {c.date ? format(new Date(c.date), "dd MMM yyyy") : ""}
              </div>
              <div className="text-foreground mb-2 font-body text-sm font-semibold">Version {c.version}</div>
              <p className="text-muted-foreground font-body text-sm font-light leading-relaxed line-clamp-3">{c.changes}</p>
              <Link to="/changelog" className="mt-5 text-[9px] tracking-[0.2em] uppercase text-muted-foreground/40 group-hover:text-secondary font-body transition-colors flex items-center gap-1.5">
                Détails <ChevronRight className="w-3 h-3" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA Final ─────────────────────────────────────────────────
function CtaSection() {
  const openWizard = useUIStore((s) => s.openWizard);
  return (
    <section className="py-32 lg:py-56 bg-muted/20 relative overflow-hidden border-t border-border">
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ background: "radial-gradient(ellipse at 50% 100%, var(--color-secondary) 0%, transparent 60%)" }} />
      <div className="mx-auto max-w-5xl px-6 lg:px-16 text-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.9 }}>
          <EyebrowLabel>Commençons</EyebrowLabel>
          <h2 className="text-foreground mb-4"
            style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(2.5rem, 6vw, 5.5rem)", letterSpacing: "-0.03em", lineHeight: 1 }}>
            Vivez l'expérience<br /><span className="text-secondary">Celestial.</span>
          </h2>
          <BlueLine />
          <p className="mt-8 text-muted-foreground font-body text-lg font-light max-w-lg mx-auto leading-relaxed mb-12">
            Rejoignez les entreprises qui ont choisi l'excellence. Parlons de votre prochaine révolution numérique.
          </p>
          <div className="flex flex-wrap justify-center gap-5">
            <motion.button onClick={() => openWizard()}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="group px-9 py-4 bg-secondary text-white font-body font-medium text-sm tracking-wide hover:bg-accent transition-colors flex items-center gap-3">
              Lancer la Phase 1
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <Link to="/offres"
              className="px-9 py-4 border border-border text-foreground font-body text-sm tracking-wide hover:border-secondary hover:text-secondary bg-background transition-all">
              Voir les offres
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Assembly ──────────────────────────────────────────────────
export function Home() {
  return (
    <div className="relative bg-background">
      <HeroSection />
      <ServicesSection />
      <StatementSection />
      <ProductSpotlightSection />
      <UpdatesSection />
      <CtaSection />
    </div>
  );
}
