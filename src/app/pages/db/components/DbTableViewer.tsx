import { useState, useEffect, useCallback, useMemo } from "react";
import { supabaseDbAdmin } from "../../../../lib/supabaseDb";
import { Database, Table2, Loader2, RefreshCw, Search, ChevronUp, ChevronDown } from "lucide-react";

type SortDir = "asc" | "desc" | null;

export function DbTableViewer({ allowedTables, companyId, showIdColumn }: { allowedTables: string[], companyId?: string, showIdColumn?: boolean }) {
  const [data, setData]               = useState<any[]>([]);
  const [columns, setColumns]         = useState<string[]>([]);
  const [activeTable, setActiveTable] = useState<string>(allowedTables[0] || "");
  const [loading, setLoading]         = useState(true);
  const [tableSearch, setTableSearch] = useState("");
  const [rowSearch, setRowSearch]     = useState("");
  const [companySearchInput, setCompanySearchInput] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [sortCol, setSortCol]         = useState<string | null>(null);
  const [sortDir, setSortDir]         = useState<SortDir>(null);

  const filteredTables = useMemo(() =>
    allowedTables.filter(t => t.toLowerCase().includes(tableSearch.toLowerCase())),
    [allowedTables, tableSearch]
  );

  const load = useCallback(async () => {
    if (!activeTable) { setLoading(false); return; }
    setLoading(true);
    setSelectedRow(null);
    try {
      let dataQuery = supabaseDbAdmin.from(activeTable).select("*");
      if (companyId) {
        const { data: hasCol } = await supabaseDbAdmin.rpc("has_column", { target_table: activeTable, target_column: "company_id" });
        if (hasCol) dataQuery = dataQuery.eq("company_id", companyId);
      }
      if (companySearch.trim()) {
        dataQuery = dataQuery.eq("company_id", companySearch.trim());
      }
      const { data: rows } = await dataQuery.limit(200);
      setData(rows || []);
      if (rows && rows.length > 0) {
        const TO_HIDE = ["_record_key", "_record_idx", "_table", "_synced_at"];
        if (!showIdColumn) {
          TO_HIDE.push("id");
          TO_HIDE.push("company_id");
        }
        setColumns(Object.keys(rows[0]).filter(c => !TO_HIDE.includes(c)));
      } else {
        setColumns([]);
      }
    } finally {
      setLoading(false);
    }
  }, [activeTable, companyId, companySearch, showIdColumn]);

  useEffect(() => { load(); }, [load]);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir(d => d === "asc" ? "desc" : d === "desc" ? null : "asc");
      if (sortDir === "desc") setSortCol(null);
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const sortedData = useMemo(() => {
    let d = [...data];
    if (rowSearch) {
      const q = rowSearch.toLowerCase();
      d = d.filter(row => columns.some(col => String(row[col] ?? "").toLowerCase().includes(q)));
    }
    if (sortCol && sortDir) {
      d.sort((a, b) => {
        const av = a[sortCol] ?? "";
        const bv = b[sortCol] ?? "";
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return d;
  }, [data, rowSearch, sortCol, sortDir, columns]);

  if (!allowedTables.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full border border-border bg-card">
        <Database className="w-8 h-8 text-muted-foreground mb-2 opacity-40" />
        <p className="text-[12px] font-semibold text-foreground">Aucune table accessible</p>
        <p className="text-[11px] text-muted-foreground mt-1">Demandez à votre administrateur d'autoriser des tables.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex overflow-hidden border border-border bg-card">

      {/* ── Left Panel: Table list (TreeView style) ── */}
      <aside className="db-table-sidebar w-[160px] shrink-0 flex flex-col border-r border-border bg-toolbar overflow-hidden">
        {/* Search */}
        <div className="db-table-sidebar-search p-1 border-b border-border">
          <div className="flex items-center gap-1 border border-border bg-surface-sunken px-1.5 py-0.5">
            <Search className="w-3 h-3 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Filtrer..."
              value={tableSearch}
              onChange={e => setTableSearch(e.target.value)}
              className="flex-1 bg-transparent text-[11px] text-foreground placeholder:text-muted-foreground outline-none min-w-0"
            />
          </div>
        </div>
        {/* Table list */}
        <div className="flex-1 overflow-y-auto">
          <div className="db-table-sidebar-label px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground tracking-wider border-b border-border">
            Tables ({filteredTables.length})
          </div>
          {filteredTables.length === 0 ? (
            <p className="px-2 py-1.5 text-[11px] text-muted-foreground italic">Aucun résultat</p>
          ) : (
            filteredTables.map(t => (
              <button
                key={t}
                onClick={() => { setActiveTable(t); setSortCol(null); setSortDir(null); setCompanySearchInput(""); setCompanySearch(""); }}
                className={`w-full flex items-center gap-1.5 px-2 py-1 text-[11px] text-left border-b border-border/50 ${
                  activeTable === t
                    ? "bg-golden text-golden-foreground font-semibold"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <Table2 className="w-3 h-3 shrink-0 opacity-70" />
                <span className="truncate">{t}</span>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ── Right Panel: DataGrid ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Grid toolbar */}
        <div className="iup-toolbar shrink-0">
          <Table2 className="w-3.5 h-3.5 text-golden shrink-0" />
          <span className="text-[12px] font-semibold text-foreground mr-2">{activeTable}</span>
          {/* Row count */}
          {!loading && (
            <span className="text-[11px] text-muted-foreground mr-2">
              {sortedData.length}/{data.length} lignes
            </span>
          )}
          <div className="toolbar-sep" />
          {/* Row search */}
          <div className="flex items-center gap-1 border border-border bg-surface-sunken px-1.5 py-0.5">
            <Search className="w-3 h-3 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={rowSearch}
              onChange={e => setRowSearch(e.target.value)}
              className="bg-transparent text-[11px] text-foreground placeholder:text-muted-foreground outline-none w-28"
            />
          </div>
          {showIdColumn && (
            <>
              <div className="toolbar-sep ml-2" />
              <form onSubmit={(e) => { e.preventDefault(); setCompanySearch(companySearchInput); }} className="flex items-center gap-1 border border-border bg-surface-sunken px-1.5 py-0.5 ml-1">
                <Search className="w-3 h-3 text-golden shrink-0" />
                <input
                  type="text"
                  placeholder="Company ID..."
                  value={companySearchInput}
                  onChange={e => setCompanySearchInput(e.target.value)}
                  className="bg-transparent text-[11px] text-foreground placeholder:text-muted-foreground outline-none w-24"
                />
              </form>
              {companySearch && (
                <button type="button" onClick={() => { setCompanySearchInput(""); setCompanySearch(""); }} className="ml-1 px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground">
                  Effacer
                </button>
              )}
            </>
          )}
          <div className="ml-auto" />
          {/* Refresh */}
          <button
            onClick={load}
            disabled={loading}
            title="Actualiser"
            className="flex items-center gap-1 px-2 py-0.5 text-[11px] text-foreground border border-border bg-muted hover:bg-[#D0CCC4] disabled:opacity-50 bevel-raised"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </button>
        </div>

        {/* DataGrid */}
        <div className="flex-1 overflow-auto relative">
          {loading && !data.length ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70 z-20">
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-golden" />
                Chargement…
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Database className="w-6 h-6 mb-2 opacity-40" />
              <p className="text-[12px]">La table « {activeTable} » est vide</p>
            </div>
          ) : (
            <div className="iup-table-wrap">
              <table className="iup-table">
                <thead>
                  <tr>
                    <th className="w-8 text-center">#</th>
                    {columns.map(col => (
                      <th
                        key={col}
                        onClick={() => handleSort(col)}
                        className={`${sortCol === col ? "bg-[color-mix(in_srgb,_var(--golden)_20%,_var(--grid-header-bg))]" : ""}`}
                      >
                        <span className="flex items-center gap-1">
                          {col}
                          {sortCol === col && sortDir === "asc"  && <ChevronUp className="w-3 h-3 shrink-0" />}
                          {sortCol === col && sortDir === "desc" && <ChevronDown className="w-3 h-3 shrink-0" />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((row, i) => {
                    let val: string;
                    return (
                      <tr
                        key={i}
                        onClick={() => setSelectedRow(i === selectedRow ? null : i)}
                        className={`cursor-default ${i === selectedRow ? "selected" : "grid-row"}`}
                      >
                        <td className="text-center text-muted-foreground text-[10px] select-none w-8">{i + 1}</td>
                      {columns.map(col => {
                        val = row[col];
                        if (typeof val === "object" && val !== null) val = JSON.stringify(val);
                        else val = String(val ?? "—");
                        return (
                          <td key={col} title={val}>
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-4 px-2 py-0.5 border-t border-border bg-toolbar text-[10px] text-muted-foreground shrink-0">
          <span>Table : <strong className="text-foreground">{activeTable}</strong></span>
          {!loading && <span>{sortedData.length} enregistrement(s)</span>}
          {selectedRow !== null && <span>Ligne sélectionnée : {selectedRow + 1}</span>}
          {sortCol && <span>Tri : {sortCol} {sortDir}</span>}
          <span className="ml-auto flex items-center gap-1">
            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
            {loading ? "Chargement…" : "Prêt"}
          </span>
        </div>
      </div>
    </div>
  );
}
