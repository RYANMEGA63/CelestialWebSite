-- ==========================================
-- UPDATE SUPABASE : STORAGE & MULTI-IMAGES
-- À exécuter dans le SQL Editor de Supabase
-- ==========================================

-- 1. Créer le bucket de stockage public 'portfolio' s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Créer les politiques de sécurité (RLS) pour le bucket 'portfolio'

-- Autoriser la lecture publique (tout le monde peut voir les images)
CREATE POLICY "Lecture publique des images du portfolio"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'portfolio' );

-- Autoriser les administrateurs (utilisateurs connectés) à uploader des images
CREATE POLICY "Upload d'images par les admins"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK ( bucket_id = 'portfolio' );

-- Autoriser les administrateurs à modifier / écraser des images
CREATE POLICY "Mise à jour d'images par les admins"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING ( bucket_id = 'portfolio' );

-- Autoriser les administrateurs à supprimer des images
CREATE POLICY "Suppression d'images par les admins"
  ON storage.objects FOR DELETE
  TO authenticated
  USING ( bucket_id = 'portfolio' );

-- 3. Mettre à jour la table 'portfolio_projects' pour supporter plusieurs images
ALTER TABLE portfolio_projects ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '[]'::jsonb;
