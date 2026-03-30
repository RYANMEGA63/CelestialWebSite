-- Table pour les mises à jour en page d'accueil
CREATE TABLE public.home_updates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    version VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    changes TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table pour les catégories des réalisations
CREATE TABLE public.portfolio_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    label VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Permettre la lecture publique
ALTER TABLE public.home_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on home_updates"
ON public.home_updates FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access on portfolio_categories"
ON public.portfolio_categories FOR SELECT TO public USING (true);

-- Permettre l'accès total aux utilisateurs authentifiés (admin)
CREATE POLICY "Allow all access to authenticated users on home_updates"
ON public.home_updates FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to authenticated users on portfolio_categories"
ON public.portfolio_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insertions initiales pour les catégories du portfolio
INSERT INTO public.portfolio_categories (name, label) VALUES
    ('webapp', 'Applications Web'),
    ('mobile', 'Applications Mobile'),
    ('saas', 'SaaS'),
    ('ecommerce', 'E-commerce');

-- Insertions initiales pour la page d'accueil
INSERT INTO public.home_updates (version, date, changes, order_index) VALUES
    ('v3.2.0', '2026-03-25', 'Nouvelle API REST, améliorations performances', 0),
    ('v3.1.5', '2026-03-18', 'Corrections bugs, mise à jour sécurité', 1),
    ('v3.1.0', '2026-03-10', 'Interface utilisateur redesignée', 2);
