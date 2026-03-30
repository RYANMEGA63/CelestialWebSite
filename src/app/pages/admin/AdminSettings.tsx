import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Card, CardContent, CardHeader } from "../../components/Card";
import { Button } from "../../components/Button";
import { Save, Settings } from "lucide-react";
import { toast } from "sonner";

export function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const settingGroups = [
    {
      title: "Téléphone",
      keys: [
        { key: "contact_phone_1", label: "Téléphone 1" },
        { key: "contact_phone_2", label: "Téléphone 2" },
      ]
    },
    {
      title: "Email",
      keys: [
        { key: "contact_email_main", label: "Email principal" },
        { key: "contact_email_support", label: "Email support" },
      ]
    },
    {
      title: "Adresse",
      keys: [
        { key: "contact_address_line1", label: "Adresse ligne 1" },
        { key: "contact_address_line2", label: "Adresse ligne 2" },
      ]
    },
    {
      title: "Horaires",
      keys: [
        { key: "contact_hours_weekday", label: "Horaires semaine" },
        { key: "contact_hours_weekend", label: "Horaires week-end" },
      ]
    },
    {
      title: "Réseaux sociaux",
      keys: [
        { key: "social_facebook", label: "Facebook (URL)" },
        { key: "social_messenger", label: "Messenger (URL)" },
        { key: "social_instagram", label: "Instagram (URL)" },
        { key: "social_linkedin", label: "LinkedIn (URL)" },
        { key: "social_whatsapp", label: "WhatsApp (numéro ou URL)" },
        { key: "social_x", label: "X / Twitter (URL)" },
      ]
    },
    {
      title: "Notifications externes",
      keys: [
        { key: "notification_webhook_url", label: "URL Webhook (LinkedIn via Zapier/Make)" },
      ]
    },
  ];

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from("site_settings").select("*");
      const map: Record<string, string> = {};
      (data || []).forEach((s: any) => { map[s.key] = s.value; });
      setSettings(map);
      setLoading(false);
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const updates = Object.entries(settings).map(([key, value]) =>
      supabase.from("site_settings").update({ value }).eq("key", key)
    );
    const results = await Promise.all(updates);
    const hasError = results.some(r => r.error);
    if (hasError) {
      toast.error("Erreur lors de la sauvegarde");
    } else {
      toast.success("Coordonnées mises à jour !");
    }
    setSaving(false);
  };

  if (loading) return <div className="text-muted-foreground">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            Paramètres du site
          </h2>
          <p className="text-muted-foreground mt-2">Modifiez vos coordonnées de contact affichées publiquement.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Sauvegarde..." : "Tout sauvegarder"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingGroups.map(group => (
          <Card key={group.title}>
            <CardHeader>
              <h3 className="font-semibold text-base">{group.title}</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {group.keys.map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs text-muted-foreground">{label}</label>
                  <input
                    value={settings[key] || ""}
                    onChange={e => setSettings(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
