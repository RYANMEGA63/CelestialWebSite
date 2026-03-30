import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Button } from "../components/Button";
import { Card, CardHeader, CardContent } from "../components/Card";
import { Skeleton } from "../components/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { sendWebhookNotification } from "../../lib/notifications";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  MessageSquare,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  ChevronRight,
  Loader2,
  Share2,
  Globe
} from "lucide-react";

export function Contact() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      const { data } = await supabase.from("site_settings").select("*");
      if (data) {
        const s: Record<string, string> = {};
        data.forEach((item: any) => {
          s[item.key] = item.value;
        });
        setSettings(s);
      }
      setLoading(false);
    }
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('sending');
    const formData = new FormData(e.currentTarget);
    const messageData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    const { error } = await supabase.from('messages').insert([messageData]);
    
    if (error) {
      toast.error("Erreur lors de l'envoi du message.");
      setFormStatus('error');
    } else {
      toast.success("Message envoyé avec succès !");
      setFormStatus('success');
      // Notification LinkedIn/Webhook
      await sendWebhookNotification("contact", {
        title: 'Nouveau message de contact',
        message: `De: ${messageData.name} (${messageData.email})\nSujet: ${messageData.subject}\nMessage: ${messageData.message}`,
        color: '#4f46e5'
      });
      (e.target as HTMLFormElement).reset();
    }
  };

  const contactInfo = [
    {
      icon: <Phone className="w-5 h-5" />,
      title: "Téléphone",
      value: settings["contact_phone_1"] || settings["contact_phone_2"],
      label: "Support technique",
      color: "bg-blue-500/10 text-blue-500"
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Email",
      value: settings["contact_email_main"],
      label: "Contact général",
      color: "bg-purple-500/10 text-purple-500"
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "Bureau",
      value: settings["contact_address_line1"],
      label: settings["contact_address_line2"],
      color: "bg-emerald-500/10 text-emerald-500"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Horaires",
      value: settings["contact_hours_weekday"],
      label: settings["contact_hours_weekend"],
      color: "bg-amber-500/10 text-amber-500"
    }
  ];

  if (loading) return (
    <div className="min-h-screen bg-background pt-32 px-4 animate-in fade-in duration-700">
      <div className="mx-auto max-w-7xl">
        <Skeleton className="h-4 w-32 mb-4" />
        <Skeleton className="h-12 w-3/4 mb-16" />
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-3xl" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
          </div>
          <Skeleton className="h-[500px] w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24 selection:bg-primary/20">
      <section className="pt-32 pb-20 relative overflow-hidden bg-linear-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20 mb-8 uppercase tracking-widest"
            >
              <Globe className="w-3.5 h-3.5" />
              Contactez-nous
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tight"
            >
              Donnez vie à vos <span className="text-primary italic">idées</span> digitales.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground leading-relaxed max-w-2xl"
            >
              Besoin de moderniser votre présence en ligne ? Notre équipe est prête à vous accompagner.
            </motion.p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Info Side */}
          <div className="space-y-12">
            <div className="grid sm:grid-cols-2 gap-6">
              {contactInfo.map((info, idx) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full border-border/50 hover:border-primary/30 transition-all hover:translate-y-[-4px] overflow-hidden group">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-2xl ${info.color} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                        {info.icon}
                      </div>
                      <h3 className="font-black text-lg mb-2">{info.title}</h3>
                      <p className="font-medium text-foreground mb-1">{info.value || "À définir"}</p>
                      <p className="text-sm text-muted-foreground">{info.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Carte interactive réelle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              {(settings["contact_address_line1"] || settings["contact_address_line2"]) ? (
                <div className="rounded-3xl overflow-hidden border border-border/50 h-80 shadow-2xl group transition-all hover:border-primary/30 relative bg-muted animate-in zoom-in duration-500">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      [settings["contact_address_line1"], settings["contact_address_line2"]]
                        .filter(Boolean)
                        .join(", ")
                    )}&output=embed&z=15&t=m&hl=fr`}
                    allowFullScreen
                    loading="lazy"
                  />
                  <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur-md p-4 rounded-2xl border border-border/50 opacity-0 group-hover:opacity-100 transition-all shadow-2xl translate-y-2 group-hover:translate-y-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest ">Localisation</p>
                        <p className="text-sm font-bold">
                          {[settings["contact_address_line1"], settings["contact_address_line2"]].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-muted/30 rounded-3xl border border-dashed border-border h-80">
                  <MapPin className="w-16 h-16 text-primary/20 mb-4" />
                  <p className="text-muted-foreground font-medium">Configurez votre adresse dans l'admin</p>
                </div>
              )}
            </motion.div>

            <div className="flex items-center justify-between p-6 bg-muted/30 rounded-3xl border border-border/50">
              <div className="flex items-center gap-3">
                <Share2 className="w-5 h-5 text-secondary" />
                <span className="text-sm font-bold">Suivez notre aventure</span>
              </div>
              <div className="flex gap-4">
                 {[
                    { icon: <Facebook className="w-4 h-4" />, href: settings['social_facebook'] },
                    { icon: <Instagram className="w-4 h-4" />, href: settings['social_instagram'] },
                    { icon: <Linkedin className="w-4 h-4" />, href: settings['social_linkedin'] },
                    { icon: <Twitter className="w-4 h-4" />, href: settings['social_twitter'] }
                 ].filter(s => s.href).map((s, i) => (
                    <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-card border border-border/50 hover:border-primary/50 hover:text-primary transition-all">
                       {s.icon}
                    </a>
                 ))}
              </div>
            </div>
          </div>

          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-border/50 shadow-2xl rounded-[2.5rem] overflow-hidden sticky top-32">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary animate-pulse">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">Envoyez un message</h2>
                    <p className="text-sm text-muted-foreground">Réponse sous 24h ouvrées.</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                {formStatus === 'success' ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 text-center space-y-4"
                  >
                    <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black">Message Reçu !</h3>
                    <p className="text-muted-foreground">Merci pour votre confiance. On vous recontacte très vite.</p>
                    <Button variant="outline" className="mt-8 rounded-2xl" onClick={() => setFormStatus('idle')}>Envoyer un autre message</Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Nom Complet</label>
                        <input name="name" required placeholder="Ex: Jean Dupont" className="w-full bg-muted/50 border border-border/50 rounded-2xl px-5 py-3 focus:border-primary/50 focus:bg-background outline-none transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email</label>
                        <input name="email" type="email" required placeholder="jean@exemple.com" className="w-full bg-muted/50 border border-border/50 rounded-2xl px-5 py-3 focus:border-primary/50 focus:bg-background outline-none transition-all" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Sujet</label>
                      <input name="subject" required placeholder="Comment pouvons-nous vous aider ?" className="w-full bg-muted/50 border border-border/50 rounded-2xl px-5 py-3 focus:border-primary/50 focus:bg-background outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Message</label>
                      <textarea name="message" required rows={5} placeholder="Décrivez votre projet..." className="w-full bg-muted/50 border border-border/50 rounded-2xl px-5 py-4 focus:border-primary/50 focus:bg-background outline-none transition-all resize-none" />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 group"
                      disabled={formStatus === 'sending'}
                    >
                      {formStatus === 'sending' ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                          Propulser mon message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
