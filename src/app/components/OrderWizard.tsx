import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Package,
  Plus,
  User,
  ClipboardCheck,
  Send,
  X,
  CreditCard,
  Zap
} from "lucide-react";
import { Button } from "./Button";
import { Card, CardHeader, CardContent } from "./Card";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { sendWebhookNotification } from "../../lib/notifications";

interface OrderWizardProps {
  initialOffer?: any;
  onClose: () => void;
}

export function OrderWizard({ initialOffer, onClose }: OrderWizardProps) {
  const [step, setStep] = useState(initialOffer ? 2 : 1);
  const [offers, setOffers] = useState<any[]>([]);
  const [additionalServices, setAdditionalServices] = useState<any[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<any>(initialOffer || null);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
    promoCode: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data: offersData } = await supabase.from("pricing_offers").select("*").order("order_index");
      const { data: servicesData } = await supabase.from("additional_services").select("*").order("order_index");
      setOffers(offersData || []);
      setAdditionalServices(servicesData || []);
    }
    fetchData();
  }, []);

  const handleServiceToggle = (service: any) => {
    setSelectedServices(prev =>
      prev.find(s => s.id === service.id)
        ? prev.filter(s => s.id !== service.id)
        : [...prev, service]
    );
  };

  const calculateTotal = () => {
    if (!selectedOffer) return 0;

    // Parse base price (removing currency/text)
    const basePriceStr = String(selectedOffer.price || "0");
    const basePrice = parseFloat(basePriceStr.replace(/[^\d.]/g, '')) || 0;

    // Sum additional services
    const servicesTotal = selectedServices.reduce((sum, s) => {
      const servicePriceStr = String(s.price || "0");
      const price = parseFloat(servicePriceStr.replace(/[^\d.]/g, '')) || 0;
      return sum + price;
    }, 0);

    return basePrice + servicesTotal;
  };

  const handleSubmitOrder = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Veuillez remplir les champs obligatoires (Nom et Email)");
      return;
    }

    setIsSubmitting(true);
    const totalPrice = calculateTotal();

    const orderData = {
      offer_id: selectedOffer?.id,
      offer_title: selectedOffer?.title,
      client_name: formData.name,
      client_email: formData.email,
      client_company: formData.company || null,
      client_phone: formData.phone || null,
      message: formData.message || null,
      status: "nouveau",
      selected_services: selectedServices,
      total_price: `${totalPrice} DZD`,
      promo_code: formData.promoCode || null
    };

    const { error } = await supabase.from("orders").insert([orderData]);

    if (error) {
      toast.error("Erreur l'envoi de la commande", { description: error.message });
    } else {
      // Create a message entry too for the inbox
      await supabase.from("messages").insert([{
        sender_name: formData.name,
        sender_email: formData.email,
        sender_company: formData.company,
        subject: `Nouvelle commande: ${selectedOffer?.title}`,
        body: `Commande de ${selectedOffer?.title} avec ${selectedServices.length} services additionnels. Total: ${totalPrice} DZD.`,
        source: "order"
      }]);

      // Trigger Webhook for LinkedIn notifications
      await sendWebhookNotification("order", orderData);

      setIsDone(true);
      toast.success("Commande envoyée avec succès !");
    }
    setIsSubmitting(false);
  };

  const steps = [
    { id: 1, label: "Offre", icon: Package },
    { id: 2, label: "Services", icon: Plus },
    { id: 3, label: "Coordonnées", icon: User },
    { id: 4, label: "Récapitulatif", icon: ClipboardCheck },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-card border border-border rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with Steps */}
        <div className="p-4 sm:p-6 border-b border-border bg-muted/20">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              Tunnel de commande
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-between relative max-w-2xl mx-auto">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((s) => {
              const StepIcon = s.icon;
              const isActive = step >= s.id;
              const isCurrent = step === s.id;
              return (
                <div key={s.id} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCurrent
                        ? "bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/30"
                        : isActive
                          ? "bg-primary border-primary text-white"
                          : "bg-card border-border text-muted-foreground"
                      }`}
                  >
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] sm:text-xs font-medium mt-2 hidden sm:block ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <AnimatePresence mode="wait">
            {isDone ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Commande Confirmée !</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                  Merci <strong>{formData.name}</strong>, votre commande pour <strong>{selectedOffer?.title}</strong> a été enregistrée.
                  Nous vous contacterons par email ({formData.email}) très prochainement.
                </p>
                <Button onClick={onClose} size="lg">Terminer</Button>
              </motion.div>
            ) : (
              <div className="h-full">
                {step === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="text-center mb-8">
                      <h3 className="text-xl font-bold">Choisissez votre offre de base</h3>
                      <p className="text-muted-foreground">Sélectionnez le forfait qui vous convient le mieux</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {offers.map((offer) => (
                        <div
                          key={offer.id}
                          onClick={() => setSelectedOffer(offer)}
                          className={`p-6 rounded-2xl border-2 transition-all cursor-pointer hover:border-primary/50 ${selectedOffer?.id === offer.id ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-card"
                            }`}
                        >
                          <h4 className="font-bold text-lg mb-2">{offer.title}</h4>
                          <div className="text-2xl font-bold text-primary mb-4">{offer.price} DZD</div>
                          <p className="text-xs text-muted-foreground line-clamp-3">{offer.description}</p>
                          {selectedOffer?.id === offer.id && (
                            <div className="mt-4 flex justify-end">
                              <Check className="w-5 h-5 text-primary" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="text-center mb-8">
                      <h3 className="text-xl font-bold">Services Additionnels</h3>
                      <p className="text-muted-foreground">Personnalisez votre commande avec nos services à la carte</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {additionalServices.map((service) => {
                        const isSelected = selectedServices.find(s => s.id === service.id);
                        return (
                          <div
                            key={service.id}
                            onClick={() => handleServiceToggle(service)}
                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex justify-between items-center ${isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                              }`}
                          >
                            <div>
                              <h4 className="font-semibold text-sm">{service.title}</h4>
                              <p className="text-xs text-muted-foreground">{service.price}</p>
                            </div>
                            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? "bg-primary border-primary text-white" : "border-border"
                              }`}>
                              {isSelected && <Check className="w-4 h-4" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="text-center mb-8">
                      <h3 className="text-xl font-bold">Vos Informations</h3>
                      <p className="text-muted-foreground">Dites-nous qui vous êtes pour finaliser le projet</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nom complet *</label>
                        <input
                          required
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2 border rounded-xl bg-input-background focus:ring-2 focus:ring-primary outline-none transition-all"
                          placeholder="Ex: Ryan Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email professionnel *</label>
                        <input
                          required
                          type="email"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-2 border rounded-xl bg-input-background focus:ring-2 focus:ring-primary outline-none transition-all"
                          placeholder="ryan@company.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nom de l'entreprise</label>
                        <input
                          value={formData.company}
                          onChange={e => setFormData({ ...formData, company: e.target.value })}
                          className="w-full px-4 py-2 border rounded-xl bg-input-background focus:ring-2 focus:ring-primary outline-none transition-all"
                          placeholder="Celestial Web"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Téléphone</label>
                        <input
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-2 border rounded-xl bg-input-background focus:ring-2 focus:ring-primary outline-none transition-all"
                          placeholder="+213..."
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                        <label className="text-sm font-medium">Message ou précisions</label>
                        <textarea
                          rows={3}
                          value={formData.message}
                          onChange={e => setFormData({ ...formData, message: e.target.value })}
                          className="w-full px-4 py-2 border rounded-xl bg-input-background focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                          placeholder="Détails sur votre demande spéciale..."
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                        <label className="text-sm font-medium">Code Promo (optionnel)</label>
                        <input
                          value={formData.promoCode}
                          onChange={e => setFormData({ ...formData, promoCode: e.target.value })}
                          className="w-full max-w-xs px-4 py-2 border border-dashed rounded-xl bg-muted/30 focus:ring-2 focus:ring-primary outline-none transition-all"
                          placeholder="CELESTIAL2026"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="text-center mb-8">
                      <h3 className="text-xl font-bold">Récapitulatif de votre commande</h3>
                      <p className="text-muted-foreground">Vérifiez les détails avant l'envoi</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                          <h4 className="font-bold flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Détails de facturation
                          </h4>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Offre {selectedOffer?.title}</span>
                            <span className="font-semibold">{selectedOffer?.price} DZD</span>
                          </div>
                          {selectedServices.map(s => (
                            <div key={s.id} className="flex justify-between items-center text-xs">
                              <span className="text-muted-foreground">+ {s.title}</span>
                              <span className="font-medium">{s.price}</span>
                            </div>
                          ))}
                          <div className="pt-4 border-t border-border flex justify-between items-center">
                            <span className="font-bold">TOTAL ESTIMÉ</span>
                            <span className="text-xl font-bold text-primary">{calculateTotal()} DZD</span>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="space-y-4">
                        <div className="p-4 bg-muted/30 rounded-2xl border border-border">
                          <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" />
                            Coordonnées
                          </h4>
                          <div className="space-y-2 text-sm">
                            <p><span className="text-muted-foreground">Client:</span> {formData.name}</p>
                            <p><span className="text-muted-foreground">Email:</span> {formData.email}</p>
                            {formData.company && <p><span className="text-muted-foreground">Entreprise:</span> {formData.company}</p>}
                          </div>
                        </div>

                        <div className="p-4 bg-yellow-500/5 rounded-2xl border border-yellow-500/20">
                          <p className="text-xs text-muted-foreground italic">
                            En validant cette commande, vous formulez une demande de devis. Notre équipe vous recontactera sous 24h ouvrées.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        {!isDone && (
          <div className="p-4 sm:p-6 border-t border-border bg-muted/10 flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => step > 1 ? setStep(step - 1) : onClose()}
              disabled={isSubmitting}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {step === 1 ? "Annuler" : "Précédent"}
            </Button>

            <div className="flex gap-3">
              {step < 4 ? (
                <Button
                  onClick={() => {
                    if (step === 1 && !selectedOffer) { toast.error("Veuillez sélectionner une offre"); return; }
                    if (step === 3 && (!formData.name || !formData.email)) { toast.error("Nom et Email requis"); return; }
                    setStep(step + 1);
                  }}
                >
                  Suivant
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                        <Zap className="w-4 h-4 mr-2" />
                      </motion.div>
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Confirmer la commande
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
