import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type SiteUser = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  confirmed: boolean;
};

async function assertAdmin(supabase: any, userId: string, requireSuper = false) {
  const { data: roles, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw new Error("Unable to verify permissions");
  const list = ((roles ?? []) as { role: string }[]).map((r) => r.role);
  const isSuper = list.includes("super_admin");
  if (requireSuper && !isSuper) throw new Error("Only a Super Admin can perform this action");
  if (!isSuper && !list.includes("administrator")) throw new Error("Forbidden");
  return { isSuper };
}

export const createAdminAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      email: string;
      password: string;
      full_name: string;
      job_title?: string;
      department?: string;
      role: string;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { isSuper } = await assertAdmin(context.supabase, context.userId);
    if (data.role === "super_admin" && !isSuper) {
      throw new Error("Only a Super Admin can create another Super Admin");
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) throw new Error("Invalid email address");
    if (data.password.length < 8) throw new Error("Default password must be at least 8 characters");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (error || !created.user) throw new Error(error?.message ?? "Could not create account");

    const uid = created.user.id;
    const { error: pErr } = await supabaseAdmin.from("admin_profiles").upsert({
      id: uid,
      full_name: data.full_name,
      email: data.email,
      job_title: data.job_title || null,
      department: data.department || null,
      status: "active",
      must_change_password: true,
    });
    if (pErr) throw new Error(pErr.message);

    await supabaseAdmin.from("user_roles").delete().eq("user_id", uid);
    const { error: rErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: uid, role: data.role as never });
    if (rErr) throw new Error(rErr.message);

    return { id: uid };
  });

export const resetAdminPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; password: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    if (data.password.length < 8) throw new Error("Password must be at least 8 characters");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      password: data.password,
    });
    if (error) throw new Error(error.message);
    await supabaseAdmin
      .from("admin_profiles")
      .update({ must_change_password: true })
      .eq("id", data.userId);
    return { ok: true };
  });

export const deleteAdminAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId, true);
    if (data.userId === context.userId) throw new Error("You cannot delete your own account");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    await supabaseAdmin.from("admin_profiles").delete().eq("id", data.userId);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listSiteUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SiteUser[]> => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (error) throw new Error(error.message);
    const { data: profiles } = await supabaseAdmin.from("admin_profiles").select("id");
    const adminIds = new Set(((profiles ?? []) as { id: string }[]).map((p) => p.id));
    return data.users
      .filter((u) => !adminIds.has(u.id))
      .map((u) => ({
        id: u.id,
        email: u.email ?? "",
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
        confirmed: Boolean(u.email_confirmed_at),
      }));
  });
