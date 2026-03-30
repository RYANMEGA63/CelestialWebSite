-- Mises à jour pour le système de commandes v2
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS selected_services JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS total_price VARCHAR(50),
ADD COLUMN IF NOT EXISTS promo_code VARCHAR(50);

-- Table pour les messages (Inbox Admin)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_name VARCHAR(100) NOT NULL,
    sender_email VARCHAR(200) NOT NULL,
    sender_company VARCHAR(150),
    subject VARCHAR(200),
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    source VARCHAR(50) DEFAULT 'contact', -- 'contact', 'order', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS pour messages
CREATE POLICY "Auth read messages"
ON public.messages FOR SELECT TO authenticated USING (true);

CREATE POLICY "Public insert messages"
ON public.messages FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Auth update messages"
ON public.messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth delete messages"
ON public.messages FOR DELETE TO authenticated USING (true);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(is_read);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
