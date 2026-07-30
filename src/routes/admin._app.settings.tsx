import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { siteSettingsQuery, logActivity } from "@/lib/admin/api";
import { PageHeader, Panel, AccessDenied } from "@/components/admin/kit";
import { useAdmin } from "@/lib/admin/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Aevon Admin" },
      { name: "description", content: "Global site settings for the Aevon Industries website." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SettingsPage,
});

const FIELDS: { key: string; label: string; multiline?: boolean }[] = [
  { key: "site_name", label: "Site name" },
  { key: "tagline", label: "Tagline" },
  { key: "contact_email", label: "Contact email" },
  { key: "contact_phone", label: "Contact phone" },
  { key: "address", label: "Address" },
  { key: "seo_title", label: "Default SEO title" },
  { key: "seo_description", label: "Default SEO description", multiline: true },
  { key: "twitter_url", label: "X (Twitter) URL" },
  { key: "linkedin_url", label: "LinkedIn URL" },
  { key: "instagram_url", label: "Instagram URL" },
  { key: "github_url", label: "GitHub URL" },
  { key: "announcement", label: "Announcement banner", multiline: true },
];

function SettingsPage() {
  const { canView, canManage } = useAdmin();
  const queryClient = useQueryClient();
  const { data = [] } = useQuery(siteSettingsQuery);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const row of data) {
      const v = row.value as { text?: string } | string | null;
      next[row.key] = typeof v === "string" ? v : (v?.text ?? "");
    }
    setValues((prev) => ({ ...next, ...prev }));
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const rows = FIELDS.map((f) => ({ key: f.key, value: { text: values[f.key] ?? "" } }));
      const { error } = await supabase.from("site_settings").upsert(rows as never, { onConflict: "key" });
      if (error) throw error;
      await logActivity({ action: "Updated site settings", module: "settings" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteSettingsQuery.queryKey });
      toast.success("Settings saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!canView("settings")) return <AccessDenied />;

  return (
    <>
      <PageHeader
        title="Settings"
        description="Global configuration used across the public website."
        actions={
          canManage("settings") && (
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              <Save className="mr-1.5 h-4 w-4" /> Save changes
            </Button>
          )
        }
      />
      <Panel className="p-6">
        <div className="grid gap-5 md:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.key} className={f.multiline ? "md:col-span-2" : ""}>
              <Label htmlFor={f.key}>{f.label}</Label>
              {f.multiline ? (
                <Textarea
                  id={f.key}
                  className="mt-1.5"
                  rows={3}
                  disabled={!canManage("settings")}
                  value={values[f.key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                />
              ) : (
                <Input
                  id={f.key}
                  className="mt-1.5"
                  disabled={!canManage("settings")}
                  value={values[f.key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
