import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Database, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/admin/api";
import { PageHeader, Panel, AccessDenied } from "@/components/admin/kit";
import { useAdmin } from "@/lib/admin/use-admin";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/_app/backup")({
  head: () => ({
    meta: [
      { title: "Backup — Aevon Admin" },
      { name: "description", content: "Export a full snapshot of your Aevon content database." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BackupPage,
});

const TABLES = [
  "products",
  "categories",
  "blog_posts",
  "team_members",
  "job_openings",
  "media_assets",
  "site_settings",
  "contact_messages",
  "newsletter_subscribers",
] as const;

function BackupPage() {
  const { canView, canManage } = useAdmin();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  if (!canView("backup")) return <AccessDenied />;

  async function exportAll(only?: string) {
    setBusy(true);
    try {
      const tables = only ? [only] : [...TABLES];
      const snapshot: Record<string, unknown[]> = {};
      for (const t of tables) {
        const { data, error } = await supabase.from(t as never).select("*");
        if (error) throw error;
        snapshot[t] = data ?? [];
      }
      const blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), data: snapshot }, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aevon-backup-${only ?? "full"}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      await logActivity({ action: `Exported backup (${only ?? "full"})`, module: "backup" });
      toast.success("Backup downloaded");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Backup & Export"
        description="Download a portable JSON snapshot of your content at any time."
        actions={
          canManage("backup") && (
            <Button onClick={() => exportAll()} disabled={busy}>
              <Download className="mr-1.5 h-4 w-4" /> Export everything
            </Button>
          )
        }
      />
      <Panel className="p-6">
        <h2 className="font-display text-lg font-semibold">Export individual collections</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TABLES.map((t) => (
            <button
              key={t}
              disabled={busy}
              onClick={() => exportAll(t)}
              className="flex items-center justify-between rounded-xl border border-border/60 bg-card/50 px-4 py-3 text-left text-sm transition hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50"
            >
              <span className="flex items-center gap-2 capitalize">
                <Database className="h-4 w-4 text-primary" />
                {t.replace(/_/g, " ")}
              </span>
              <Download className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </Panel>
      <Panel className="mt-6 p-6">
        <h2 className="font-display text-lg font-semibold">Cache</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Refresh every cached dataset in the dashboard if data looks stale.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            queryClient.invalidateQueries();
            toast.success("Dashboard data refreshed");
          }}
        >
          Clear dashboard cache
        </Button>
      </Panel>
    </>
  );
}
