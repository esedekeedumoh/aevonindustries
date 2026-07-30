import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/admin/change-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Change Password — Aevon Admin" },
      { name: "description", content: "Set a new administrator password for the Aevon control center." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ChangePassword,
});

function ChangePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 10) {
      toast.error("Password must be at least 10 characters.");
      return;
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      toast.error("Include at least one uppercase letter and one number.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      await supabase
        .from("admin_profiles")
        .update({ must_change_password: false })
        .eq("id", data.user.id);
      await supabase.from("activity_logs").insert({
        user_id: data.user.id,
        user_email: data.user.email ?? "",
        action: "Changed password",
        module: "security",
        status: "success",
        user_agent: navigator.userAgent,
      });
    }
    setLoading(false);
    toast.success("Password updated");
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="w-full max-w-md rounded-3xl border border-border/60 bg-card/70 p-8 shadow-2xl backdrop-blur-xl">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <KeyRound className="h-5 w-5" />
        </span>
        <h1 className="mt-5 text-center font-display text-2xl font-semibold">Set a new password</h1>
        <p className="mt-1.5 text-center text-sm text-muted-foreground">
          For security, the default administrator password must be replaced before continuing.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pw">New password</Label>
            <Input id="pw" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <p className="text-xs text-muted-foreground">Minimum 10 characters, 1 uppercase, 1 number.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw2">Confirm password</Label>
            <Input id="pw2" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Update password
          </Button>
        </form>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
