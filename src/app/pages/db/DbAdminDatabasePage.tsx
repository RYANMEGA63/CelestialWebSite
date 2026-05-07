import { useState, useEffect, useCallback } from "react";
import { supabaseDbAdmin } from "../../../lib/supabaseDb";
import { Database, Loader2, RefreshCw } from "lucide-react";
import { DbTableViewer } from "./components/DbTableViewer";

export function DbAdminDatabasePage() {
  const [dbTables, setDbTables] = useState<string[]>([]);
  const [loading, setLoading]   = useState(true);

  const fetchTables = useCallback(async () => {
    setLoading(true);
    try {
      const { data: tablesData, error } = await supabaseDbAdmin.rpc('get_all_tables');
      if (error) {
        console.error("Failed to fetch tables:", error);
      } else if (tablesData) {
        setDbTables((tablesData as any[]).map(t => t.table_name));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-primary" />
            Base de données
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Explorateur global et complet des données du système
          </p>
        </div>
        <button onClick={fetchTables} disabled={loading} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground border border-border hover:bg-muted hover:text-foreground transition-all disabled:opacity-40">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {/* Viewer */}
      <div className="flex-1 overflow-hidden min-h-0">
        {loading && dbTables.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 justify-center h-full">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Chargement des tables de la base de données…</p>
          </div>
        ) : dbTables.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center h-full text-center">
            <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-black text-foreground">Base de données inaccessible</h3>
            <p className="text-sm text-muted-foreground mt-1">
              La fonction `get_all_tables()` n'est peut-être pas installée sur Supabase.
            </p>
          </div>
        ) : (
          <DbTableViewer allowedTables={dbTables} showIdColumn={true} />
        )}
      </div>
    </div>
  );
}
