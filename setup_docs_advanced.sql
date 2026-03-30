-- ==========================================
-- SETUP : Médias Documentation & Stockage
-- ==========================================

-- 1. Créer le bucket de stockage public 'docs_media' s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('docs_media', 'docs_media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Politiques de sécurité pour 'docs_media'
CREATE POLICY "Lecture publique des médias doc"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'docs_media' );

CREATE POLICY "Upload de médias par les admins"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK ( bucket_id = 'docs_media' );

CREATE POLICY "Mise à jour de médias par les admins"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING ( bucket_id = 'docs_media' );

CREATE POLICY "Suppression de médias par les admins"
  ON storage.objects FOR DELETE
  TO authenticated
  USING ( bucket_id = 'docs_media' );

-- 3. Ajout de colonnes de support si besoin (déjà présent en grande partie)
ALTER TABLE docs_subsections ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'text';
-- 'text', 'image', 'video', 'code'
