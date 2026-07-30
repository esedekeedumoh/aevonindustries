import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  adminAdminsQuery,
  adminRolesQuery,
  logActivity,
  type AdminProfile,
} from "@/lib/admin/api";
import { ROLE_LABELS, ALL_ROLES, type AppRole } from "@/lib/admin/rbac";
import { PageHeader, Panel, AccessDenied, Skeletons, StatusBadge } from "@/components/admin/kit";
import { useAdmin } from "@/lib/admin/use-admin";

export const Route = createFileRoute("/admin/_app/users")({
  head: () => ({
    meta: [
      { title: "Users & Admins — Aevon Admin" },
      { name: "description", content: "Manage administrator accounts and role-based permissions." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: UsersPage,
});

function UsersPage() {
  const { canView, canManage, session } = useAdmin();
  const queryClient = useQueryClient();
  const { data: admins = [], isLoading } = useQuery(adminAdminsQuery);
  const { data: roles = [] } = useQuery(adminRolesQuery);

  const setRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error: delErr } = await supabase.from("user_roles").delete().eq("user_id", userId);
      if (delErr) throw delErr;
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) throw error;
      await logActivity({ action: `Changed role to ${role}`, module: "admins", details: { userId } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminRolesQuery.queryKey });
      toast.success("Role updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("admin_profiles").update({ status }).eq("id", id);
      if (error) throw error;
      await logActivity({ action: `Set account ${status}`, module: "admins", details: { id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminAdminsQuery.queryKey });
      toast.success("Account updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!canView("admins")) return <AccessDenied />;
  const editable = canManage("admins");

  const roleOf = (u: AdminProfile) => roles.find((r) => r.user_id === u.id)?.role ?? "viewer";

  return (
    <>
      <PageHeader
        title="Users & Admins"
        description="Roles determine which modules each administrator can open and edit."
      />
      <Panel className="overflow-x-auto">
        {isLoading ? (
          <div className="p-4">
            <Skeletons />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Administrator</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last login</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((u) => (
                <tr key={u.id} className="border-t border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">{u.full_name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm disabled:opacity-60"
                      value={roleOf(u)}
                      disabled={!editable || u.id === session?.userId}
                      onChange={(e) => setRole.mutate({ userId: u.id, role: e.target.value as AppRole })}
                    >
                      {ALL_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={u.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {u.last_login_at ? new Date(u.last_login_at).toLocaleString() : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    {editable && u.id !== session?.userId && (
                      <button
                        className="text-sm font-medium text-primary hover:underline"
                        onClick={() =>
                          setStatus.mutate({
                            id: u.id,
                            status: u.status === "active" ? "suspended" : "active",
                          })
                        }
                      >
                        {u.status === "active" ? "Suspend" : "Reactivate"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Panel className="mt-6 p-6">
        <h2 className="font-display text-lg font-semibold">Role permissions</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Super Admin has unrestricted access. Admin manages content and settings. Editor manages content.
          Author manages their content areas. Viewer has read-only access.
        </p>
      </Panel>
    </>
  );
}
