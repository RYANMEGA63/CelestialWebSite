import { motion } from "motion/react";
import { GitBranch, Zap, Bug, Shield, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { format } from "date-fns";

function EyebrowLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-body text-[11px] tracking-[0.2em] uppercase text-secondary font-medium mb-5">{children}</p>;
}

// Skeleton loader rows
function ChangelogSkeleton() {
  return (
    <div className="space-y-10">
      {[1, 2, 3].map((i) => (
        <div key={i} className="relative md:ml-20">
          <div className="skeleton h-5 w-20 mb-4 rounded" />
          <div className="border border-border p-7">
            <div className="skeleton h-4 w-28 mb-5 rounded" />
            <div className="skeleton h-6 w-48 mb-3 rounded" />
            <div className="skeleton h-4 w-full mb-2 rounded" />
            <div className="skeleton h-4 w-3/4 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

const typeConfig: Record<string, { label: string; color: string; bg: string; border: string; Icon: any }> = {
  feature:     { label: "Feature",         color: "text-secondary",         bg: "bg-secondary/8",      border: "border-secondary/30",   Icon: Sparkles },
  improvement: { label: "Improvement",     color: "text-amber-500",         bg: "bg-amber-500/8",      border: "border-amber-500/30",   Icon: Zap },
  fix:         { label: "Fix",             color: "text-red-500",           bg: "bg-red-500/8",        border: "border-red-500/30",     Icon: Bug },
  security:    { label: "Security",        color: "text-emerald-500",       bg: "bg-emerald-500/8",    border: "border-emerald-500/30", Icon: Shield },
  breaking:    { label: "Breaking",        color: "text-orange-500",        bg: "bg-orange-500/8",     border: "border-orange-500/30",  Icon: AlertCircle },
  removed:     { label: "Removed",         color: "text-orange-500",        bg: "bg-orange-500/8",     border: "border-orange-500/30",  Icon: AlertCircle },
  default:     { label: "Update",          color: "text-muted-foreground",  bg: "bg-muted",            border: "border-border",         Icon: CheckCircle2 },
};

function getType(type: string) {
  return typeConfig[type] ?? typeConfig.default;
}

const versionBadgeClass: Record<string, string> = {
  major: "bg-secondary text-white",
  minor: "bg-muted text-secondary border border-secondary/30",
  patch: "bg-muted text-muted-foreground border border-border",
};

export function Changelog() {
  const [changes, setChanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("changelog_entries").select("*, changelog_items(*)")
      .order("date", { ascending: false })
      .then(({ data }) => { setChanges(data || []); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Page header — editorial style */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-16 py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <EyebrowLabel>Historique des versions</EyebrowLabel>
            <h1 className="text-foreground mb-5">Changelog</h1>
            <p className="text-muted-foreground font-body text-lg font-light max-w-xl leading-relaxed">
              Toutes les mises à jour, nouvelles fonctionnalités et corrections de bugs — version par version.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Timeline content */}
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        {loading ? (
          <ChangelogSkeleton />
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[1.875rem] top-0 bottom-0 w-px bg-border hidden md:block" />

            <div className="space-y-10">
              {changes.map((change, index) => (
                <motion.div key={change.id || change.version}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.07 }}
                  className="relative">

                  {/* Timeline diamond dot */}
                  <div className="absolute left-6 top-7 w-4 h-4 rotate-45 bg-secondary border-2 border-background hidden md:block"
                    style={{ marginLeft: "-0.5rem" }} />

                  <div className="md:ml-20">
                    {/* Version badge + date */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className={`font-mono text-[11px] px-2.5 py-1 font-medium tracking-wide ${versionBadgeClass[change.version_type ?? "patch"] ?? versionBadgeClass.patch}`}>
                        v{change.version}
                      </span>
                      <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-body">
                        {change.date ? format(new Date(change.date), "dd MMMM yyyy") : ""}
                      </span>
                    </div>

                    {/* Entry card */}
                    <div className="border border-border bg-card p-7">
                      {change.title && (
                        <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: "var(--font-display)" }}>
                          {change.title}
                        </h3>
                      )}
                      {change.description && (
                        <p className="text-muted-foreground font-body text-sm font-light leading-relaxed mb-6">
                          {change.description}
                        </p>
                      )}

                      {/* Items list */}
                      <div className="space-y-3 border-t border-border pt-6">
                        {(change.changelog_items || change.items || []).map((item: any, idx: number) => {
                          const t = getType(item.type ?? "default");
                          const Icon = t.Icon;
                          return (
                            <div key={idx}
                              className={`flex items-start gap-3 p-3.5 border-l-2 ${t.border} bg-background/60 transition-colors hover:bg-muted/30`}>
                              <div className={`mt-0.5 w-6 h-6 flex items-center justify-center shrink-0 ${t.bg} ${t.color}`}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <span className={`text-[9px] font-mono tracking-[0.15em] uppercase font-semibold ${t.color}`}>
                                  {t.label}
                                </span>
                                <p className="text-foreground font-body text-sm mt-0.5 leading-snug">
                                  {item.content || item.title}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* CTA strip at bottom */}
        {!loading && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="mt-16 border-t border-border pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <GitBranch className="w-5 h-5 text-secondary shrink-0" />
              <div>
                <p className="text-foreground font-body text-sm font-medium">Restez informé</p>
                <p className="text-muted-foreground font-body text-xs font-light mt-0.5">
                  Inscrivez-vous à notre newsletter pour les notifications de mise à jour.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Sparkles className="w-5 h-5 text-secondary shrink-0" />
              <div>
                <p className="text-foreground font-body text-sm font-medium">Roadmap</p>
                <p className="text-muted-foreground font-body text-xs font-light mt-0.5">
                  Découvrez les fonctionnalités à venir dans notre roadmap publique.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
