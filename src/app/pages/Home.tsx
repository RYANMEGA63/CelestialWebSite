import { motion, useScroll, useTransform } from "framer-motion";
import {
  ChevronRight,
  ArrowRight,
  Code2,
  Zap,
  Shield,
  BookOpen,
  Globe,
  Cpu,
} from "lucide-react";
import { Link } from "react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { format } from "date-fns";
import { useUIStore } from "../../store/useUIStore";

// ── Helpers ───────────────────────────────────────────────────
function GoldRule() {
  return (
    <div className="flex items-center gap-4 my-2">
      <div className="h-px flex-1 bg-secondary/30" />
      <div className="w-1 h-1 rotate-45 bg-secondary" />
      <div className="h-px flex-1 bg-secondary/30" />
    </div>
  );
}

function EyebrowLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body text-[10px] tracking-[0.25em] uppercase text-secondary font-medium mb-6">
      {children}
    </p>
  );
}

// ── Main ──────────────────────────────────────────────────────
export function Home() {
  return (
    <div className="relative bg-background">
      <HomeContent />
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────
function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const openWizard = useUIStore((state) => state.openWizard);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0px", "100px"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[100svh] flex flex-col overflow-hidden bg-background">
      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none dark:opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Gold gradient accent — top right */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.06] blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)" }} />

      {/* Vertical rule — left */}
      <div className="absolute left-8 md:left-16 top-32 bottom-32 w-px bg-border/50 hidden lg:block" />

      {/* Top Spacer for safe centering */}
      <div className="relative z-10 flex-1 min-h-[8rem] lg:min-h-[12rem]" />

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 mx-auto max-w-7xl w-full px-6 lg:px-16"
      >
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3 mb-12 sm:mb-16"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-body">
            Celestial Studio — Solutions d'Excellence
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-foreground leading-none mb-8"
            style={{ fontFamily: "var(--font-display)", fontWeight: 300, letterSpacing: "-0.03em" }}>
            <span className="block text-[clamp(2.5rem,8vw,7rem)]">L'Informatique</span>
            <span className="block text-[clamp(2.5rem,8vw,7rem)] italic text-secondary">
              Redéfinie.
            </span>
          </h1>

          <GoldRule />

          <p className="mt-8 text-muted-foreground font-body text-base sm:text-lg md:text-xl font-light max-w-xl leading-relaxed">
            Des architectures numériques conçues pour durer. Solutions SaaS, applications métier et documentation de classe mondiale.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 flex flex-wrap items-center gap-6"
        >
          <button 
            onClick={() => openWizard()}
            className="group flex items-center gap-3 px-8 py-4 bg-secondary text-secondary-foreground font-body font-medium text-xs sm:text-sm tracking-wide transition-all hover:bg-secondary/90 hover:gap-5"
          >
            Lancer un projet
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          <Link to="/realisations"
            className="group flex items-center gap-3 text-muted-foreground font-body text-xs sm:text-sm tracking-wide hover:text-foreground transition-colors">
            Voir nos réalisations
            <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Stats — bottom row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-16 sm:mt-24 pt-8 border-t border-border/50 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: "500+", label: "Architectures déployées" },
            { value: "99.9%", label: "Uptime garanti" },
            { value: "24/7", label: "Support dédié" },
            { value: "15 ans", label: "D'excellence" },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-foreground font-display text-2xl sm:text-3xl md:text-4xl font-light tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}>
                {s.value}
              </div>
              <div className="text-muted-foreground font-body text-[9px] sm:text-[11px] tracking-[0.15em] uppercase mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom Spacer for safe centering */}
      <div className="relative z-10 flex-1 min-h-[6rem] lg:min-h-[8rem]" />

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-12 bg-gradient-to-b from-secondary/60 to-transparent"
        />
      </motion.div>
    </section>
  );
}

// ── Products / Services showcase ──────────────────────────────
function ServicesSection() {
  const services = [
    {
      number: "01",
      icon: Code2,
      title: "Applications Sur-Mesure",
      description: "Logiciels uniques sculptés pour vos processus métiers les plus complexes. De la conception à la livraison, une exécution irréprochable.",
      tag: "Développement",
    },
    {
      number: "02",
      icon: BookOpen,
      title: "Documentation Interactive",
      description: "Un savoir partagé, structuré et accessible en temps réel. Transformez votre expertise en actif stratégique.",
      tag: "Knowledge",
    },
    {
      number: "03",
      icon: Zap,
      title: "Performance Ultime",
      description: "Optimisation de bas niveau pour une vitesse d'exécution qui défie la concurrence. Architecture pensée pour durer.",
      tag: "Optimisation",
    },
    {
      number: "04",
      icon: Shield,
      title: "Sécurité Infaillible",
      description: "Architectures blindées protégeant l'intégrité de vos flux de données stratégiques. Confiance totale, sans compromis.",
      tag: "Sécurité",
    },
    {
      number: "05",
      icon: Globe,
      title: "Scalabilité Globale",
      description: "Nos systèmes évoluent avec votre succès. De quelques utilisateurs à des millions — sans friction, sans rupture.",
      tag: "Infrastructure",
    },
    {
      number: "06",
      icon: Cpu,
      title: "IA & Automation",
      description: "L'intelligence artificielle au service de votre productivité. Automatisez l'ordinaire, concentrez-vous sur l'extraordinaire.",
      tag: "Intelligence",
    },
  ];

  return (
    <section className="py-32 lg:py-48 bg-background relative">
      {/* Subtle top border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 lg:px-16">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 md:mb-32 flex flex-col md:flex-row md:items-end gap-8 md:gap-24"
        >
          <div className="flex-1">
            <EyebrowLabel>Nos produits</EyebrowLabel>
            <h2 className="text-foreground">Éprouvé par<br /><em>l'excellence.</em></h2>
          </div>
          <p className="text-muted-foreground font-body text-lg font-light leading-relaxed max-w-sm md:mb-2">
            Chaque solution est conçue avec le même niveau d'exigence — celui que vous méritez.
          </p>
        </motion.div>

        {/* Services grid — editorial layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0 border border-border/50">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.07 }}
                className="group relative p-8 md:p-10 border-b border-r border-border/50 hover:bg-muted/50 transition-all duration-500 cursor-default overflow-hidden"
              >
                {/* Gold hover accent top */}
                <div className="absolute top-0 left-0 right-0 h-px bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                {/* Number */}
                <div className="text-[11px] tracking-[0.2em] text-muted-foreground/40 font-body mb-8 flex items-center justify-between">
                  <span>{s.number}</span>
                  <span className="text-[9px] tracking-[0.2em] uppercase text-secondary/70 border border-secondary/20 px-2 py-0.5">
                    {s.tag}
                  </span>
                </div>

                {/* Icon */}
                <div className="mb-6 w-10 h-10 flex items-center justify-center text-secondary">
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                </div>

                {/* Content */}
                <h3 className="text-foreground text-xl mb-4" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
                  {s.title}
                </h3>
                <p className="text-muted-foreground font-body text-sm font-light leading-relaxed">
                  {s.description}
                </p>

                {/* Hover arrow */}
                <div className="mt-8 flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-secondary opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
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

// ── Statement / Philosophy ────────────────────────────────────
function StatementSection() {
  return (
    <section className="py-32 lg:py-48 bg-muted/30 relative overflow-hidden">
      {/* Gold ambient */}
      <div className="absolute bottom-0 left-1/4 w-[800px] h-[400px] rounded-full opacity-[0.04] blur-[100px] pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)" }} />

      <div className="mx-auto max-w-7xl px-6 lg:px-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <EyebrowLabel>Notre philosophie</EyebrowLabel>

          {/* Large editorial quote */}
          <blockquote className="text-foreground leading-tight mb-16"
            style={{ fontFamily: "var(--font-display)", fontWeight: 300, letterSpacing: "-0.02em", fontSize: "clamp(2rem, 5vw, 4.5rem)" }}>
            "Nous ne construisons pas<br />
            des logiciels. Nous créons des<br />
            <em className="text-secondary">instruments de croissance.</em>"
          </blockquote>

          <GoldRule />

          <div className="mt-12 grid md:grid-cols-3 gap-12 md:gap-20">
            {[
              { title: "Précision", body: "Chaque ligne de code est intentionnelle. Chaque décision architecturale, réfléchie." },
              { title: "Durabilité", body: "Nous construisons pour le long terme. Pas de raccourcis, pas de compromis techniques." },
              { title: "Humanité", body: "La technologie au service des personnes. Toujours. Sans exception." },
            ].map((p, i) => (
              <div key={i} className="border-t border-border/50 pt-8">
                <h4 className="text-foreground mb-3 italic" style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 400 }}>
                  {p.title}
                </h4>
                <p className="text-muted-foreground font-body text-sm font-light leading-relaxed">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Celestial DB Product Spotlight ───────────────────────────
function ProductSpotlightSection() {
  return (
    <section className="py-32 lg:py-48 bg-background relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 lg:px-16">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-center">
          {/* Left: Product visual */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="order-2 lg:order-1"
          >
            {/* Product card — Celestial DB */}
            <div className="relative">
              <div className="absolute -inset-4 bg-secondary/5 blur-2xl" />
              <div className="relative bg-card border border-border shadow-xl overflow-hidden">
                {/* DB Manager mockup */}
                <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-border" />
                  <div className="w-2 h-2 rounded-full bg-border" />
                  <div className="w-2 h-2 rounded-full bg-border" />
                  <span className="ml-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body">
                    Celestial DB — Workspace
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  {/* Simulated workspace list */}
                  {["Équipe Commerciale", "Infrastructure IT", "R&D & Innovation"].map((ws, i) => (
                    <motion.div
                      key={ws}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.15 }}
                      className={`flex items-center justify-between p-4 border ${i === 1 ? "border-secondary/30 bg-secondary/5" : "border-border/50"} group cursor-default`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${i === 1 ? "bg-secondary animate-pulse" : "bg-muted-foreground/30"}`} />
                        <span className="text-foreground font-body text-sm">{ws}</span>
                      </div>
                      <span className={`text-[10px] tracking-wider uppercase font-body ${i === 1 ? "text-secondary" : "text-muted-foreground"}`}>
                        {i === 1 ? "Actif" : "3 membres"}
                      </span>
                    </motion.div>
                  ))}

                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-muted-foreground font-body text-[11px]">3 espaces de travail</span>
                    <span className="text-secondary font-body text-[11px] tracking-wider uppercase">Voir tout →</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Copy */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="order-1 lg:order-2"
          >
            <EyebrowLabel>Produit phare</EyebrowLabel>
            <h2 className="text-foreground mb-6">
              Celestial DB —<br /><em className="text-secondary">la gestion de données réinventée.</em>
            </h2>
            <GoldRule />
            <p className="mt-8 text-muted-foreground font-body text-lg font-light leading-relaxed mb-10">
              Un SaaS de gestion de bases de données multi-comptes avec workspaces, rôles, permissions granulaires et messagerie temps-réel. Pensé pour les équipes qui exigent la précision.
            </p>

            <div className="space-y-4 mb-12">
              {[
                "Workspaces isolés par équipe",
                "Permissions granulaires par rôle",
                "Explorateur de tables intégré",
                "Messagerie temps-réel",
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-4 h-px bg-secondary" />
                  <span className="text-foreground font-body text-sm">{f}</span>
                </div>
              ))}
            </div>

            <Link to="/offres"
              className="group inline-flex items-center gap-3 border border-foreground/20 px-8 py-4 font-body text-sm tracking-wide text-foreground hover:border-secondary hover:text-secondary transition-all duration-300">
              Découvrir les offres
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ── Updates / Pulsations ──────────────────────────────────────
function UpdatesSection() {
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

  if (recentChanges.length === 0) return null;

  return (
    <section className="py-24 lg:py-32 bg-muted/50 relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="mx-auto max-w-7xl px-6 lg:px-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
          <div>
            <EyebrowLabel>Journal</EyebrowLabel>
            <h2 className="text-foreground text-3xl md:text-4xl">Pulsations.</h2>
          </div>
          <Link to="/changelog"
            className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-secondary font-body hover:gap-4 transition-all">
            Tout voir <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-0 border border-border/50">
          {recentChanges.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 border-r border-border/50 last:border-r-0 group hover:bg-background/80 transition-all duration-300"
            >
              <div className="text-[10px] tracking-[0.2em] uppercase text-secondary mb-4 font-body">
                {c.date ? format(new Date(c.date), "dd MMM yyyy") : ""}
              </div>
              <div className="text-foreground mb-3 font-body text-sm font-medium">Version {c.version}</div>
              <p className="text-muted-foreground font-body text-sm font-light leading-relaxed line-clamp-3">
                {c.changes}
              </p>
              <Link to="/changelog" className="mt-6 text-[9px] tracking-[0.2em] uppercase text-muted-foreground/50 group-hover:text-secondary font-body transition-colors flex items-center gap-2">
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
  return (
    <section className="py-32 lg:py-60 bg-muted/20 relative overflow-hidden border-t border-border/50">
      {/* Gold gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ background: "radial-gradient(ellipse at 50% 100%, var(--color-secondary) 0%, transparent 60%)" }} />
      </div>

      <div className="mx-auto max-w-5xl px-6 lg:px-16 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <EyebrowLabel>Commençons</EyebrowLabel>
          <h2 className="text-foreground mb-6"
            style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(2.5rem, 7vw, 6rem)", letterSpacing: "-0.03em", lineHeight: 1 }}>
            Vivez l'expérience<br /><em className="text-secondary">Celestial.</em>
          </h2>
          <GoldRule />
          <p className="mt-10 text-muted-foreground font-body text-lg font-light max-w-xl mx-auto leading-relaxed mb-14">
            Rejoignez les entreprises qui ont choisi l'excellence. Parlons de votre prochaine révolution numérique.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <button onClick={() => openWizard()}
              className="group px-10 py-4 bg-secondary text-secondary-foreground font-body font-medium text-sm tracking-wide hover:bg-secondary/90 transition-all flex items-center gap-3">
              Lancer la Phase 1
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <Link to="/offres"
              className="px-10 py-4 border border-border text-foreground font-body text-sm tracking-wide hover:border-secondary hover:text-secondary bg-background transition-all">
              Voir les offres
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Assembly ──────────────────────────────────────────────────
function HomeContent() {
  return (
    <div>
      <HeroSection />
      <ServicesSection />
      <StatementSection />
      <ProductSpotlightSection />
      <UpdatesSection />
      <CtaSection />
    </div>
  );
}
