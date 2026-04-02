-- ============================================================
-- SCHEMA — DB Manager (2ème projet Supabase)
-- Exécuter dans Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Espaces de travail
CREATE TABLE IF NOT EXISTS workspaces (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  color       TEXT DEFAULT '#7c3aed',
  emoji       TEXT DEFAULT '🏢',
  features_messaging BOOLEAN DEFAULT true,
  features_database  BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 1.5 Rôles personnalisés
CREATE TABLE IF NOT EXISTS workspace_roles (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id        UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  can_send_messages   BOOLEAN DEFAULT false,
  can_view_database   BOOLEAN DEFAULT false,
  can_manage_members  BOOLEAN DEFAULT false,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- 2. Membres d'un espace de travail (avec permissions granulaires)
CREATE TABLE IF NOT EXISTS workspace_members (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id        UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL,
  user_email          TEXT NOT NULL,
  role                TEXT DEFAULT 'viewer',
  can_send_messages   BOOLEAN DEFAULT true,
  can_view_database   BOOLEAN DEFAULT true,
  can_manage_members  BOOLEAN DEFAULT false,
  joined_at           TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

-- 3. Messages
CREATE TABLE IF NOT EXISTS messages (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  sender_id    UUID NOT NULL,
  sender_email TEXT NOT NULL,
  content      TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE workspaces         ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_roles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages           ENABLE ROW LEVEL SECURITY;

-- Workspace_roles: visible aux membres
CREATE POLICY "see_workspace_roles" ON workspace_roles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = workspace_roles.workspace_id
        AND user_id = auth.uid()
    )
  );

-- Workspaces : visible aux membres
CREATE POLICY "members_see_workspaces" ON workspaces
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = workspaces.id
        AND user_id = auth.uid()
    )
  );

-- workspace_members : visible aux membres du même workspace
CREATE POLICY "see_workspace_members" ON workspace_members
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm2
      WHERE wm2.workspace_id = workspace_members.workspace_id
        AND wm2.user_id = auth.uid()
    )
  );

-- Messages : lecture aux membres
CREATE POLICY "read_workspace_messages" ON messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = messages.workspace_id
        AND user_id = auth.uid()
    )
  );

-- Messages : envoi si can_send_messages
CREATE POLICY "send_messages" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = messages.workspace_id
        AND user_id = auth.uid()
        AND can_send_messages = true
    )
  );

-- ── Enable Realtime ───────────────────────────────────────────
-- Dans Supabase Dashboard → Database → Replication, activer "messages"
-- Ou via SQL :
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
