import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { KeyRound, Loader2, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  adminAdminsQuery,
  adminRolesQuery,
  logActivity,
  type AdminProfile,
} from "@/lib/admin/api";
import {
  createAdminAccount,
  deleteAdminAccount,
  resetAdminPassword,
} from "@/lib/admin/admins.functions";
import { ROLE_LABELS, ALL_ROLES, type AppRole } from "@/lib/admin/rbac";
import { PageHeader, Panel, AccessDenied, Skeletons, StatusBadge } from "@/components/admin/kit";
import { useAdmin } from "@/lib/admin/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/_app/admins")({
  head: () => ({
    meta: [
      { title: "Administrators — Aevon Admin" },
      { name: "description", content: "Create administrator accounts and manage their ranks." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminsPage,
});

const emptyForm = {
  full_name: "",
  email: "",
  password: "",
  job_title: "",
  department: "",
  role: "administrator" as AppRole,
};

function AdminsPage() {
  const { canView, canManage, session, roles: myRoles } = useAdmin();
  const queryClient = useQueryClient();
  const { data: admins = [], isLoading } = useQuery(adminAdminsQuery);
  const { data: roleRows = [] } = useQuery(adminRolesQuery);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const createFn = useServerFn(createAdminAccount);
  const resetFn = useServerFn(resetAdminPassword);
  const deleteFn = useServerFn(deleteAdminAccount);

  const isSuper = myRoles.includes("super_admin");

  const create = useMutation({
    mutationFn: async () => {
      await createFn({ data: { ...form } });
      await logActivity({
        action: `Created ${ROLE_LABELS[form.role]} account`,
        module: "admins",
        details: { email: form.email },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminAdminsQuery.queryKey });
      queryClient.invalidateQueries({ queryKey: adminRolesQuery.queryKey });
      toast.success("Administrator created. They must change their password at first login.");
      setForm(emptyForm);
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error: delErr } = await supabase.from("user_roles").delete().eq("user_id", userId);
      if (delErr) throw delErr;
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) throw error;
      await logActivity({ action: `Changed rank to ${role}`, module: "admins", details: { userId } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminRolesQuery.queryKey });
      toast.success("Rank updated");
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

  const resetPw = useMutation({
    mutationFn: async ({ userId, password }: { userId: string; password: string }) => {
      await resetFn({ data: { userId, password } });
      await logActivity({ action: "Reset admin password", module: "security", details: { userId } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminAdminsQuery.queryKey });
      toast.success("Temporary password set. They must change it at next login.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (userId: string) => {
      await deleteFn({ data: { userId } });
      await logActivity({ action: "Deleted admin account", module: "admins", details: { userId } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminAdminsQuery.queryKey });
      queryClient.invalidateQueries({ queryKey: adminRolesQuery.queryKey });
      toast.success("Administrator removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!canView("admins")) return <AccessDenied />;
  const editable = canManage("admins");

  const roleOf = (u: AdminProfile) =>
    (roleRows.find((r) => r.user_id === u.id)?.role ?? "viewer") as AppRole;

  return (
    <>
      <PageHeader
        title="Administrators"
        description="Create admin accounts, assign their rank and manage access. Site users are managed separately."
        actions={
          editable ? (
            <Button onClick={() => setOpen(true)}>
              <UserPlus className="mr-1.5 h-4 w-4" /> Add administrator
            </Button>
          ) : null
        }
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
                <th className="px-4 py-3 font-medium">Rank</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last login</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((u) => (
                <tr key={u.id} className="border-t border-border/50 align-top hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">{u.full_name || "Unnamed admin"}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                    {u.must_change_password && (
                      <p className="mt-1 text-xs text-amber-600">Password change pending</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm disabled:opacity-60"
                      value={roleOf(u)}
                      disabled={!editable || u.id === session?.userId}
                      onChange={(e) =>
                        setRole.mutate({ userId: u.id, role: e.target.value as AppRole })
                      }
                    >
                      {ALL_ROLES.filter((r) => isSuper || r !== "super_admin").map((r) => (
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
                      <div className="flex flex-wrap gap-3">
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
                        <button
                          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:underline"
                          onClick={() => {
                            const pw = window.prompt(
                              `New temporary password for ${u.email} (min 8 characters)`,
                            );
                            if (pw) resetPw.mutate({ userId: u.id, password: pw });
                          }}
                        >
                          <KeyRound className="h-3.5 w-3.5" /> Reset password
                        </button>
                        {isSuper && (
                          <button
                            className="inline-flex items-center gap-1 text-sm font-medium text-destructive hover:underline"
                            onClick={() => {
                              if (window.confirm(`Permanently delete ${u.email}?`))
                                remove.mutate(u.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add administrator</DialogTitle>
            <DialogDescription>
              Set a default password — the new admin will be asked to change it right after their
              first login.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="a_name">Full name</Label>
              <Input
                id="a_name"
                className="mt-1.5"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="a_email">Email</Label>
              <Input
                id="a_email"
                type="email"
                className="mt-1.5"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="a_pw">Default password</Label>
              <Input
                id="a_pw"
                className="mt-1.5"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="a_role">Rank</Label>
              <select
                id="a_role"
                className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as AppRole })}
              >
                {ALL_ROLES.filter((r) => isSuper || r !== "super_admin").map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="a_job">Job title</Label>
              <Input
                id="a_job"
                className="mt-1.5"
                value={form.job_title}
                onChange={(e) => setForm({ ...form, job_title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="a_dep">Department</Label>
              <Input
                id="a_dep"
                className="mt-1.5"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => create.mutate()}
              disabled={create.isPending || !form.email || !form.password || !form.full_name}
            >
              {create.isPending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-1.5 h-4 w-4" />
              )}
              Create administrator
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
