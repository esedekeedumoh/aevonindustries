import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adminActivityQuery } from "@/lib/admin/api";
import { PageHeader, Panel, AccessDenied, EmptyState, Skeletons, StatusBadge } from "@/components/admin/kit";
import { useAdmin } from "@/lib/admin/use-admin";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/_app/activity")({
  head: () => ({
    meta: [
      { title: "Activity Logs — Aevon Admin" },
      { name: "description", content: "Audit trail of every administrative action." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ActivityPage,
});

function browserOf(ua: string | null) {
  if (!ua) return "—";
  if (/edg/i.test(ua)) return "Edge";
  if (/chrome/i.test(ua)) return "Chrome";
  if (/safari/i.test(ua)) return "Safari";
  if (/firefox/i.test(ua)) return "Firefox";
  return "Other";
}

function deviceOf(ua: string | null) {
  if (!ua) return "—";
  return /mobile|android|iphone/i.test(ua) ? "Mobile" : "Desktop";
}

function ActivityPage() {
  const { canView } = useAdmin();
  const { data = [], isLoading } = useQuery(adminActivityQuery);
  const [term, setTerm] = useState("");
  const [module, setModule] = useState("");

  if (!canView("activity")) return <AccessDenied />;

  const modules = Array.from(new Set(data.map((l) => l.module)));
  const rows = data.filter(
    (l) =>
      (!module || l.module === module) &&
      [l.action, l.user_email, l.module].some((v) =>
        String(v ?? "").toLowerCase().includes(term.toLowerCase()),
      ),
  );

  return (
    <>
      <PageHeader title="Activity Logs" description="Immutable audit trail of administrative actions." />
      <Panel className="overflow-hidden">
        <div className="flex flex-wrap gap-3 border-b border-border/60 p-4">
          <Input
            className="min-w-[200px] flex-1"
            placeholder="Search actions or users…"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={module}
            onChange={(e) => setModule(e.target.value)}
          >
            <option value="">All modules</option>
            {modules.map((m) => (
              <option key={m} value={m}>
                {m}
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
              <EmptyState title="No activity recorded" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Module</th>
                  <th className="px-4 py-3 font-medium">Device</th>
                  <th className="px-4 py-3 font-medium">Browser</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((l) => (
                  <tr key={l.id} className="border-t border-border/50 hover:bg-muted/30">
                    <td className="whitespace-nowrap px-4 py-3">{l.user_email ?? "—"}</td>
                    <td className="px-4 py-3 font-medium">{l.action}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{l.module}</td>
                    <td className="px-4 py-3 text-muted-foreground">{deviceOf(l.user_agent)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{browserOf(l.user_agent)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {new Date(l.created_at).toLocaleString()}
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
