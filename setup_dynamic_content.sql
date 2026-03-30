-- ==========================================
-- SETUP : Contenu dynamique Celestial
-- ==========================================

-- Table Testimonials (avis clients dans /realisations)
CREATE TABLE public.testimonials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quote TEXT NOT NULL,
    author VARCHAR(100) NOT NULL,
    role VARCHAR(150) NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table FAQs (questions fréquentes dans /offres)
CREATE TABLE public.faqs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table Additional Services (services additionnels dans /offres)
CREATE TABLE public.additional_services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    price VARCHAR(100) NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table Team Members (équipe dans /a-propos)
CREATE TABLE public.team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table Milestones (timeline/histoire dans /a-propos)
CREATE TABLE public.company_milestones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    year VARCHAR(10) NOT NULL,
    event TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table Site Settings (coordonnées de contact etc.)
CREATE TABLE public.site_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    label VARCHAR(150),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- Politiques de sécurité (RLS)
-- ==========================================

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.additional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Lecture publique
CREATE POLICY "Public read testimonials" ON public.testimonials FOR SELECT TO public USING (true);
CREATE POLICY "Public read faqs" ON public.faqs FOR SELECT TO public USING (true);
CREATE POLICY "Public read additional_services" ON public.additional_services FOR SELECT TO public USING (true);
CREATE POLICY "Public read team_members" ON public.team_members FOR SELECT TO public USING (true);
CREATE POLICY "Public read company_milestones" ON public.company_milestones FOR SELECT TO public USING (true);
CREATE POLICY "Public read site_settings" ON public.site_settings FOR SELECT TO public USING (true);

-- Écriture réservée aux utilisateurs authentifiés (admin)
CREATE POLICY "Auth write testimonials" ON public.testimonials FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth write faqs" ON public.faqs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth write additional_services" ON public.additional_services FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth write team_members" ON public.team_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth write company_milestones" ON public.company_milestones FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth write site_settings" ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==========================================
-- Données initiales (reprises du site actuel)
-- ==========================================

-- Testimonials
INSERT INTO public.testimonials (quote, author, role, order_index) VALUES
    ('Celestial a transformé notre façon de travailler. Leur expertise technique et leur accompagnement ont été déterminants.', 'Marie Laurent', 'CEO, TalentCorp', 0),
    ('Une équipe réactive et professionnelle. Le projet a été livré dans les délais avec une qualité exceptionnelle.', 'Pierre Durand', 'CTO, HealthTech', 1);

-- FAQs
INSERT INTO public.faqs (question, answer, order_index) VALUES
    ('Puis-je changer d''offre à tout moment ?', 'Oui, vous pouvez upgrader ou downgrader votre offre à tout moment. Les changements prennent effet immédiatement.', 0),
    ('Y a-t-il des frais cachés ?', 'Non, tous nos prix sont transparents. Le prix affiché est le prix final, sans frais cachés.', 1),
    ('Proposez-vous une période d''essai ?', 'Oui, toutes nos offres incluent une période d''essai gratuite de 14 jours, sans engagement.', 2),
    ('Comment fonctionne le support ?', 'Le support par email est inclus dans toutes les offres. Les offres Professional et Enterprise bénéficient d''un support prioritaire 24/7.', 3);

-- Additional Services
INSERT INTO public.additional_services (title, description, price, order_index) VALUES
    ('Consulting', 'Nos experts vous accompagnent dans votre transformation digitale', 'À partir de 15 000 DZD/h', 0),
    ('Formation', 'Sessions de formation pour vos équipes sur nos outils', 'À partir de 80 000 DZD/jour', 1),
    ('Développement sur mesure', 'Solutions personnalisées adaptées à vos besoins spécifiques', 'Devis personnalisé', 2),
    ('Migration de données', 'Nous gérons la migration de vos données existantes', 'À partir de 200 000 DZD', 3);

-- Team Members
INSERT INTO public.team_members (name, role, description, order_index) VALUES
    ('Marie Dubois', 'CEO & Fondatrice', '15 ans d''expérience dans le développement logiciel', 0),
    ('Thomas Martin', 'CTO', 'Expert en architecture cloud et DevOps', 1),
    ('Sophie Bernard', 'Head of Product', 'Spécialiste UX/UI et gestion de produit', 2),
    ('Lucas Petit', 'Lead Developer', 'Passionné par les technologies open source', 3);

-- Company Milestones
INSERT INTO public.company_milestones (year, event, order_index) VALUES
    ('2011', 'Création de Celestial', 0),
    ('2014', 'Première levée de fonds - 2M DZD', 1),
    ('2017', 'Expansion internationale', 2),
    ('2020', '100+ clients entreprises', 3),
    ('2023', 'Lancement de la v3.0', 4),
    ('2026', '500+ projets livrés', 5);

-- Site Settings (coordonnées de contact)
INSERT INTO public.site_settings (key, value, label) VALUES
    ('contact_phone_1', '+33 1 23 45 67 89', 'Téléphone 1'),
    ('contact_phone_2', '+33 1 23 45 67 90', 'Téléphone 2'),
    ('contact_email_main', 'contact@celestial.dz', 'Email principal'),
    ('contact_email_support', 'support@celestial.dz', 'Email support'),
    ('contact_address_line1', '123 Avenue Innovation', 'Adresse ligne 1'),
    ('contact_address_line2', '75001 Paris, France', 'Adresse ligne 2'),
    ('contact_hours_weekday', 'Lun - Ven: 9h - 18h', 'Horaires semaine'),
    ('contact_hours_weekend', 'Sam - Dim: Fermé', 'Horaires week-end');
