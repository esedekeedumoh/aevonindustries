ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.waitlist_entries FROM anon;
GRANT INSERT ON public.waitlist_entries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.waitlist_entries TO authenticated;
GRANT ALL ON public.waitlist_entries TO service_role;