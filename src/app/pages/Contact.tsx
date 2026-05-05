import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { Card, CardContent } from "../components/Card";
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
  Loader2,
  Share2,
} from "lucide-react";

// ── Shared eyebrow ──────────────────────────────────────────
function EyebrowLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body text-[10px] tracking-[0.25em] uppercase text-secondary font-medium mb-6">
      {children}
    </p>
  );
}

export function Contact() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      const { data } = await supabase.from("site_settings").select("*");
      if (data) {
        const s: Record<string, string> = {};
        data.forEach((item: any) => { s[item.key] = item.value; });
        setSettings(s);
      }
      setLoading(false);
    }
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus("sending");
    const formData = new FormData(e.currentTarget);
    const messageData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    const { error } = await supabase.from("messages").insert([messageData]);

    if (error) {
      toast.error("Erreur lors de l'envoi du message.");
      setFormStatus("error");
    } else {
      toast.success("Message envoyé avec succès !");
      setFormStatus("success");
      await sendWebhookNotification("contact", {
        title: "Nouveau message de contact",
        message: `De: ${messageData.name} (${messageData.email})\nSujet: ${messageData.subject}\nMessage: ${messageData.message}`,
        color: "#2D7DD2",
      });
      (e.target as HTMLFormElement).reset();
    }
  };

  // Unified icon color — no rainbow per-card
  const contactInfo = [
    {
      icon: <Phone className="w-4 h-4" />,
      title: "Téléphone",
      value: settings["contact_phone_1"] || settings["contact_phone_2"],
      label: "Support technique",
    },
    {
      icon: <Mail className="w-4 h-4" />,
      title: "Email",
      value: settings["contact_email_main"],
      label: "Contact général",
    },
    {
      icon: <MapPin className="w-4 h-4" />,
      title: "Bureau",
      value: settings["contact_address_line1"],
      label: settings["contact_address_line2"],
    },
    {
      icon: <Clock className="w-4 h-4" />,
      title: "Horaires",
      value: settings["contact_hours_weekday"],
      label: settings["contact_hours_weekend"],
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 px-6">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="h-3 w-24 mb-6" />
          <Skeleton className="h-10 w-2/3 mb-16" />
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
              </div>
              <Skeleton className="h-64 w-full" />
            </div>
            <Skeleton className="h-[500px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Input field style — consistent, luxury minimal
  const inputCls =
    "w-full font-body text-sm bg-muted/60 border border-border/60 px-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:border-secondary focus:outline-none transition-colors duration-200";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Page header */}
      <section className="pt-16 pb-16 border-b border-border/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <EyebrowLabel>Contactez-nous</EyebrowLabel>
            <h1 className="text-foreground mb-6">
              Donnez vie à vos <em className="text-secondary">idées</em> digitales.
            </h1>
            <p className="text-muted-foreground font-body text-lg font-light leading-relaxed max-w-xl">
              Besoin de moderniser votre présence en ligne ? Notre équipe est prête à vous accompagner dans chaque étape.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 lg:px-16 mt-16">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-24">

          {/* ── Left: Info ────────────────────────────────── */}
          <div className="space-y-8">
            {/* Contact info grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {contactInfo.map((info, idx) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full p-6 border-border/40 hover:border-secondary/30 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 flex items-center justify-center text-secondary border border-secondary/20 bg-secondary/5">
                        {info.icon}
                      </div>
                      <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground/50">
                        {info.title}
                      </p>
                    </div>
                    <p className="font-body text-sm text-foreground font-medium mb-1">
                      {info.value || "À définir"}
                    </p>
                    <p className="font-body text-xs text-muted-foreground font-light">
                      {info.label}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {(settings["contact_address_line1"] || settings["contact_address_line2"]) ? (
                <div className="overflow-hidden border border-border/40 h-72 relative group">
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
                  {/* Address overlay on hover */}
                  <div className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border/40 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-secondary shrink-0" strokeWidth={1.5} />
                      <p className="font-body text-sm text-foreground">
                        {[settings["contact_address_line1"], settings["contact_address_line2"]]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-muted/30 border border-dashed border-border h-72">
                  <MapPin className="w-10 h-10 text-muted-foreground/20 mb-4" />
                  <p className="font-body text-sm text-muted-foreground/50">
                    Configurez votre adresse dans l'admin
                  </p>
                </div>
              )}
            </motion.div>

            {/* Social row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 border border-border/40 bg-muted/30">
              <div className="flex items-center gap-3">
                <Share2 className="w-4 h-4 text-secondary" strokeWidth={1.5} />
                <span className="font-body text-sm text-muted-foreground">Suivez notre aventure</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: <Facebook className="w-4 h-4" />, href: settings["social_facebook"] },
                  { icon: <Instagram className="w-4 h-4" />, href: settings["social_instagram"] },
                  { icon: <Linkedin className="w-4 h-4" />, href: settings["social_linkedin"] },
                  { icon: <Twitter className="w-4 h-4" />, href: settings["social_twitter"] },
                ]
                  .filter(s => s.href)
                  .map((s, i) => (
                    <a
                      key={i}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 flex items-center justify-center border border-border/50 text-muted-foreground hover:border-secondary hover:text-secondary transition-all duration-200"
                    >
                      {s.icon}
                    </a>
                  ))}
              </div>
            </div>
          </div>

          {/* ── Right: Form ───────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="sticky top-28 border border-border/50 bg-card overflow-hidden">
              {/* Form header */}
              <div className="px-8 py-6 border-b border-border/40 flex items-center gap-4">
                <div className="w-8 h-8 flex items-center justify-center border border-secondary/20 bg-secondary/5 text-secondary">
                  <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="font-body text-base font-medium text-foreground">
                    Envoyez un message
                  </h2>
                  <p className="font-body text-xs text-muted-foreground">
                    Réponse sous 24h ouvrées.
                  </p>
                </div>
              </div>

              <div className="p-8">
                <AnimatePresence mode="wait">
                  {formStatus === "success" ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-12 text-center space-y-4"
                    >
                      <div className="w-16 h-16 border border-secondary/20 bg-secondary/5 text-secondary flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8" strokeWidth={1.5} />
                      </div>
                      <h3 className="font-body text-xl font-medium">Message envoyé !</h3>
                      <p className="font-body text-sm text-muted-foreground font-light">
                        Merci pour votre confiance. On vous recontacte très vite.
                      </p>
                      <button
                        onClick={() => setFormStatus("idle")}
                        className="mt-8 font-body text-[11px] tracking-[0.15em] uppercase text-secondary border border-secondary/20 px-6 py-3 hover:bg-secondary/5 transition-colors"
                      >
                        Envoyer un autre message
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      className="space-y-5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60">
                            Nom complet
                          </label>
                          <input
                            name="name"
                            required
                            placeholder="Jean Dupont"
                            className={inputCls}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60">
                            Email
                          </label>
                          <input
                            name="email"
                            type="email"
                            required
                            placeholder="jean@exemple.com"
                            className={inputCls}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60">
                          Sujet
                        </label>
                        <input
                          name="subject"
                          required
                          placeholder="Comment pouvons-nous vous aider ?"
                          className={inputCls}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60">
                          Message
                        </label>
                        <textarea
                          name="message"
                          required
                          rows={5}
                          placeholder="Décrivez votre projet..."
                          className={`${inputCls} resize-none`}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={formStatus === "sending"}
                        className="w-full font-body font-medium text-[11px] tracking-[0.15em] uppercase bg-secondary text-secondary-foreground py-4 flex items-center justify-center gap-3 hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {formStatus === "sending" ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4" strokeWidth={1.5} />
                            Envoyer le message
                          </>
                        )}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
