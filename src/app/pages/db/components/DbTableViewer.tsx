import { useState, useEffect, useCallback, useMemo } from "react";
import { supabaseDbAdmin } from "../../../../lib/supabaseDb";
import { Database, Table2, Loader2, RefreshCw, Search } from "lucide-react";

export function DbTableViewer({ allowedTables, companyId }: { allowedTables: string[], companyId?: string }) {
  const [data, setData]       = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [activeTable, setActiveTable] = useState<string>(allowedTables[0] || "");
  const [loading, setLoading] = useState(true);
  const [tableSearch, setTableSearch] = useState("");

  const filteredTables = useMemo(() => {
    return allowedTables.filter(t => t.toLowerCase().includes(tableSearch.toLowerCase()));
  }, [allowedTables, tableSearch]);

  const load = useCallback(async () => {
    if (!activeTable) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Load data for active table
      let dataQuery = supabaseDbAdmin.from(activeTable).select("*");
      
      if (companyId) {
        const { data: hasCol } = await supabaseDbAdmin.rpc('has_column', { target_table: activeTable, target_column: 'company_id' });
        if (hasCol) dataQuery = dataQuery.eq("company_id", companyId);
      }

      const { data: rows } = await dataQuery.limit(50);
      setData(rows || []);

      if (rows && rows.length > 0) {
        const allCols = Object.keys(rows[0]);
        // Always hide system columns and 'id' as requested
        const TO_HIDE = ["id", "company_id", "_record_key", "_record_idx", "_table", "_synced_at"];
        setColumns(allCols.filter(c => !TO_HIDE.includes(c)));
      } else {
        setColumns([]);
      }
    } finally { 
      setLoading(false); 
    }
  }, [activeTable, companyId]);

  useEffect(() => { load(); }, [load]);

  if (!allowedTables.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl h-full border border-border">
        <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-black text-foreground">Aucune table accessible</h3>
        <p className="text-sm text-muted-foreground mt-1">Demandez à votre administrateur d'autoriser des tables pour cet espace.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden p-1 shadow-inner bg-background/50 rounded-2xl">
      {/* Top Navbar: Table List & Search */}
      <nav className="w-full flex flex-col sm:flex-row items-center gap-3 p-3 bg-card border border-border rounded-xl shrink-0">
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
          <input 
            type="text"
            placeholder="Chercher une table..."
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-muted/30 border border-input rounded-xl outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/60"
          />
        </div>
        <div className="flex-1 w-full overflow-x-auto flex gap-2 custom-scrollbar pb-1">
          {filteredTables.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2 px-2 whitespace-nowrap">Aucune table trouvée</p>
          ) : (
            filteredTables.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTable(t)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 whitespace-nowrap border ${
                  activeTable === t 
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20" 
                    : "bg-background text-muted-foreground hover:bg-muted border-border hover:border-border/80"
                }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                {t}
              </button>
            ))
          )}
        </div>
      </nav>

      {/* Main Content: Data Table */}
      <div className="flex-1 flex flex-col min-w-0 bg-card border border-border rounded-xl overflow-hidden shadow-sm relative">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 bg-muted/10">
          <div className="flex items-center gap-2">
            <Table2 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-black text-foreground truncate">{activeTable}</h3>
          </div>
          <button 
            onClick={load} 
            disabled={loading}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all border border-border bg-background shadow-xs hover:shadow-sm disabled:opacity-50"
            title="Actualiser les données"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden relative min-h-0">
          {loading && !data.length ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px] z-20">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 opacity-60">
              <Database className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-xs font-bold text-muted-foreground">La table "{activeTable}" est vide</p>
            </div>
          ) : (
            <div className="h-full overflow-auto custom-scrollbar">
              <table className="w-full text-[11px] whitespace-nowrap border-separate border-spacing-0">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur-md z-10">
                  <tr>
                    {columns.map((col) => (
                      <th key={col} className="text-left px-4 py-3 font-black uppercase tracking-widest text-muted-foreground border-b border-border">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {data.map((row, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      {columns.map((col) => {
                        let val = row[col];
                        if (typeof val === "object" && val !== null) val = JSON.stringify(val);
                        else val = String(val ?? "—");

                        return (
                          <td key={col} className="px-4 py-2.5 text-foreground/80 max-w-full" title={val}>
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

