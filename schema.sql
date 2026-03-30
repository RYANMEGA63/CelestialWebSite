-- ==========================================
-- SCHEMA SUPABASE POUR CELESTIAL ADMINISTRATEUR
-- ==========================================

-- 1. Table des visites (Tracking)
CREATE TABLE IF NOT EXISTS page_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  path TEXT NOT NULL,
  origin TEXT,
  user_agent TEXT,
  is_unique BOOLEAN DEFAULT true,
  session_id TEXT
);

-- 2. Tables pour la Documentation
CREATE TABLE IF NOT EXISTS docs_categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  icon TEXT,
  order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS docs_pages (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES docs_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  time_to_read TEXT,
  order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS docs_sections (
  id TEXT PRIMARY KEY,
  page_id TEXT REFERENCES docs_pages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS docs_subsections (
  id TEXT PRIMARY KEY,
  section_id TEXT REFERENCES docs_sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  image_alt TEXT,
  image_caption TEXT,
  video_url TEXT,
  video_title TEXT,
  code_language TEXT,
  code_content TEXT,
  order_index INTEGER DEFAULT 0
);

-- 3. Tables pour le Changelog
CREATE TABLE IF NOT EXISTS changelog_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS changelog_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id UUID REFERENCES changelog_entries(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- "feat", "fix", "deprecated", "security", etc.
  content TEXT NOT NULL
);

-- 4. Tables pour les Offres (Pricing)
CREATE TABLE IF NOT EXISTS pricing_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'DZD',
  is_monthly BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  features JSONB DEFAULT '[]'::jsonb,
  button_text TEXT DEFAULT 'Commencer',
  order_index INTEGER DEFAULT 0
);

-- 5. Tables pour les Réalisations (Portfolio)
CREATE TABLE IF NOT EXISTS portfolio_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  project_name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  order_index INTEGER DEFAULT 0
);

-- ==========================================
-- POLICIES (Row Level Security - RLS)
-- ==========================================
-- On permet la lecture publique pour tout le monde (anon),
-- mais l'écriture est réservée aux utilisateurs authentifiés (admin).

-- Activer RLS sur toutes les tables
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs_subsections ENABLE ROW LEVEL SECURITY;
ALTER TABLE changelog_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE changelog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;

-- Autoriser l'insertion publique sur les visites
CREATE POLICY "Allow public insert on page_visits" ON page_visits FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow auth read on page_visits" ON page_visits FOR SELECT TO authenticated USING (true);

-- Autoriser la lecture publique
CREATE POLICY "Allow public read" ON docs_categories FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read" ON docs_pages FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read" ON docs_sections FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read" ON docs_subsections FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read" ON changelog_entries FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read" ON changelog_items FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read" ON pricing_offers FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read" ON portfolio_projects FOR SELECT TO public USING (true);

-- Autoriser toutes les opérations aux admins (authentifiés)
CREATE POLICY "Allow all to authenticated" ON docs_categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all to authenticated" ON docs_pages FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all to authenticated" ON docs_sections FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all to authenticated" ON docs_subsections FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all to authenticated" ON changelog_entries FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all to authenticated" ON changelog_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all to authenticated" ON pricing_offers FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all to authenticated" ON portfolio_projects FOR ALL TO authenticated USING (true);
