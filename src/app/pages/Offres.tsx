import { Button } from "../components/Button";
import { Card, CardHeader, CardContent, CardFooter } from "../components/Card";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ArrowRight, ShoppingCart, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useUIStore } from "../../store/useUIStore";

function EyebrowLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-body text-[11px] tracking-[0.2em] uppercase text-secondary font-medium mb-5">{children}</p>;
}

// Accordion FAQ item
function FaqItem({ faq, index }: { faq: any; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay: index * 0.05 }}
      className="border-b border-border">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group">
        <span className="font-body text-sm font-medium text-foreground group-hover:text-secondary transition-colors pr-4">
          {faq.question}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} className="shrink-0">
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden">
            <p className="pb-5 text-sm text-muted-foreground font-light leading-relaxed font-body">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function Offres() {
  const [offers, setOffers] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [additionalServices, setAdditionalServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const openWizard = useUIStore((s) => s.openWizard);

  useEffect(() => {
    async function fetchData() {
      const [{ data: offersData }, { data: faqsData }, { data: servicesData }] = await Promise.all([
        supabase.from("pricing_offers").select("*").order("order_index", { ascending: true }),
        supabase.from("faqs").select("*").order("order_index"),
        supabase.from("additional_services").select("*").order("order_index"),
      ]);
      setOffers(offersData || []);
      setFaqs(faqsData || []);
      setAdditionalServices(servicesData || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-16 py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <EyebrowLabel>Nos Tarifs</EyebrowLabel>
            <h1 className="text-foreground mb-5">
              Des solutions <span className="text-secondary">accessibles.</span>
            </h1>
            <p className="font-body text-lg text-muted-foreground font-light leading-relaxed max-w-xl">
              Choisissez le plan qui correspond à l'envergure de vos ambitions informatiques.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        {/* Pricing grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7 items-start">
          {loading ? (
            <div className="col-span-full py-20 text-center flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-secondary border-t-transparent animate-spin" />
              <p className="text-muted-foreground font-body text-sm">Chargement des offres…</p>
            </div>
          ) : offers.map((offer, index) => (
            <motion.div key={offer.id}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className={offer.is_popular ? "lg:-mt-5 relative" : ""}>
              <Card hover overflowVisible={offer.is_popular}
                className={`flex flex-col h-full relative ${offer.is_popular
                  ? "border-secondary/60 shadow-xl shadow-secondary/10"
                  : "border-border/60"}`}>
                {/* Popular top accent */}
                {offer.is_popular && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-secondary rounded-t" />
                )}
                {/* Popular badge */}
                {offer.is_popular && (
                  <div className="absolute -top-4 left-5 z-30 pointer-events-none">
                    <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-secondary text-white font-body text-[10px] font-medium uppercase tracking-[0.15em]">
                      <Zap className="w-3 h-3 fill-current" />
                      Le plus populaire
                    </span>
                  </div>
                )}

                <CardHeader className="relative pt-8">
                  <div className={`w-9 h-9 mb-5 flex items-center justify-center border ${offer.is_popular ? "border-secondary/40 bg-secondary/8 text-secondary" : "border-border bg-muted text-muted-foreground"}`}>
                    <Zap className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>{offer.title}</h3>
                  <p className="font-body text-sm text-muted-foreground font-light mb-7 min-h-[40px] leading-relaxed">{offer.description}</p>
                  <div className="flex items-baseline gap-2 mb-1.5">
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem,4vw,3.5rem)", fontWeight: 700, letterSpacing: "-0.03em" }}>
                      {offer.price}
                    </span>
                    <span className="font-body text-sm text-muted-foreground font-light">{offer.currency || "DZD"}</span>
                  </div>
                  {offer.is_monthly && (
                    <p className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground/40">Facturé mensuellement</p>
                  )}
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="space-y-3.5 pt-5 border-t border-border/30">
                    <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground/40 mb-4">Fonctionnalités incluses</p>
                    {(offer.features || []).map((feature: string, i: number) => (
                      <li key={i} className="list-none flex items-start gap-3">
                        <div className="w-4 h-px bg-secondary mt-2.5 shrink-0" />
                        <span className="font-body text-sm text-foreground/80 font-light leading-snug">{feature}</span>
                      </li>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 pt-7 pb-7">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
                    <Button onClick={() => openWizard(offer)}
                      variant={offer.is_popular ? "primary" : "secondary"}
                      className="w-full text-[12px] font-semibold uppercase tracking-wider py-3.5">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Commander l'offre
                    </Button>
                  </motion.div>
                  <Button href="/contact" variant="ghost"
                    className="w-full text-[11px] font-medium text-muted-foreground hover:text-foreground">
                    Demander un devis personnalisé
                    <ArrowRight className="w-3.5 h-3.5 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Services */}
        {additionalServices.length > 0 && (
          <div className="mt-24 lg:mt-36 border-t border-border pt-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="mb-14">
              <EyebrowLabel>Services Complémentaires</EyebrowLabel>
              <h2 className="text-foreground">Complétez votre<br /><span className="text-secondary">écosystème Celestial.</span></h2>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {additionalServices.map((service, index) => (
                <motion.div key={service.id || service.title}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: index * 0.08 }}>
                  <Card hover className="h-full border-border/50 bg-card/50">
                    <CardHeader>
                      <h3 className="text-lg font-semibold mb-2.5" style={{ fontFamily: "var(--font-display)" }}>{service.title}</h3>
                      <p className="text-sm text-muted-foreground font-light leading-relaxed mb-5">{service.description}</p>
                      <div className="text-secondary font-display text-xl font-bold">{service.price}</div>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ — Accordion */}
        {faqs.length > 0 && (
          <div className="mt-24 lg:mt-36 border-t border-border pt-16">
            <div className="max-w-3xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="mb-12">
                <EyebrowLabel>Questions fréquentes</EyebrowLabel>
                <h2 className="text-foreground">Tout ce que vous<br /><span className="text-secondary">devez savoir.</span></h2>
              </motion.div>
              <div>
                {faqs.map((faq, index) => (
                  <FaqItem key={faq.id || index} faq={faq} index={index} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
