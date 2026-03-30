import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Card, CardContent, CardHeader } from "../../components/Card";
import { Button } from "../../components/Button";
import { 
  Mail, 
  Search, 
  Trash2, 
  Eye, 
  Archive, 
  CheckCircle2, 
  MessageSquare,
  Clock,
  Filter,
  User,
  Building,
  ChevronLeft
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function AdminMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSource, setFilterSource] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    setLoading(true);
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      toast.error("Erreur lors de la récupération des messages");
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  }

  const handleMarkAsRead = async (id: string) => {
    const { error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("id", id);
    
    if (error) {
      toast.error("Erreur lors de la mise à jour");
    } else {
      setMessages(messages.map(m => m.id === id ? { ...m, is_read: true } : m));
      if (selectedMessage?.id === id) setSelectedMessage({ ...selectedMessage, is_read: true });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce message définitivement ?")) return;
    
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", id);
    
    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success("Message supprimé");
      setMessages(messages.filter(m => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    }
  };

  const filtered = messages.filter(m => {
    const matchSource = filterSource === "all" || m.source === filterSource;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || 
      m.sender_name?.toLowerCase().includes(q) || 
      m.sender_email?.toLowerCase().includes(q) ||
      m.subject?.toLowerCase().includes(q);
    return matchSource && matchSearch;
  });

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h2 className="text-xl sm:text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            Messages
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">Formulaires de contact et commandes.</p>
        </div>
        {unreadCount > 0 && (
          <div className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold flex items-center gap-2 shrink-0">
            <Clock className="w-3.5 h-3.5" />
            {unreadCount} nouveau{unreadCount > 1 ? "x" : ""}
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher un expéditeur ou un sujet..."
            className="w-full pl-10 pr-4 py-2 border rounded-xl bg-card text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={filterSource === "all" ? "primary" : "outline"} 
            onClick={() => setFilterSource("all")}
            size="sm"
          >
            Tous
          </Button>
          <Button 
            variant={filterSource === "contact" ? "primary" : "outline"} 
            onClick={() => setFilterSource("contact")}
            size="sm"
          >
            Contact
          </Button>
          <Button 
            variant={filterSource === "order" ? "primary" : "outline"} 
            onClick={() => setFilterSource("order")}
            size="sm"
          >
            Commandes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Messages List — hidden on mobile when a message is selected */}
        <div className={`lg:col-span-1 space-y-2 overflow-y-auto max-h-[60vh] lg:max-h-[70vh] pr-1 ${
          selectedMessage ? "hidden lg:block" : "block"
        }`}>
          {loading ? (
            <div className="text-center py-12">
              <Clock className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Chargement...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border">
              <Mail className="w-8 h-8 mx-auto text-muted-foreground opacity-30" />
              <p className="mt-4 text-muted-foreground">Aucun message trouvé.</p>
            </div>
          ) : (
            filtered.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div 
                  onClick={() => {
                    setSelectedMessage(msg);
                    if (!msg.is_read) handleMarkAsRead(msg.id);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-md ${
                    selectedMessage?.id === msg.id 
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                      : msg.is_read 
                        ? "border-border bg-card opacity-70" 
                        : "border-primary/30 bg-card font-semibold"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      msg.source === "order" ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600"
                    }`}>
                      {msg.source}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(msg.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <h4 className="text-sm truncate">{msg.subject || "Sans sujet"}</h4>
                  <p className="text-xs text-muted-foreground font-normal truncate mt-1">
                    {msg.sender_name}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedMessage ? (
              <motion.div
                key={selectedMessage.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="h-full border-primary/20">
                  <CardHeader className="border-b border-border pb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <button onClick={() => setSelectedMessage(null)} className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border/50 text-xs font-bold mb-4 active:scale-95 transition-all">
                        <ChevronLeft className="w-4 h-4" /> Retour à la liste
                      </button>
                      <h3 className="text-xl sm:text-2xl font-bold mb-1">{selectedMessage.subject || "Sans sujet"}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {selectedMessage.sender_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {selectedMessage.sender_email}
                        </span>
                        {selectedMessage.sender_company && (
                          <span className="flex items-center gap-1">
                            <Building className="w-4 h-4" />
                            {selectedMessage.sender_company}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleDelete(selectedMessage.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-8 min-h-[400px]">
                    <div className="bg-muted/30 p-8 rounded-3xl text-lg leading-relaxed whitespace-pre-line">
                      {selectedMessage.body}
                    </div>
                    
                    <div className="mt-12 pt-8 border-t border-border flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                        Fermer
                      </Button>
                      <Button href={`mailto:${selectedMessage.sender_email}?subject=Re: ${selectedMessage.subject}`}>
                        Répondre par email
                        <Mail className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 bg-muted/10 rounded-3xl border border-dashed border-border opacity-50">
                <MessageSquare className="w-16 h-16 mb-6 text-muted-foreground" />
                <h3 className="text-xl font-bold">Sélectionnez un message</h3>
                <p className="text-muted-foreground mt-2">Cliquez sur un message dans la liste pour lire le contenu</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
