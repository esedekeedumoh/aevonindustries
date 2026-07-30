import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { adminSubscribersQuery, logActivity } from "@/lib/admin/api";
import { PageHeader, Panel, AccessDenied, EmptyState, Skeletons } from "@/components/admin/kit";
import { useAdmin } from "@/lib/admin/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/_app/subscribers")({
  head: () => ({
    meta: [
      { title: "Subscribers — Aevon Admin" },
      { name: "description", content: "Newsletter audience for Aevon Industries." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SubscribersPage,
});

function SubscribersPage() {
  const { canView, canManage } = useAdmin();
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery(adminSubscribersQuery);
  const [term, setTerm] = useState("");

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
      if (error) throw error;
      await logActivity({ action: "Removed subscriber", module: "subscribers", details: { id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminSubscribersQuery.queryKey });
      toast.success("Subscriber removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!canView("subscribers")) return <AccessDenied />;

  const rows = data.filter((s) => s.email.toLowerCase().includes(term.toLowerCase()));

  function exportCsv() {
    const csv = ["email,subscribed_at", ...rows.map((r) => `${r.email},${r.created_at}`)].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `aevon-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    void logActivity({ action: "Exported subscribers CSV", module: "subscribers" });
  }

  return (
    <>
      <PageHeader
        title="Subscribers"
        description={`${data.length} people subscribed to the Aevon newsletter.`}
        actions={
          <Button variant="outline" onClick={exportCsv}>
            <Download className="mr-1.5 h-4 w-4" /> Export CSV
          </Button>
        }
      />
      <Panel className="overflow-hidden">
        <div className="border-b border-border/60 p-4">
          <Input placeholder="Search email…" value={term} onChange={(e) => setTerm(e.target.value)} />
        </div>
        {isLoading ? (
          <div className="p-4">
            <Skeletons />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-4">
            <EmptyState title="No subscribers yet" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Subscribed</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-t border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{s.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(s.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canManage("subscribers") && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => remove.mutate(s.id)}
                        aria-label="Remove subscriber"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  );
}
