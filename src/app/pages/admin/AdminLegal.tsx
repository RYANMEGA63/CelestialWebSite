import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Card, CardContent, CardHeader } from "../../components/Card";
import { Button } from "../../components/Button";
import { Scale, ShieldCheck, FileText, Save } from "lucide-react";
import { toast } from "sonner";

const LEGAL_PAGES = [
  { slug: "mentions-legales", label: "Mentions légales", icon: Scale },
  { slug: "confidentialite", label: "Politique de confidentialité", icon: ShieldCheck },
  { slug: "cgu", label: "Conditions générales d'utilisation", icon: FileText },
];

export function AdminLegal() {
  const [activeSlug, setActiveSlug] = useState("mentions-legales");
  const [pages, setPages] = useState<Record<string, { title: string; content: string; id?: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchPages() {
      const { data } = await supabase.from("legal_pages").select("*");
      const map: Record<string, any> = {};
      (data || []).forEach((p: any) => { map[p.slug] = p; });
      setPages(map);
      setLoading(false);
    }
    fetchPages();
  }, []);

  const current = pages[activeSlug];

  const handleSave = async () => {
    if (!current) return;
    setSaving(true);
    const { error } = await supabase
      .from("legal_pages")
      .update({ title: current.title, content: current.content, updated_at: new Date().toISOString() })
      .eq("slug", activeSlug);
    if (error) {
      toast.error("Erreur de sauvegarde", { description: error.message });
    } else {
      toast.success("Page mise à jour !");
    }
    setSaving(false);
  };

  const updateField = (field: "title" | "content", value: string) => {
    setPages(prev => ({
      ...prev,
      [activeSlug]: { ...prev[activeSlug], [field]: value }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Pages légales</h2>
        <p className="text-muted-foreground mt-2">Modifiez le contenu des pages légales affichées sur le site.</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 border-b border-border pb-4 mb-6 flex-wrap">
        {LEGAL_PAGES.map(({ slug, label, icon: Icon }) => (
          <button
            key={slug}
            onClick={() => setActiveSlug(slug)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeSlug === slug ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-muted-foreground">Chargement...</p>
      ) : current ? (
        <Card>
          <CardHeader className="flex flex-row justify-between items-center border-b border-border pb-4">
            <h3 className="font-semibold text-lg">{LEGAL_PAGES.find(p => p.slug === activeSlug)?.label}</h3>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Titre de la page</label>
              <input
                value={current.title}
                onChange={e => updateField("title", e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contenu</label>
              <p className="text-xs text-muted-foreground">Rédigez le contenu de la page. Utilisez des sauts de ligne pour séparer les paragraphes et les sections.</p>
              <textarea
                value={current.content}
                onChange={e => updateField("content", e.target.value)}
                rows={30}
                className="w-full px-3 py-2 border rounded-md bg-background font-mono text-sm leading-relaxed resize-y"
              />
            </div>
            <div className="flex justify-end pt-4 border-t border-border">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Sauvegarde..." : "Sauvegarder les modifications"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>Aucune donnée trouvée. Assurez-vous d'avoir exécuté le script SQL <code>setup_legal_pages.sql</code>.</p>
        </div>
      )}
    </div>
  );
}
