import { Button } from "../components/Button";
import { Card, CardHeader, CardContent, CardFooter } from "../components/Card";
import { motion } from "framer-motion";
import { Check, Zap, ArrowRight, ShoppingCart, Sparkles } from "lucide-react";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { OrderWizard } from "../components/OrderWizard";

export function Offres() {
  const [offers, setOffers] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [additionalServices, setAdditionalServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any | null>(null);

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
      {wizardOpen && (
        <OrderWizard 
          initialOffer={selectedOffer} 
          onClose={() => {
            setWizardOpen(false);
            setSelectedOffer(null);
          }} 
        />
      )}

      <div className="relative border-b border-border/40 overflow-hidden bg-background">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles className="w-3 h-3" />
              Nos Tarifs
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tighter">
              Des solutions <span className="text-primary italic">accessibles</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
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
                  className={`flex flex-col h-full bg-card/50 backdrop-blur-sm ${offer.is_popular ? "border-primary/50 shadow-2xl shadow-primary/10 ring-1 ring-primary/20" : "border-border/40"}`}
                >
                  {offer.is_popular && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-[30] pointer-events-none">
                      <span className="flex items-center gap-2 px-5 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                        <Zap className="w-3 h-3 fill-current" />
                        Le plus populaire
                      </span>
                    </div>
                  )}
                  
                  <CardHeader className="relative">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-3 rounded-2xl ${offer.is_popular ? "bg-primary/20 text-primary border border-primary/20" : "bg-muted text-muted-foreground border border-border/50"}`}>
                        <Zap className="w-6 h-6" />
                      </div>
                      {offer.is_popular && (
                        <div className="text-[10px] font-bold text-primary px-2 py-1 rounded bg-primary/10 uppercase">
                          Recommandé
                        </div>
                      )}
                    </div>
                    <h3 className="text-3xl font-black tracking-tight mb-2">{offer.title}</h3>
                    <p className="text-sm text-muted-foreground font-medium mb-8 min-h-[40px] leading-relaxed">{offer.description}</p>
                    
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className="text-5xl font-black tracking-tighter">{offer.price}</span>
                      <span className="text-sm font-bold text-muted-foreground opacity-60">{offer.currency || 'DZD'}</span>
                    </div>
                    {offer.is_monthly && <div className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">Facturé mensuellement</div>}
                  </CardHeader>

                  <CardContent className="flex-1">
                    <div className="space-y-4 pt-4 border-t border-border/20">
                      <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] mb-4">Fonctionnalités incluses</p>
                      {(offer.features || []).map((feature: string, i: number) => (
                        <li key={i} className="list-none flex items-start gap-4">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${offer.is_popular ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                            <Check className="w-3 h-3" />
                          </div>
                          <span className="text-sm font-medium text-foreground/80 leading-snug">{feature}</span>
                        </li>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col gap-3 pt-8 pb-8">
                    <Button
                      onClick={() => {
                        setSelectedOffer(offer);
                        setWizardOpen(true);
                      }}
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
          <div className="mt-20 lg:mt-40 bg-muted/20 rounded-3xl lg:rounded-[3rem] p-6 sm:p-12 lg:p-24 border border-border/20">
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
