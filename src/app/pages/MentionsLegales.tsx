import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Scale } from "lucide-react";
import { Card, CardHeader, CardContent } from "../components/Card";
import { supabase } from "../../lib/supabase";

export function MentionsLegales() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("Mentions légales");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("legal_pages").select("title, content").eq("slug", "mentions-legales").single()
      .then(({ data }) => {
        if (data) { setTitle(data.title); setContent(data.content); }
        setLoading(false);
      });
  }, []);

  const paragraphs = content.split("\n\n").filter(p => p.trim());

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-6">
              <Scale className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">{title}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Informations légales relatives au site celestial.dz
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        {loading ? (
          <p className="text-center text-muted-foreground">Chargement...</p>
        ) : (
          <>
            {paragraphs.map((para, index) => {
              const lines = para.split("\n");
              const firstLine = lines[0];
              const isSection = /^\d+\./.test(firstLine);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {isSection ? (
                    <Card>
                      <CardHeader>
                        <h2 className="text-xl font-semibold mb-3">{firstLine}</h2>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                          {lines.slice(1).join("\n").trim()}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{para}</p>
                  )}
                </motion.div>
              );
            })}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-sm text-muted-foreground text-center pt-4"
            >
              Dernière mise à jour : mars 2026
            </motion.p>
          </>
        )}
      </div>
    </div>
  );
}
