import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are missing from environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function trackPageVisit(path: string, origin: string = document.referrer) {
  try {
    const isUnique = !localStorage.getItem(`visited_${path}`);
    if (isUnique) {
      localStorage.setItem(`visited_${path}`, "true");
    }

    // Attempt to track but don't crash if it fails
    await supabase.from("page_visits").insert([{
      path,
      origin: origin || document.referrer || null,
      user_agent: navigator.userAgent,
      is_unique: isUnique,
      session_id: sessionStorage.getItem("session_id") || (() => {
        const id = crypto.randomUUID();
        sessionStorage.setItem("session_id", id);
        return id;
      })()
    }]);
  } catch (err) {
    console.error("Failed to track visit", err);
  }
}
