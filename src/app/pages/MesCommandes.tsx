import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Card, CardHeader, CardContent } from "../components/Card";
import { Button } from "../components/Button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ExternalLink,
  Mail,
  Zap,
  Tag
} from "lucide-react";

const STATUS_MAP = {
  nouveau: { label: "Nouveau", color: "bg-blue-500/10 text-blue-500", icon: Clock },
  en_cours: { label: "En préparation", color: "bg-yellow-500/10 text-yellow-500", icon: Loader2 },
  termine: { label: "Terminé", color: "bg-green-500/10 text-green-500", icon: CheckCircle2 },
  annule: { label: "Annulé", color: "bg-red-500/10 text-red-500", icon: XCircle },
};

export function MesCommandes() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[] | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("client_email", email.trim())
      .order("created_at", { ascending: false });

    if (!error) {
      setOrders(data || []);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-b border-border/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl sm:text-6xl font-black mb-6 tracking-tight">Suivi de commande</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Retrouvez l'état de vos projets et commandes en un clin d'œil.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        {!orders ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="p-8 border-primary/20 shadow-2xl rounded-3xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-10 -mt-10 blur-3xl" />
              <CardHeader className="text-center pb-8 border-b border-border/50">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Consulter mon historique</h2>
                <p className="text-muted-foreground mt-2">Saisissez l'adresse email utilisée lors de votre commande.</p>
              </CardHeader>
              <CardContent className="pt-8">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input 
                    required
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-6 py-4 rounded-2xl border-2 border-border focus:border-primary outline-none bg-card transition-all text-lg font-medium"
                  />
                  <Button type="submit" size="lg" disabled={loading} className="h-full px-8 rounded-2xl text-lg font-bold">
                    {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "Rechercher"}
                  </Button>
                </form>
                <p className="text-center text-xs text-muted-foreground mt-8 italic">
                  Besoin d'aide ? Contactez notre <a href="/contact" className="text-primary hover:underline">support client</a>.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center bg-muted/30 p-6 rounded-3xl border border-border">
              <div>
                <h2 className="text-xl font-bold">Commandes pour <span className="text-primary">{email}</span></h2>
                <p className="text-sm text-muted-foreground">{orders.length} projet{orders.length > 1 ? "s" : ""} trouvé{orders.length > 1 ? "s" : ""}</p>
              </div>
              <Button variant="ghost" onClick={() => setOrders(null)} size="sm" className="rounded-xl">
                Changer d'email
              </Button>
            </div>

            <AnimatePresence>
              {orders.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
                  <Search className="w-12 h-12 mx-auto text-muted-foreground opacity-30 mb-4" />
                  <h3 className="text-xl font-bold">Aucune commande trouvée</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto mt-2">Nous n'avons trouvé aucun projet associé à cette adresse email.</p>
                  <Button href="/offres" className="mt-8 rounded-2xl">Découvrir nos offres</Button>
                </motion.div>
              ) : (
                <div className="grid gap-6">
                  {orders.map((order, idx) => {
                    const status = STATUS_MAP[order.status as keyof typeof STATUS_MAP] || STATUS_MAP.nouveau;
                    const StatusIcon = status.icon;
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className="hover:border-primary/30 transition-all rounded-3xl border-border/50 group overflow-hidden">
                          <CardHeader className="flex flex-row justify-between items-start bg-muted/10 p-8 border-b border-border/30">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${status.color}`}>
                                  <StatusIcon className="w-3.5 h-3.5" />
                                  {status.label}
                                </span>
                                <span className="text-xs text-muted-foreground font-medium">#{order.id.slice(0, 8)}</span>
                              </div>
                              <h3 className="text-2xl font-black group-hover:text-primary transition-colors">{order.offer_title}</h3>
                              <p className="text-muted-foreground text-sm mt-1">Commandé le {new Date(order.created_at).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-muted-foreground uppercase opacity-50 mb-1">Total</p>
                              <span className="font-bold text-lg">{order.total_price}</span>
                            </div>
                          </CardHeader>
                          <CardContent className="p-8 space-y-6">
                            {order.selected_services && order.selected_services.length > 0 && (
                              <div className="space-y-3">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Options incluses :</p>
                                <div className="flex flex-wrap gap-2">
                                  {order.selected_services.map((s: any, i: number) => (
                                    <span key={i} className="px-4 py-2 bg-muted rounded-2xl text-xs font-bold flex items-center gap-2 border border-border">
                                      <Zap className="w-3 h-3 text-primary" />
                                      {s.title}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {order.promo_code && (
                              <div className="flex items-center gap-2 text-green-600 bg-green-500/5 p-3 rounded-2xl border border-green-500/10 w-fit">
                                <Tag className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-tighter">Code promo : {order.promo_code}</span>
                              </div>
                            )}

                            <div className="pt-6 border-t border-border/50 flex flex-col md:flex-row justify-between gap-4">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
                                <Package className="w-4 h-4" />
                                Statut actuel : <strong>{status.label}</strong>
                              </div>
                              <Button variant="outline" className="rounded-2xl gap-2 font-bold px-6">
                                Détails complets
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
