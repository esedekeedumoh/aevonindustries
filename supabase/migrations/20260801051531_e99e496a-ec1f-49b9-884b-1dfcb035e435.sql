-- 1) Fix is_admin() to only accept real admin roles
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin','administrator')
  )
$function$;

-- 2) Staff helper for operational modules (support/marketing managers)
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin','administrator','support_manager','marketing_manager')
  )
$function$;

-- 3) Lock down EXECUTE on SECURITY DEFINER helpers (anon must not call them)
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_edit(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_edit(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 4) Operational tables: allow staff (not every role holder)
DROP POLICY IF EXISTS "Admins view messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins update messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins delete messages" ON public.contact_messages;
CREATE POLICY "Staff view messages" ON public.contact_messages FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff update messages" ON public.contact_messages FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Admins delete messages" ON public.contact_messages FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins view subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins delete subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Staff view subscribers" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins delete subscribers" ON public.newsletter_subscribers FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins view waitlist" ON public.waitlist_entries;
DROP POLICY IF EXISTS "Admins update waitlist" ON public.waitlist_entries;
DROP POLICY IF EXISTS "Admins delete waitlist" ON public.waitlist_entries;
CREATE POLICY "Staff view waitlist" ON public.waitlist_entries FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff update waitlist" ON public.waitlist_entries FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Admins delete waitlist" ON public.waitlist_entries FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- 5) Public submission policies: real validation instead of `true`
DROP POLICY IF EXISTS "Anyone can send a contact message" ON public.contact_messages;
CREATE POLICY "Anyone can send a valid contact message"
ON public.contact_messages FOR INSERT TO anon, authenticated
WITH CHECK (
  length(btrim(name)) BETWEEN 1 AND 120
  AND length(btrim(email)) BETWEEN 3 AND 254
  AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(btrim(message)) BETWEEN 1 AND 5000
  AND (subject IS NULL OR length(subject) <= 200)
  AND status = 'new'
  AND assigned_to IS NULL
);

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe with a valid email"
ON public.newsletter_subscribers FOR INSERT TO anon, authenticated
WITH CHECK (
  length(btrim(email)) BETWEEN 3 AND 254
  AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
);

DROP POLICY IF EXISTS "Anyone can join a waitlist" ON public.waitlist_entries;
CREATE POLICY "Anyone can join a waitlist with valid details"
ON public.waitlist_entries FOR INSERT TO anon, authenticated
WITH CHECK (
  length(btrim(name)) BETWEEN 1 AND 120
  AND length(btrim(email)) BETWEEN 3 AND 254
  AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND (phone IS NULL OR length(btrim(phone)) BETWEEN 5 AND 30)
  AND length(btrim(product_name)) BETWEEN 1 AND 200
  AND status = 'waiting'
  AND notified_at IS NULL
);

-- 6) Team members: hide personal emails from the public
DROP POLICY IF EXISTS "Team is publicly viewable" ON public.team_members;
CREATE POLICY "Signed-in staff view full team rows"
ON public.team_members FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()) OR public.can_edit(auth.uid()));

CREATE OR REPLACE VIEW public.team_members_public
WITH (security_invoker = true) AS
SELECT id, name, role, department, bio, photo_url, linkedin_url, x_url, github_url,
       featured, sort_order, created_at, updated_at
FROM public.team_members;

CREATE POLICY "Public can read team rows"
ON public.team_members FOR SELECT TO anon
USING (true);

GRANT SELECT ON public.team_members_public TO anon, authenticated;
