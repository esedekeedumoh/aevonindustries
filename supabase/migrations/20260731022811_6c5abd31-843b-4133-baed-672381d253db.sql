CREATE TABLE public.waitlist_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  status text NOT NULL DEFAULT 'waiting',
  notified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.waitlist_entries TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.waitlist_entries TO authenticated;
GRANT ALL ON public.waitlist_entries TO service_role;

ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join a waitlist"
  ON public.waitlist_entries FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins view waitlist"
  ON public.waitlist_entries FOR SELECT TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Admins update waitlist"
  ON public.waitlist_entries FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins delete waitlist"
  ON public.waitlist_entries FOR DELETE TO authenticated USING (is_admin(auth.uid()));

CREATE TRIGGER update_waitlist_entries_updated_at
  BEFORE UPDATE ON public.waitlist_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX waitlist_entries_product_idx ON public.waitlist_entries (product_id);