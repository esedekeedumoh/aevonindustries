import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { adminSessionQueryOptions, logActivity } from "@/lib/admin/api";
import { PageHeader, Panel } from "@/components/admin/kit";
import { ROLE_LABELS } from "@/lib/admin/rbac";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAvatarUrl, uploadAvatar } from "@/lib/admin/avatar";

export const Route = createFileRoute("/admin/_app/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Aevon Admin" },
      { name: "description", content: "Manage your Aevon admin profile and password." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ProfilePage,
});

type Form = {
  full_name: string;
  job_title: string;
  department: string;
  phone: string;
  avatar_url: string;
  bio: string;
};

function ProfilePage() {
  const queryClient = useQueryClient();
  const { data: session } = useQuery(adminSessionQueryOptions);
  const [form, setForm] = useState<Form>({
    full_name: "",
    job_title: "",
    department: "",
    phone: "",
    avatar_url: "",
    bio: "",
  });
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    const p = session?.profile;
    if (!p) return;
    setForm({
      full_name: p.full_name ?? "",
      job_title: p.job_title ?? "",
      department: p.department ?? "",
      phone: p.phone ?? "",
      avatar_url: p.avatar_url ?? "",
      bio: "",
    });
  }, [session?.profile]);

  const save = useMutation({
    mutationFn: async () => {
      if (!session) throw new Error("Not signed in");
      const { error } = await supabase
        .from("admin_profiles")
        .update({
          full_name: form.full_name,
          job_title: form.job_title || null,
          department: form.department || null,
          phone: form.phone || null,
          avatar_url: form.avatar_url || null,
        })
        .eq("id", session.userId);
      if (error) throw error;
      await logActivity({ action: "Updated own profile", module: "admins" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminSessionQueryOptions.queryKey });
      toast.success("Profile updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const changePassword = useMutation({
    mutationFn: async () => {
      if (password.length < 8) throw new Error("Password must be at least 8 characters");
      if (password !== confirm) throw new Error("Passwords do not match");
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await supabase
        .from("admin_profiles")
        .update({ must_change_password: false })
        .eq("id", session!.userId);
      await logActivity({ action: "Changed own password", module: "security" });
    },
    onSuccess: () => {
      setPassword("");
      setConfirm("");
      toast.success("Password updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const initials = (form.full_name || session?.email || "A")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <PageHeader
        title="My Profile"
        description="Update your personal details, avatar and password."
        actions={
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            <Save className="mr-1.5 h-4 w-4" /> Save changes
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Panel className="p-6">
          <div className="flex flex-col items-center text-center">
            {form.avatar_url ? (
              <img
                src={form.avatar_url}
                alt={form.full_name || "Admin avatar"}
                className="h-24 w-24 rounded-2xl object-cover"
              />
            ) : (
              <span className="grid h-24 w-24 place-items-center rounded-2xl bg-primary/10 font-display text-2xl font-semibold text-primary">
                {initials}
              </span>
            )}
            <p className="mt-4 font-medium">{form.full_name || "Unnamed admin"}</p>
            <p className="text-sm text-muted-foreground">{session?.email}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {(session?.roles ?? []).map((r) => (
                <span key={r} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">
                  {ROLE_LABELS[r]}
                </span>
              ))}
            </div>
            {session?.profile?.last_login_at && (
              <p className="mt-4 text-xs text-muted-foreground">
                Last login {new Date(session.profile.last_login_at).toLocaleString()}
              </p>
            )}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel className="p-6">
            <h2 className="text-sm font-semibold">Profile details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  className="mt-1.5"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="job_title">Job title</Label>
                <Input
                  id="job_title"
                  className="mt-1.5"
                  value={form.job_title}
                  onChange={(e) => setForm({ ...form, job_title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  className="mt-1.5"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  className="mt-1.5"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
          </Panel>

          <Panel className="p-6">
            <h2 className="text-sm font-semibold">Change password</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="new_password">New password</Label>
                <Input
                  id="new_password"
                  type="password"
                  className="mt-1.5"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="confirm_password">Confirm password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  className="mt-1.5"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
            </div>
            <Button
              className="mt-4"
              variant="outline"
              disabled={changePassword.isPending || !password}
              onClick={() => changePassword.mutate()}
            >
              <KeyRound className="mr-1.5 h-4 w-4" /> Update password
            </Button>
          </Panel>
        </div>
      </div>
    </>
  );
}
