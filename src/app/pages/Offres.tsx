import { Button } from "../components/Button";
import { Card, CardHeader, CardContent, CardFooter } from "../components/Card";
import { motion } from "framer-motion";
import { Zap, ArrowRight, ShoppingCart } from "lucide-react";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useUIStore } from "../../store/useUIStore";

export function Offres() {
  const [offers, setOffers] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [additionalServices, setAdditionalServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const openWizard = useUIStore((state) => state.openWizard);

  useEffect(() => {
    async function fetchData() {
      const { data: offersData } = await supabase.from("pricing_offers").select("*").order("order_index", { ascending: true });
      const { data: faqsData } = await supabase.from("faqs").select("*").order("order_index");
      const { data: servicesData } = await supabase.from("additional_services").select("*").order("order_index");
      setOffers(offersData || []);
      setFaqs(faqsData || []);
      setAdditionalServices(servicesData || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">

      <div className="border-b border-border/30 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-16 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p className="font-body text-[10px] tracking-[0.25em] uppercase text-secondary font-medium mb-6">
              Nos Tarifs
            </p>
            <h1 className="text-foreground mb-6">
              Des solutions <em className="text-secondary">accessibles.</em>
            </h1>
            <p className="font-body text-lg text-muted-foreground font-light leading-relaxed max-w-xl">
              Choisissez le plan qui correspond à l'envergure de vos ambitions informatiques.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {loading ? (
            <div className="col-span-full py-20 text-center flex flex-col items-center gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-muted-foreground font-medium">Initialisation des offres...</p>
            </div>
          ) : offers.map((offer, index) => {
            return (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className={offer.is_popular ? "lg:-mt-4 relative" : ""}
              >
                <Card
                  hover
                  overflowVisible={offer.is_popular}
                  className={`flex flex-col h-full ${
                    offer.is_popular
                      ? "border-secondary/50 shadow-lg shadow-secondary/10"
                      : "border-border/40"
                  }`}
                >
                  {offer.is_popular && (
                    <div className="absolute -top-4 left-6 z-[30] pointer-events-none">
                      <span className="flex items-center gap-2 px-4 py-1.5 bg-secondary text-secondary-foreground font-body text-[10px] font-medium uppercase tracking-[0.2em]">
                        <Zap className="w-3 h-3 fill-current" />
                        Le plus populaire
                      </span>
                    </div>
                  )}

                  <CardHeader className="relative">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-10 h-10 flex items-center justify-center border ${
                        offer.is_popular
                          ? "border-secondary/30 bg-secondary/5 text-secondary"
                          : "border-border/50 bg-muted text-muted-foreground"
                      }`}>
                        <Zap className="w-5 h-5" strokeWidth={1.5} />
                      </div>
                      {offer.is_popular && (
                        <div className="font-body text-[10px] tracking-[0.15em] uppercase text-secondary">
                          Recommandé
                        </div>
                      )}
                    </div>
                    <h3 className="mb-2" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem,2.5vw,2rem)", fontWeight: 400 }}>{offer.title}</h3>
                    <p className="font-body text-sm text-muted-foreground font-light mb-8 min-h-[40px] leading-relaxed">{offer.description}</p>

                    <div className="flex items-baseline gap-2 mb-2">
                      <span style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem,4vw,3.5rem)", fontWeight: 300, letterSpacing: "-0.03em" }}>{offer.price}</span>
                      <span className="font-body text-sm text-muted-foreground font-light">{offer.currency || "DZD"}</span>
                    </div>
                    {offer.is_monthly && (
                      <p className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground/40">Facturé mensuellement</p>
                    )}
                  </CardHeader>

                  <CardContent className="flex-1">
                    <div className="space-y-4 pt-4 border-t border-border/20">
                      <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground/40 mb-4">Fonctionnalités incluses</p>
                      {(offer.features || []).map((feature: string, i: number) => (
                        <li key={i} className="list-none flex items-start gap-3">
                          <div className="w-4 h-px bg-secondary mt-2.5 shrink-0" />
                          <span className="font-body text-sm text-foreground/80 font-light leading-snug">{feature}</span>
                        </li>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col gap-3 pt-8 pb-8">
                    <Button
                      onClick={() => openWizard(offer)}
                      variant={offer.is_popular ? "primary" : "secondary"}
                      className="w-full text-[13px] font-black uppercase tracking-widest py-4"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Commander l'offre
                    </Button>
                    <Button href="/contact" variant="ghost" className="w-full text-[11px] font-bold text-muted-foreground hover:text-foreground">
                      Demander un devis personnalisé
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Services Additionnels */}
        {additionalServices.length > 0 && (
          <div className="mt-20 lg:mt-40 border-t border-border/20 pt-16 lg:pt-24">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-black mb-4 tracking-tight">Services Additionnels</h2>
              <p className="text-lg text-muted-foreground font-medium">Complétez votre écosystème Celestial.</p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {additionalServices.map((service, index) => (
                <motion.div 
                  key={service.id || service.title} 
                  initial={{ opacity: 0, y: 20 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ delay: index * 0.1 }}
                >
                  <Card hover className="h-full border-border/30 bg-card/30">
                    <CardHeader>
                      <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-6">{service.description}</p>
                      <div className="text-primary text-xl font-black">{service.price}</div>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ */}
        {faqs.length > 0 && (
          <div className="mt-20 lg:mt-40 bg-muted/20 p-6 sm:p-12 lg:p-24 border border-border/20">
            <div className="max-w-3xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-black mb-4 tracking-tight">Questions Fréquentes</h2>
                <p className="text-muted-foreground font-medium">Tout ce que vous devez savoir.</p>
              </motion.div>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <motion.div key={faq.id || index} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}>
                    <Card className="border-border/30 bg-background/50">
                      <CardHeader className="p-6">
                        <h3 className="font-bold flex items-center gap-4 group cursor-help">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {faq.question}
                        </h3>
                        <div className="mt-4 pl-5 text-sm text-muted-foreground/80 leading-relaxed">
                          {faq.answer}
                        </div>
                      </CardHeader>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
