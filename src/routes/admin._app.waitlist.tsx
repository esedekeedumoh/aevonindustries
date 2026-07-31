import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { adminWaitlistQuery, logActivity, type WaitlistEntry } from "@/lib/admin/api";
import { PageHeader, Panel, AccessDenied, EmptyState, Skeletons, StatusBadge } from "@/components/admin/kit";
import { useAdmin } from "@/lib/admin/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/_app/waitlist")({
  head: () => ({
    meta: [
      { title: "Waitlist — Aevon Admin" },
      { name: "description", content: "People waiting for upcoming Aevon products." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: WaitlistPage,
});

function WaitlistPage() {
  const { canView, canManage } = useAdmin();
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery(adminWaitlistQuery);
  const [term, setTerm] = useState("");
  const [product, setProduct] = useState("all");

  const products = useMemo(
    () => Array.from(new Set(data.map((r) => r.product_name ?? "Unknown"))).sort(),
    [data],
  );

  const rows = useMemo(() => {
    const q = term.trim().toLowerCase();
    return data.filter((r) => {
      const matchesProduct = product === "all" || (r.product_name ?? "Unknown") === product;
      const matchesTerm =
        !q ||
        [r.name, r.email, r.phone, r.product_name].some((v) =>
          String(v ?? "").toLowerCase().includes(q),
        );
      return matchesProduct && matchesTerm;
    });
  }, [data, term, product]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: adminWaitlistQuery.queryKey });

  const markNotified = useMutation({
    mutationFn: async (row: WaitlistEntry) => {
      const { error } = await supabase
        .from("waitlist_entries" as never)
        .update({ status: "notified", notified_at: new Date().toISOString() } as never)
        .eq("id", row.id);
      if (error) throw error;
      await logActivity({
        action: "Marked waitlist entry as notified",
        module: "waitlist",
        details: { id: row.id, email: row.email, product: row.product_name },
      });
    },
    onSuccess: () => {
      toast.success("Marked as notified");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (row: WaitlistEntry) => {
      const { error } = await supabase.from("waitlist_entries" as never).delete().eq("id", row.id);
      if (error) throw error;
      await logActivity({
        action: "Deleted waitlist entry",
        module: "waitlist",
        details: { id: row.id },
      });
    },
    onSuccess: () => {
      toast.success("Removed");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function mailAll() {
    const pending = rows.filter((r) => r.status !== "notified").map((r) => r.email);
    if (pending.length === 0) {
      toast.info("Everyone in this view has already been notified.");
      return;
    }
    const label = product === "all" ? "Aevon" : product;
    window.location.href = `mailto:?bcc=${encodeURIComponent(pending.join(","))}&subject=${encodeURIComponent(
      `${label} is now live`,
    )}`;
  }

  if (!canView("waitlist")) return <AccessDenied />;

  return (
    <>
      <PageHeader
        title="Waitlist"
        description="People waiting for products that are still in progress."
        actions={
          canManage("waitlist") && (
            <Button onClick={mailAll}>
              <Mail className="mr-1.5 h-4 w-4" /> Email pending
            </Button>
          )
        }
      />

      <Panel className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-border/60 p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search name, email or product…"
              className="pl-9"
            />
          </div>
          <select
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            aria-label="Filter by product"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All products</option>
            {products.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4">
              <Skeletons />
            </div>
          ) : rows.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="No waitlist signups yet"
                description="Signups appear here when visitors join a product waitlist."
              />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-border/50 transition hover:bg-muted/30">
                    <td className="px-4 py-3">{row.name}</td>
                    <td className="px-4 py-3">
                      <a className="text-primary hover:underline" href={`mailto:${row.email}`}>
                        {row.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{row.phone || "—"}</td>
                    <td className="px-4 py-3">{row.product_name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {new Date(row.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {canManage("waitlist") && (
                        <div className="flex justify-end gap-1.5">
                          {row.status !== "notified" && (
                            <Button size="sm" variant="outline" onClick={() => markNotified.mutate(row)}>
                              Mark notified
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            aria-label="Delete"
                            onClick={() => remove.mutate(row)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Panel>
    </>
  );
}
