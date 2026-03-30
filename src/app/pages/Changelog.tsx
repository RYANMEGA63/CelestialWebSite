import { Card, CardHeader, CardContent } from "../components/Card";
import { motion } from "motion/react";
import {
  GitBranch,
  Zap,
  Bug,
  Shield,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { format } from "date-fns";

export function Changelog() {
  const [changes, setChanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChangelog() {
      const { data } = await supabase
        .from("changelog_entries")
        .select("*, changelog_items(*)")
        .order("date", { ascending: false });
      setChanges(data || []);
      setLoading(false);
    }
    fetchChangelog();
  }, []);


  const getTypeIcon = (type: string) => {
    switch (type) {
      case "feature":
        return <Sparkles className="w-4 h-4" />;
      case "improvement":
        return <Zap className="w-4 h-4" />;
      case "fix":
        return <Bug className="w-4 h-4" />;
      case "security":
        return <Shield className="w-4 h-4" />;
      case "removed":
      case "breaking":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "feature":
        return "text-primary bg-primary/10";
      case "improvement":
        return "text-secondary bg-secondary/10";
      case "fix":
        return "text-destructive bg-destructive/10";
      case "security":
        return "text-accent bg-accent/10";
      case "removed":
      case "breaking":
        return "text-orange-500 bg-orange-500/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "feature":
        return "FEATURE";
      case "improvement":
        return "IMPROVEMENT";
      case "fix":
        return "FIX";
      case "security":
        return "SECURITY";
      case "removed":
        return "REMOVED";
      case "breaking":
        return "BREAKING CHANGE";
      default:
        return type.toUpperCase();
    }
  };

  const getVersionBadge = (type: string) => {
    switch (type) {
      case "major":
        return "bg-primary text-white";
      case "minor":
        return "bg-secondary text-white";
      case "patch":
        return "bg-muted text-foreground";
      default:
        return "bg-muted text-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-6">
              <GitBranch className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Changelog</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Suivez toutes les mises à jour, nouvelles fonctionnalités et corrections de bugs
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block"></div>

          <div className="space-y-12">
            {loading ? (
               <p className="text-center">Chargement du changelog...</p>
            ) : changes.map((change, index) => (
              <motion.div
                key={change.id || change.version}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Timeline dot */}
                <div className="absolute left-6 top-8 w-5 h-5 rounded-full bg-primary border-4 border-background hidden md:block"></div>

                <Card className="md:ml-20">
                  <CardHeader>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold text-primary bg-primary/10`}>
                        v{change.version}
                      </span>
                      <span className="text-sm text-muted-foreground">{change.date ? format(new Date(change.date), "dd MMMM yyyy") : ""}</span>
                    </div>
                    {change.title && <h3 className="text-xl font-bold mb-2">{change.title}</h3>}
                    {change.description && <p className="text-muted-foreground mb-4">{change.description}</p>}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(change.changelog_items || change.items || []).map((item: any, itemIndex: number) => (
                        <div
                          key={itemIndex}
                          className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className={`p-2 rounded-lg ${getTypeColor(item.type || 'feature')} flex-shrink-0`}>
                            {getTypeIcon(item.type || 'feature')}
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-semibold uppercase ${getTypeColor(item.type || 'feature')}`}>
                                {getTypeLabel(item.type || 'feature')}
                              </span>
                            </div>
                            <h3 className="font-medium">{item.content || item.title}</h3>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <GitBranch className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Restez informé</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Inscrivez-vous à notre newsletter pour recevoir les notifications de mise à jour
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/5 to-accent/5">
            <CardHeader>
              <Sparkles className="w-8 h-8 text-secondary mb-3" />
              <h3 className="font-semibold mb-2">Roadmap</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Découvrez les fonctionnalités à venir dans notre roadmap publique
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
