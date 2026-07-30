import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { KeyRound, LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { adminActivityQuery, logActivity } from "@/lib/admin/api";
import { PageHeader, Panel, AccessDenied } from "@/components/admin/kit";
import { useAdmin } from "@/lib/admin/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/_app/security")({
  head: () => ({
    meta: [
      { title: "Security — Aevon Admin" },
      { name: "description", content: "Account security, password policy and session controls." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SecurityPage,
});

function SecurityPage() {
  const { canView, session } = useAdmin();
  const { data: logs = [] } = useQuery(adminActivityQuery);
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  if (!canView("security")) return <AccessDenied />;

  const strongEnough = pw.length >= 10 && /[A-Z]/.test(pw) && /[0-9]/.test(pw);

  async function changePassword() {
    if (!strongEnough) return toast.error("Password must be 10+ chars with an uppercase letter and a number.");
    if (pw !== confirm) return toast.error("Passwords do not match.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return toast.error(error.message);
    await logActivity({ action: "Changed own password", module: "security" });
    setPw("");
    setConfirm("");
    toast.success("Password updated");
  }

  async function signOutEverywhere() {
    await logActivity({ action: "Signed out of all sessions", module: "security" });
    await supabase.auth.signOut({ scope: "global" });
    window.location.href = "/admin/login";
  }

  const failed = logs.filter((l) => l.status === "failed");

  return (
    <>
      <PageHeader title="Security" description="Protect your administrator account and review sign-in activity." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <KeyRound className="h-4 w-4 text-primary" /> Change password
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="pw">New password</Label>
              <Input id="pw" type="password" className="mt-1.5" value={pw} onChange={(e) => setPw(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="cpw">Confirm password</Label>
              <Input
                id="cpw"
                type="password"
                className="mt-1.5"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>At least 10 characters</li>
              <li>One uppercase letter and one number</li>
            </ul>
            <Button onClick={changePassword} disabled={busy}>
              Update password
            </Button>
          </div>
        </Panel>

        <Panel className="p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <ShieldCheck className="h-4 w-4 text-primary" /> Account protection
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Signed in as" value={session?.email ?? "—"} />
            <Row label="Brute-force lockout" value="5 attempts / 15 minutes" />
            <Row label="Idle session timeout" value="30 minutes" />
            <Row label="Public sign-ups" value="Disabled" />
            <Row label="Failed events logged" value={String(failed.length)} />
          </dl>
          <Button variant="outline" className="mt-6" onClick={signOutEverywhere}>
            <LogOut className="mr-1.5 h-4 w-4" /> Sign out of all devices
          </Button>
        </Panel>
      </div>

      <Panel className="mt-6 p-6">
        <h2 className="font-display text-lg font-semibold">Recent security events</h2>
        {failed.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No failed events recorded. </p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm">
            {failed.slice(0, 10).map((l) => (
              <li key={l.id} className="flex justify-between border-b border-border/50 pb-2">
                <span>
                  {l.action} — {l.user_email ?? "unknown"}
                </span>
                <span className="text-muted-foreground">{new Date(l.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
