import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Sign In — Aevon Industries" },
      { name: "description", content: "Secure administrator access to the Aevon Industries control center." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLogin,
});

const LOCK_KEY = "aevon-admin-lock";
const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

type LockState = { attempts: number; until: number };

function readLock(): LockState {
  try {
    return JSON.parse(localStorage.getItem(LOCK_KEY) ?? "") as LockState;
  } catch {
    return { attempts: 0, until: 0 };
  }
}

function AdminLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "forgot">("login");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const lock = readLock();
    if (lock.until > Date.now()) {
      const mins = Math.ceil((lock.until - Date.now()) / 60000);
      toast.error(`Account temporarily locked. Try again in ${mins} minute(s).`);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error || !data.user) {
      const attempts = lock.attempts + 1;
      const state: LockState = {
        attempts,
        until: attempts >= MAX_ATTEMPTS ? Date.now() + LOCK_MS : 0,
      };
      localStorage.setItem(LOCK_KEY, JSON.stringify(state));
      setLoading(false);
      toast.error(
        attempts >= MAX_ATTEMPTS
          ? "Too many failed attempts. Account locked for 15 minutes."
          : `Invalid credentials. ${MAX_ATTEMPTS - attempts} attempt(s) remaining.`,
      );
      return;
    }

    localStorage.removeItem(LOCK_KEY);
    if (!remember) sessionStorage.setItem("aevon-admin-session-only", "1");

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);

    if (!roles || roles.length === 0) {
      await supabase.auth.signOut();
      setLoading(false);
      toast.error("This account has no administrator access.");
      return;
    }

    const { data: profile } = await supabase
      .from("admin_profiles")
      .select("must_change_password")
      .eq("id", data.user.id)
      .maybeSingle();

    await supabase.from("activity_logs").insert({
      user_id: data.user.id,
      user_email: data.user.email ?? "",
      action: "Signed in",
      module: "auth",
      status: "success",
      user_agent: navigator.userAgent,
    });
    await supabase
      .from("admin_profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", data.user.id);

    await queryClient.invalidateQueries();
    setLoading(false);
    navigate({
      to: profile?.must_change_password ? "/admin/change-password" : "/admin",
      replace: true,
    });
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/admin/change-password`,
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("If that address is registered, a reset link is on its way.");
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-accent/20 blur-[120px]" />

      <div className="relative w-full max-w-md rounded-3xl border border-border/60 bg-card/70 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-lg font-bold text-primary-foreground">
            A
          </span>
          <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight">
            {mode === "login" ? "Admin Sign In" : "Reset password"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {mode === "login"
              ? "Aevon Industries Control Center"
              : "We'll email you a secure reset link."}
          </p>
        </div>

        <form onSubmit={mode === "login" ? handleLogin : handleForgot} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@aevon.admin"
                className="pl-9"
              />
            </div>
          </div>

          {mode === "login" && (
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                />
              </div>
            </div>
          )}

          {mode === "login" && (
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
                Remember me
              </label>
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={() => setMode("forgot")}
              >
                Forgot password?
              </button>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {mode === "login" ? "Sign in securely" : "Send reset link"}
          </Button>

          {mode === "forgot" && (
            <button
              type="button"
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setMode("login")}
            >
              Back to sign in
            </button>
          )}
        </form>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" /> Protected by encrypted sessions, CSRF protection and
          activity logging.
        </p>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            ← Back to aevonindustries.site
          </Link>
        </p>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
