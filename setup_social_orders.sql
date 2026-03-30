-- Ajouter les clés de réseaux sociaux dans site_settings
INSERT INTO public.site_settings (key, value, label) VALUES
    ('social_facebook', '', 'Facebook URL'),
    ('social_messenger', '', 'Messenger URL'),
    ('social_instagram', '', 'Instagram URL'),
    ('social_linkedin', '', 'LinkedIn URL'),
    ('social_whatsapp', '', 'WhatsApp (numéro ou lien)'),
    ('social_x', '', 'X (Twitter) URL')
ON CONFLICT (key) DO NOTHING;

-- Table commandes d'offres
CREATE TABLE public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    offer_id UUID REFERENCES public.pricing_offers(id) ON DELETE SET NULL,
    offer_title VARCHAR(200) NOT NULL,
    client_name VARCHAR(100) NOT NULL,
    client_email VARCHAR(200) NOT NULL,
    client_company VARCHAR(150),
    client_phone VARCHAR(50),
    message TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'nouveau',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Lecture réservée aux utilisateurs authentifiés (admin)
CREATE POLICY "Auth read orders"
ON public.orders FOR SELECT TO authenticated USING (true);

-- Écriture publique (permettre aux clients de soumettre une commande)
CREATE POLICY "Public insert orders"
ON public.orders FOR INSERT TO public WITH CHECK (true);

-- Mise à jour réservée aux admins
CREATE POLICY "Auth update orders"
ON public.orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth delete orders"
ON public.orders FOR DELETE TO authenticated USING (true);
