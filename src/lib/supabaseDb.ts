/// <reference types="vite/client" />
import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────
// DB Manager — second Supabase project
// Required env vars in .env.local:
//   VITE_DB_SUPABASE_URL
//   VITE_DB_SUPABASE_ANON_KEY
//   VITE_DB_SUPABASE_SERVICE_ROLE_KEY
//   VITE_DB_ADMIN_EMAIL  ← email of the single admin account
// ─────────────────────────────────────────────────────────────

const dbUrl     = import.meta.env.VITE_DB_SUPABASE_URL             as string;
const dbAnon    = import.meta.env.VITE_DB_SUPABASE_ANON_KEY        as string;
const dbService = import.meta.env.VITE_DB_SUPABASE_SERVICE_ROLE_KEY as string;

export const ADMIN_EMAIL: string | undefined =
  (import.meta.env.VITE_DB_ADMIN_EMAIL as string | undefined) || undefined;

if (!dbUrl || !dbAnon) {
  console.warn(
    "[DB Manager] VITE_DB_SUPABASE_URL or VITE_DB_SUPABASE_ANON_KEY missing. " +
    "Add them to .env.local."
  );
}

/** Anon client — used ONLY for sign-in / sign-out / realtime subscriptions */
export const supabaseDb = createClient(dbUrl ?? "", dbAnon ?? "");

/** Service-role client — used for all data operations (bypasses RLS) */
export const supabaseDbAdmin = createClient(dbUrl ?? "", dbService ?? "", {
  auth: { autoRefreshToken: false, persistSession: false },
});

/** Call the Supabase Auth Admin REST API (list/create/delete users) */
export async function dbAdminFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  if (!dbService) {
    throw new Error("VITE_DB_SUPABASE_SERVICE_ROLE_KEY is not set in .env.local");
  }
  return fetch(`${dbUrl}/auth/v1${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      apikey: dbService,
      Authorization: `Bearer ${dbService}`,
      ...(options.headers ?? {}),
    },
  });
}

// ─── Workspace types ─────────────────────────────────────────

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  color: string;
  emoji: string;
  image_url?: string;
  company_id?: string;
  features_messaging: boolean;
  features_database: boolean;
  allowed_tables?: string[];
  created_at: string;
}

export interface WorkspaceRole {
  id: string;
  workspace_id: string;
  name: string;
  can_send_messages: boolean;
  can_view_database: boolean;
  can_manage_members: boolean;
  created_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  user_email: string;
  role: string;
  can_send_messages: boolean;
  can_view_database: boolean;
  can_manage_members: boolean;
  joined_at: string;
}

export interface Message {
  id: string;
  workspace_id: string;
  sender_id: string;
  sender_email: string;
  content: string;
  created_at: string;
}

export interface SupabaseUser {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  role: string;
  user_metadata: Record<string, unknown>;
  app_metadata: Record<string, unknown>;
}
