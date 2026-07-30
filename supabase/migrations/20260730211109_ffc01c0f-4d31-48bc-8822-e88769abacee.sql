
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  platform TEXT,
  status TEXT NOT NULL DEFAULT 'Coming Soon',
  website_url TEXT,
  logo_url TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  release_date DATE,
  featured BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are publicly viewable" ON public.products FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon;
GRANT INSERT ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can send a contact message" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT INSERT ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.products (name, slug, category, description, platform, status, website_url, logo_url, featured, tags, sort_order) VALUES
('Von', 'von', 'Artificial Intelligence', 'An intelligent AI assistant for learning, coding, research, writing, productivity, and business.', 'Web AI', 'Coming Soon', NULL, '/__l5e/assets-v1/b7d9ba9d-30a0-407b-be9e-d11d21b556d2/von.png', true, ARRAY['AI','Assistant','Productivity'], 1),
('Aevon Browser', 'aevon-browser', 'Internet', 'A modern browser built for speed, privacy, productivity, and AI-powered browsing.', 'Desktop', 'Coming Soon', NULL, '/__l5e/assets-v1/0799ec25-40f8-4b85-9c27-da69f946f37e/haku.png', true, ARRAY['Browser','Privacy','Speed'], 2),
('Catalyst Digital', 'catalyst-digital', 'Marketing', 'A digital marketing and branding platform helping businesses grow online.', 'catalystdigital.aevonindustries.site', 'Available', 'https://catalystdigital.aevonindustries.site', '/__l5e/assets-v1/c396e67f-3331-4f9f-ac59-24335986ddc5/aevon.png', true, ARRAY['Marketing','Branding','Growth'], 3),
('Aevon Academy', 'aevon-academy', 'Education', 'Training students and professionals with future-ready digital skills.', 'Web', 'Coming Soon', NULL, '/__l5e/assets-v1/254b01af-f2ed-4a6d-bcc3-06d05391cb87/academy.png', true, ARRAY['Education','Skills','Training'], 4);
