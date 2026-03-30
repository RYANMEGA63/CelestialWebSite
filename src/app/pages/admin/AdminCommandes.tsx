import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Card, CardContent, CardHeader } from "../../components/Card";
import { Button } from "../../components/Button";
import { 
  ShoppingCart, 
  Search, 
  Eye, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  History,
  TrendingUp,
  Package,
  Plus,
  ChevronLeft
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const STATUSES = [
  { value: "nouveau", label: "Nouveau", color: "bg-blue-500/10 text-blue-500", icon: Clock },
  { value: "en_cours", label: "En cours", color: "bg-yellow-500/10 text-yellow-500", icon: Loader2 },
  { value: "termine", label: "Terminé", color: "bg-green-500/10 text-green-500", icon: CheckCircle2 },
  { value: "annule", label: "Annulé", color: "bg-red-500/10 text-red-500", icon: XCircle },
];

export function AdminCommandes() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => { fetchOrders(); }, []);

  async function fetchOrders() {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) { toast.error("Erreur", { description: error.message }); return; }
    toast.success("Statut mis à jour");
    fetchOrders();
    if (selectedOrder?.id === id) setSelectedOrder({ ...selectedOrder, status });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette commande définitivement ?")) return;
    await supabase.from("orders").delete().eq("id", id);
    toast.success("Commande supprimée");
    if (selectedOrder?.id === id) setSelectedOrder(null);
    fetchOrders();
  };

  const filtered = orders.filter(o => {
    // Tab logic
    const isHistory = o.status === "termine" || o.status === "annule";
    const tabMatch = activeTab === "history" ? isHistory : !isHistory;
    
    // Status filter logic
    const statusMatch = filterStatus === "all" || o.status === filterStatus;
    
    // Search logic
    const q = searchQuery.toLowerCase();
    const searchMatch = !q ||
      o.client_name?.toLowerCase().includes(q) ||
      o.client_email?.toLowerCase().includes(q) ||
      o.client_company?.toLowerCase().includes(q) ||
      o.offer_title?.toLowerCase().includes(q);
      
    return tabMatch && statusMatch && searchMatch;
  });

  const getStatusInfo = (value: string) => STATUSES.find(s => s.value === value) || STATUSES[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-6">
        <div>
          <h2 className="text-xl sm:text-3xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            Commandes
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">Cycle de vie des projets clients.</p>
        </div>
        <div className="flex bg-muted p-1 rounded-xl w-full sm:w-auto">
          <button 
            onClick={() => { setActiveTab("active"); setFilterStatus("all"); }}
            className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === "active" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <TrendingUp className="w-4 h-4" />
            En cours
          </button>
          <button 
            onClick={() => { setActiveTab("history"); setFilterStatus("all"); }}
            className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === "history" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <History className="w-4 h-4" />
            Historique
          </button>
        </div>
      </div>

      {/* Stats / Filters */}
      <div className="flex gap-2 pb-2 overflow-x-auto custom-scrollbar">
        <Button 
          variant={filterStatus === "all" ? "primary" : "outline"}
          onClick={() => setFilterStatus("all")}
          size="sm"
        >
          Tout ({orders.filter(o => activeTab === "history" ? (o.status === "termine" || o.status === "annule") : (o.status !== "termine" && o.status !== "annule")).length})
        </Button>
        {STATUSES.filter(s => activeTab === "history" ? (s.value === "termine" || s.value === "annule") : (s.value !== "termine" && s.value !== "annule")).map(s => (
          <Button 
            key={s.value}
            variant={filterStatus === s.value ? "primary" : "outline"}
            onClick={() => setFilterStatus(s.value)}
            size="sm"
            className="flex items-center gap-2"
          >
            <span className={`w-2 h-2 rounded-full ${s.icon === Clock ? "bg-blue-500" : s.icon === Loader2 ? "bg-yellow-500" : s.icon === CheckCircle2 ? "bg-green-500" : "bg-red-500"}`} />
            {s.label} ({orders.filter(o => o.status === s.value).length})
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Rechercher par nom, email, entreprise ou offre..."
          className="w-full pl-10 pr-4 py-2 border rounded-xl bg-card text-sm"
        />
      </div>

      <div className={`grid gap-4 ${selectedOrder ? "lg:grid-cols-2" : ""}`}>
        <div className={`space-y-3 ${selectedOrder ? "hidden lg:block" : ""}`}>
          {loading ? (
            <p className="text-muted-foreground text-center py-12">Chargement des projets...</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 rounded-3xl border border-dashed border-border">
              <Package className="w-12 h-12 mx-auto text-muted-foreground opacity-20 mb-4" />
              <p className="text-muted-foreground">Aucun projet trouvé dans cette section.</p>
            </div>
          ) : (
            filtered.map(order => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              return (
                <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div
                    className={`cursor-pointer transition-all rounded-3xl ${selectedOrder?.id === order.id ? "ring-2 ring-primary" : ""}`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Card className={`overflow-hidden border-border/50 ${selectedOrder?.id === order.id ? "border-primary bg-primary/[0.02]" : "hover:border-primary/30"}`}>
                      <CardHeader className="flex flex-row justify-between items-start pb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-lg">{order.client_name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <p className="text-primary font-semibold text-sm">{order.offer_title}</p>
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="font-bold text-lg">{order.total_price}</span>
                          <button className="p-2 bg-muted rounded-full text-primary hover:bg-primary/10 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </CardHeader>
                    </Card>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedOrder && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card className="sticky top-6 rounded-3xl shadow-2xl border-primary/20 bg-card overflow-hidden">
                <div className="p-6 bg-gradient-to-br from-primary/10 to-transparent border-b border-border">
                  <button onClick={() => setSelectedOrder(null)} className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full bg-card shadow-sm border border-border/50 text-xs font-bold mb-6 active:scale-95 transition-all">
                    <ChevronLeft className="w-4 h-4" /> Retour à la liste
                  </button>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-black text-xl sm:text-2xl">{selectedOrder.client_name}</h3>
                      <p className="text-muted-foreground font-medium">{selectedOrder.client_email}</p>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-muted rounded-full">
                      <XCircle className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Offre</label>
                      <p className="font-bold text-primary">{selectedOrder.offer_title}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Prix Total</label>
                      <p className="font-black text-xl">{selectedOrder.total_price}</p>
                    </div>
                    {selectedOrder.client_company && (
                      <div className="col-span-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Entreprise</label>
                        <p className="font-semibold">{selectedOrder.client_company}</p>
                      </div>
                    )}
                    {selectedOrder.client_phone && (
                      <div className="col-span-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Téléphone</label>
                        <p className="font-semibold underline decoration-primary/30">{selectedOrder.client_phone}</p>
                      </div>
                    )}
                  </div>

                  {/* Services Additionnels */}
                  {selectedOrder.selected_services && selectedOrder.selected_services.length > 0 && (
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">Services sélectionnés</label>
                      <div className="space-y-2">
                        {selectedOrder.selected_services.map((s: any, i: number) => (
                          <div key={i} className="flex justify-between items-center p-3 bg-muted/30 rounded-2xl border border-border/50 text-sm">
                            <span className="font-medium flex items-center gap-2">
                              <Plus className="w-4 h-4 text-primary" />
                              {s.title}
                            </span>
                            <span className="font-bold text-muted-foreground">{s.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedOrder.message && (
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Détails du projet</label>
                      <p className="text-sm p-6 bg-muted/50 rounded-3xl border border-border/50 italic leading-relaxed">
                        "{selectedOrder.message}"
                      </p>
                    </div>
                  )}

                  {selectedOrder.promo_code && (
                    <div className="flex items-center gap-2 p-3 bg-green-500/5 border border-green-500/20 rounded-2xl">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-xs font-bold text-green-600 uppercase">Code Promo: {selectedOrder.promo_code}</span>
                    </div>
                  )}

                  <div className="space-y-4 pt-4 border-t border-border">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">Cycle de vie du projet</label>
                    <div className="grid grid-cols-2 gap-2">
                      {STATUSES.map(s => (
                        <button
                          key={s.value}
                          onClick={() => handleUpdateStatus(selectedOrder.id, s.value)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all border-2 ${
                            selectedOrder.status === s.value
                              ? `${s.color.replace('bg-', 'border-').split(' ')[0]} bg-card`
                              : "border-transparent bg-muted/50 hover:bg-muted"
                          }`}
                        >
                          <s.icon className="w-4 h-4" />
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <Button
                      variant="ghost"
                      onClick={() => handleDelete(selectedOrder.id)}
                      className="w-full text-red-500 hover:bg-red-500/10 rounded-2xl"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer ce projet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
