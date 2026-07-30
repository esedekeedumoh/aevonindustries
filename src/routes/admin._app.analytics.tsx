import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  adminActivityQuery,
  adminMessagesQuery,
  adminProductsQuery,
  adminSubscribersQuery,
} from "@/lib/admin/api";
import { PageHeader, Panel, StatCard, AccessDenied } from "@/components/admin/kit";
import { useAdmin } from "@/lib/admin/use-admin";
import { Activity, Mail, Package, Users } from "lucide-react";

export const Route = createFileRoute("/admin/_app/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Aevon Admin" },
      { name: "description", content: "Engagement and content analytics for Aevon Industries." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { canView } = useAdmin();
  const { data: messages = [] } = useQuery(adminMessagesQuery);
  const { data: subs = [] } = useQuery(adminSubscribersQuery);
  const { data: products = [] } = useQuery(adminProductsQuery);
  const { data: logs = [] } = useQuery(adminActivityQuery);

  if (!canView("analytics")) return <AccessDenied />;

  const days = Array.from({ length: 30 }).map((_, i) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (29 - i));
    const end = new Date(start).getTime() + 864e5;
    const count = [...messages, ...subs].filter((r) => {
      const t = new Date(r.created_at).getTime();
      return t >= start.getTime() && t < end;
    }).length;
    return { label: start.toLocaleDateString(undefined, { day: "numeric", month: "short" }), count };
  });
  const max = Math.max(1, ...days.map((d) => d.count));

  const byCategory = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Measured from real records in your database. Connect a web analytics provider for visitor-level metrics."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Contact requests (30d)" value={days.reduce((a, d) => a + d.count, 0)} icon={Mail} />
        <StatCard label="Subscribers" value={subs.length} icon={Users} />
        <StatCard label="Products live" value={products.filter((p) => p.status === "Available").length} icon={Package} />
        <StatCard label="Admin actions" value={logs.length} icon={Activity} />
      </div>

      <Panel className="mt-6 p-6">
        <h2 className="font-display text-lg font-semibold">Daily engagement — last 30 days</h2>
        <div className="mt-6 flex h-52 items-end gap-1">
          {days.map((d) => (
            <div
              key={d.label}
              className="flex-1 rounded-t bg-gradient-to-t from-primary/30 to-primary transition-all hover:opacity-80"
              style={{ height: `${(d.count / max) * 100}%`, minHeight: 3 }}
              title={`${d.label}: ${d.count}`}
            />
          ))}
        </div>
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel className="p-6">
          <h2 className="font-display text-lg font-semibold">Products by category</h2>
          <div className="mt-4 space-y-3">
            {Object.entries(byCategory).map(([cat, count]) => (
              <div key={cat}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{cat}</span>
                  <span className="text-muted-foreground">{count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    style={{ width: `${(count / products.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-6">
          <h2 className="font-display text-lg font-semibold">Top products by ecosystem order</h2>
          <ol className="mt-4 space-y-3 text-sm">
            {products.slice(0, 6).map((p, i) => (
              <li key={p.id} className="flex items-center justify-between">
                <span className="flex items-center gap-3">
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  {p.name}
                </span>
                <span className="text-muted-foreground">{p.status}</span>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </>
  );
}
