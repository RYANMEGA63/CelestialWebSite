import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../../../lib/supabase";
import { Card, CardContent, CardHeader } from "../../components/Card";
import { 
  Users, 
  Eye, 
  ArrowUpRight, 
  ShoppingBag, 
  MessageSquare, 
  Trash2, 
  RefreshCcw, 
  Calendar,
  TrendingUp,
  History,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "../../components/Button";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function Dashboard() {
  const [stats, setStats] = useState({ 
    totalVisits: 0, 
    uniqueVisits: 0,
    totalSales: 0,
    totalMessages: 0
  });
  const [recentVisits, setRecentVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<7 | 30>(7);
  const [chartData, setChartData] = useState<any[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);

  const scrollChart = (direction: 'left' | 'right') => {
    if (chartRef.current) {
      const scrollAmount = 300;
      chartRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const fetchStats = useCallback(async () => {
    setLoading(true);
    const now = new Date();
    const rangeDate = new Date();
    rangeDate.setDate(now.getDate() - timeRange);

    const [visitsRes, uniqueRes, salesRes, messagesRes, graphRes] = await Promise.all([
      supabase.from("page_visits").select("*", { count: "exact", head: true }),
      supabase.from("page_visits").select("*", { count: "exact", head: true }).eq("is_unique", true),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "Terminée"),
      supabase.from("messages").select("*", { count: "exact", head: true }),
      supabase.from("page_visits").select("created_at").gte("created_at", rangeDate.toISOString())
    ]);

    // Process graph data
    const days: any = {};
    for (let i = 0; i < timeRange; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days[dateStr] = 0;
    }

    if (graphRes.data) {
      graphRes.data.forEach((v: any) => {
        const dateStr = v.created_at.split('T')[0];
        if (days[dateStr] !== undefined) days[dateStr]++;
      });
    }

    const formattedChart = Object.keys(days).sort().map(date => ({
      date,
      count: days[date]
    }));

    setChartData(formattedChart);

    setStats({
      totalVisits: visitsRes.count || 0,
      uniqueVisits: uniqueRes.count || 0,
      totalSales: salesRes.count || 0,
      totalMessages: messagesRes.count || 0
    });

    // Fetch recent
    const { data: recent } = await supabase
      .from("page_visits")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    setRecentVisits(recent || []);

    setLoading(false);
  }, [timeRange]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const resetVisits = async () => {
    if (!confirm("Voulez-vous vraiment effacer tout l'historique des visites ? Cette action est irréversible.")) return;
    const { error } = await supabase.from("page_visits").delete().gte("created_at", "1970-01-01");
    
    if (error) {
      toast.error("Erreur : Assurez-vous d'avoir les permissions DELETE sur la table page_visits.");
      console.error(error);
    } else {
      toast.success("Historique effacé avec succès");
      fetchStats();
    }
  };

  const maxVisits = Math.max(...chartData.map(d => d.count), 1);

  if (loading && stats.totalVisits === 0) {
    return (
       <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
          <RefreshCcw className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Analyse des données en cours...</p>
       </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">Tableau de Bord</h2>
          <p className="text-muted-foreground mt-1 font-medium text-sm">Performance et activité de Celestial Website</p>
        </div>
        <div className="flex gap-2 shrink-0">
           <Button variant="outline" onClick={() => fetchStats()} className="rounded-xl border-border/50 text-sm">
              <RefreshCcw className="w-4 h-4 mr-2" /> Actualiser
           </Button>
           <Button variant="destructive" onClick={resetVisits} className="rounded-xl shadow-lg shadow-red-500/20 text-sm">
              <Trash2 className="w-4 h-4 mr-2" /> Effacer
           </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card hover className="rounded-2xl sm:rounded-[2.5rem] border-border/40 p-1 sm:p-2 overflow-hidden bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none p-3 sm:p-4">
            <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
              <ShoppingBag className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary/60 text-right leading-tight">Ventes</span>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <p className="text-3xl sm:text-5xl font-black">{stats.totalSales}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2">Commandes terminées</p>
          </CardContent>
        </Card>

        <Card hover className="rounded-2xl sm:rounded-[2.5rem] border-border/40 p-1 sm:p-2 overflow-hidden bg-secondary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none p-3 sm:p-4">
            <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-secondary text-white shadow-lg shadow-secondary/20">
              <MessageSquare className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-secondary/60 text-right leading-tight">Messages</span>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <p className="text-3xl sm:text-5xl font-black">{stats.totalMessages}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2">Demandes reçues</p>
          </CardContent>
        </Card>

        <Card hover className="rounded-2xl sm:rounded-[2.5rem] border-border/40 p-1 sm:p-2 overflow-hidden bg-muted/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none p-3 sm:p-4">
            <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-foreground text-background">
              <Eye className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right leading-tight">Visites</span>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <p className="text-3xl sm:text-5xl font-black">{stats.totalVisits}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2">Pages vues total</p>
          </CardContent>
        </Card>

        <Card hover className="rounded-2xl sm:rounded-[2.5rem] border-border/40 p-1 sm:p-2 overflow-hidden bg-muted/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none p-3 sm:p-4">
            <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-muted-foreground text-background">
              <Users className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right leading-tight">Uniques</span>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <p className="text-3xl sm:text-5xl font-black">{stats.uniqueVisits}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2">Visiteurs différents</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Visitor Graph */}
        <Card className="rounded-3xl sm:rounded-[3rem] border-border/40 p-4 sm:p-8 overflow-hidden relative shadow-sm">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-12">
              <div className="flex items-center gap-3">
                 <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-primary/10 text-primary">
                    <TrendingUp className="w-5 h-5" />
                 </div>
                 <div>
                    <h3 className="text-base sm:text-xl font-black tracking-tight uppercase">Activité Visiteurs</h3>
                    <p className="text-xs text-muted-foreground font-medium">Évolution du trafic</p>
                 </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="flex bg-muted/50 p-1 rounded-xl border border-border/30">
                    <button onClick={() => scrollChart('left')} className="p-1.5 hover:bg-background rounded-lg text-muted-foreground hover:text-primary transition-all">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => scrollChart('right')} className="p-1.5 hover:bg-background rounded-lg text-muted-foreground hover:text-primary transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex bg-muted/50 p-1 rounded-xl border border-border/30 shadow-inner flex-1 sm:flex-none">
                     <button onClick={() => setTimeRange(7)} className={`flex-1 sm:flex-none px-4 h-8 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${timeRange === 7 ? "bg-background text-primary shadow" : "text-muted-foreground hover:text-foreground"}`}>7J</button>
                     <button onClick={() => setTimeRange(30)} className={`flex-1 sm:flex-none px-4 h-8 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${timeRange === 30 ? "bg-background text-primary shadow" : "text-muted-foreground hover:text-foreground"}`}>30J</button>
                  </div>
               </div>
           </div>

           <div ref={chartRef} className="overflow-x-auto pt-10 px-2 border-b border-l border-border/30 hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
              <div 
                className="h-[300px] flex items-end justify-between gap-1 sm:gap-2 pb-2"
                style={{ minWidth: timeRange === 30 ? '1200px' : '100%' }}
              >
                  {chartData.map((d, i) => {
                    // Show labels for every day if 7d, or every 3rd day if 30d
                    const showLabel = timeRange === 7 || i % 3 === 0 || i === chartData.length - 1;
                    return (
                    <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                       <div 
                        className="w-full bg-linear-to-t from-primary/80 to-primary rounded-t-lg transition-all duration-700 hover:to-secondary cursor-pointer" 
                        style={{ height: `${(d.count / maxVisits) * 100}%`, minHeight: '4px' }}
                       >
                          {/* Tooltip */}
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-black px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                             {d.count} visites
                          </div>
                       </div>
                       <div className="mt-4 h-10 w-full flex justify-center">
                         {showLabel && (
                           <span className="text-[8px] font-black text-muted-foreground uppercase opacity-40 rotate-45 origin-left pt-2">
                              {d.date.split('-').slice(1).join('/')}
                           </span>
                         )}
                       </div>
                    </div>
                    );
                  })}
              </div>
           </div>
        </Card>

        {/* Recent Activity Table */}
        <Card className="rounded-3xl sm:rounded-[3rem] border-border/40 p-5 sm:p-8 md:p-12 shadow-sm overflow-hidden">
           <div className="flex items-center gap-4 mb-10">
              <div className="p-3 rounded-2xl bg-muted text-muted-foreground">
                 <History className="w-6 h-6" />
              </div>
              <div>
                 <h3 className="text-xl font-black tracking-tight uppercase">Dernières Visites</h3>
                 <p className="text-xs text-muted-foreground font-medium">Journal de navigation en temps réel</p>
              </div>
           </div>

           <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
              {recentVisits.map((visit) => (
                <div key={visit.id} className="group p-4 bg-muted/20 border border-border/30 rounded-2xl flex justify-between items-center hover:bg-muted/40 transition-all">
                  <div className="space-y-1 overflow-hidden pr-4">
                    <p className="text-xs font-black text-primary truncate tracking-tight">{visit.path}</p>
                    <p className="text-[10px] font-bold text-muted-foreground opacity-60">
                       {new Date(visit.created_at).toLocaleTimeString('fr-FR')} — {visit.origin || "Direct"}
                    </p>
                  </div>
                  <div className={`shrink-0 w-2.5 h-2.5 rounded-full ${visit.is_unique ? "bg-secondary shadow-[0_0_10px_rgba(6,182,212,0.5)]" : "bg-muted-foreground/30"}`} title={visit.is_unique ? "Visiteur Unique" : "Récurrent"} />
                </div>
              ))}
              {recentVisits.length === 0 && (
                 <div className="py-20 text-center border-2 border-dashed border-border/30 rounded-3xl opacity-30">
                    <History className="w-12 h-12 mx-auto mb-4" />
                    <p className="font-black uppercase text-xs">Aucune activité</p>
                 </div>
              )}
           </div>
        </Card>
      </div>
    </div>
  );
}
