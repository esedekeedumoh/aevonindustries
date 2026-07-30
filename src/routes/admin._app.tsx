import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/shell";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/admin/_app")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/admin/login" });

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
    if (!roles || roles.length === 0) {
      await supabase.auth.signOut();
      throw redirect({ to: "/admin/login" });
    }

    const { data: profile } = await supabase
      .from("admin_profiles")
      .select("must_change_password, status")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profile?.status === "suspended") {
      await supabase.auth.signOut();
      throw redirect({ to: "/admin/login" });
    }
    if (profile?.must_change_password) throw redirect({ to: "/admin/change-password" });

    return { user: data.user };
  },
  component: () => (
    <>
      <AdminShell>
        <Outlet />
      </AdminShell>
      <Toaster position="top-right" />
    </>
  ),
});
