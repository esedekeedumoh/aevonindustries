DROP POLICY IF EXISTS "Public can read team rows" ON public.team_members;
REVOKE SELECT ON public.team_members FROM anon;

DROP VIEW IF EXISTS public.team_members_public;
CREATE VIEW public.team_members_public AS
SELECT id, name, role, department, bio, photo_url, linkedin_url, x_url, github_url,
       featured, sort_order, created_at, updated_at
FROM public.team_members;

GRANT SELECT ON public.team_members_public TO anon, authenticated;