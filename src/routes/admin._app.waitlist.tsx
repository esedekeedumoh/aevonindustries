import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Mail, Search, Send, Trash2 } from "lucide-react";
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

const PAGE_SIZE = 15;

function csvCell(value: unknown) {
  const s = value === null || value === undefined ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

function WaitlistPage() {
  const { canView, canManage } = useAdmin();
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery(adminWaitlistQuery);
  const [term, setTerm] = useState("");
  const [product, setProduct] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const products = useMemo(
    () => Array.from(new Set(data.map((r) => r.product_name ?? "Unknown"))).sort(),
    [data],
  );

  const rows = useMemo(() => {
    const q = term.trim().toLowerCase();
    return data.filter((r) => {
      const matchesProduct = product === "all" || (r.product_name ?? "Unknown") === product;
      const matchesStatus =
        status === "all" ||
        (status === "notified" ? r.status === "notified" : r.status !== "notified");
      const matchesTerm =
        !q ||
        [r.name, r.email, r.phone, r.product_name].some((v) =>
          String(v ?? "").toLowerCase().includes(q),
        );
      return matchesProduct && matchesStatus && matchesTerm;
    });
  }, [data, term, product, status]);

  useEffect(() => {
    setPage(1);
  }, [term, product, status]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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

  const markManyNotified = useMutation({
    mutationFn: async (entries: WaitlistEntry[]) => {
      const ids = entries.map((e) => e.id);
      const { error } = await supabase
        .from("waitlist_entries" as never)
        .update({ status: "notified", notified_at: new Date().toISOString() } as never)
        .in("id", ids);
      if (error) throw error;
      await logActivity({
        action: "Marked waitlist entries as notified (bulk)",
        module: "waitlist",
        details: { count: ids.length },
      });
    },
    onSuccess: () => {
      toast.success("Message sent status updated");
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
    const pending = rows.filter((r) => r.status !== "notified");
    if (pending.length === 0) {
      toast.info("Everyone in this view has already been notified.");
      return;
    }
    const label = product === "all" ? "Aevon" : product;
    window.location.href = `mailto:?bcc=${encodeURIComponent(
      pending.map((r) => r.email).join(","),
    )}&subject=${encodeURIComponent(`${label} is now live`)}`;
    markManyNotified.mutate(pending);
  }

  function mailOne(row: WaitlistEntry) {
    window.location.href = `mailto:${encodeURIComponent(row.email)}?subject=${encodeURIComponent(
      `${row.product_name ?? "Aevon"} update`,
    )}`;
    if (row.status !== "notified") markNotified.mutate(row);
  }

  function exportCsv() {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Product",
      "Status",
      "Message sent",
      "Notified at",
      "Joined",
    ];
    const lines = [
      headers.map(csvCell).join(","),
      ...rows.map((r) =>
        [
          r.name,
          r.email,
          r.phone ?? "",
          r.product_name ?? "",
          r.status,
          r.notified_at ? "Sent" : "Not sent",
          r.notified_at ?? "",
          r.created_at,
        ]
          .map(csvCell)
          .join(","),
      ),
    ];
    const blob = new Blob([`\uFEFF${lines.join("\n")}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aevon-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    void logActivity({ action: "Exported waitlist CSV", module: "waitlist", details: { rows: rows.length } });
    toast.success("CSV downloaded");
  }

  if (!canView("waitlist")) return <AccessDenied />;

  return (
    <>
      <PageHeader
        title="Waitlist"
        description="People waiting for products that are still in progress."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportCsv} disabled={rows.length === 0}>
              <Download className="mr-1.5 h-4 w-4" /> Export CSV
            </Button>
            {canManage("waitlist") && (
              <Button onClick={mailAll}>
                <Mail className="mr-1.5 h-4 w-4" /> Email pending
              </Button>
            )}
          </div>
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
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="waiting">Waiting</option>
            <option value="notified">Notified</option>
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
                title="No waitlist signups found"
                description="Try clearing filters, or wait for visitors to join a product waitlist."
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
                  <th className="px-4 py-3 font-medium">Message sent</th>
                  <th className="px-4 py-3 font-medium">Notified</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => (
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
                    <td className="px-4 py-3">
                      <StatusBadge status={row.notified_at ? "Sent" : "Pending"} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {row.notified_at ? new Date(row.notified_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {new Date(row.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {canManage("waitlist") && (
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-label="Email this person"
                            onClick={() => mailOne(row)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
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

        {rows.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 p-4 text-sm text-muted-foreground">
            <span>
              Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, rows.length)} of{" "}
              {rows.length}
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span>
                Page {safePage} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Panel>
    </>
  );
}
