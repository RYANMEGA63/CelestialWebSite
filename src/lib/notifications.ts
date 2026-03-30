import { supabase } from "./supabase";

/**
 * Utility to send notifications via webhooks (e.g., to Zapier/Make.com for LinkedIn/Slack)
 */
export async function sendWebhookNotification(type: "order" | "message" | "contact", data: any) {
  try {
    // 1. Get the webhook URL from site_settings
    const { data: settings } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "notification_webhook_url")
      .single();

    if (!settings?.value) {
      console.log("No webhook URL configured. Skipping notification.");
      return;
    }

    // 2. Format the payload
    const payload = {
      timestamp: new Date().toISOString(),
      type,
      data,
      source: "Celestial Website",
    };

    // 3. Send POST request
    const response = await fetch(settings.value, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Webhook notification failed: ${response.statusText}`);
    } else {
      console.log(`Webhook notification sent successfully for ${type}`);
    }
  } catch (error) {
    console.error("Error sending webhook notification:", error);
  }
}

/**
 * Helper to register the webhook URL setting in the database if it doesn't exist
 */
export async function ensureWebhookSetting() {
  const { data: existing } = await supabase
    .from("site_settings")
    .select("key")
    .eq("key", "notification_webhook_url")
    .single();

  if (!existing) {
    await supabase.from("site_settings").insert([
      { 
        key: "notification_webhook_url", 
        value: "", 
        label: "URL Webhook Notifications (Zapier/Make)" 
      }
    ]);
  }
}
