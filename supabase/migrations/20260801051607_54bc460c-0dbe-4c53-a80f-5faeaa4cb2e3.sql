DROP VIEW IF EXISTS public.team_members_public;
CREATE VIEW public.team_members_public
WITH (security_invoker = true) AS
SELECT id, name, role, department, bio, photo_url, linkedin_url, x_url, github_url,
       featured, sort_order, created_at, updated_at
FROM public.team_members;

GRANT SELECT ON public.team_members_public TO anon, authenticated;

-- Column-level grant: anon may read everything except email
GRANT SELECT (id, name, role, department, bio, photo_url, linkedin_url, x_url, github_url,
              featured, sort_order, created_at, updated_at)
ON public.team_members TO anon;

CREATE POLICY "Public can read non-email team columns"
ON public.team_members FOR SELECT TO anon
USING (true);