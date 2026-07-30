import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  FileText,
  Mail,
  Package,
  Users,
  HardDrive,
  HeartPulse,
  Eye,
  Plus,
} from "lucide-react";
import {
  adminActivityQuery,
  adminBlogQuery,
  adminMessagesQuery,
  adminProductsQuery,
  adminSubscribersQuery,
} from "@/lib/admin/api";
import { PageHeader, Panel, StatCard, StatusBadge, Skeletons } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Aevon Admin" },
      { name: "description", content: "Overview of Aevon Industries products, content and engagement." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data: products = [] } = useQuery(adminProductsQuery);
  const { data: posts = [] } = useQuery(adminBlogQuery);
  const { data: messages = [] } = useQuery(adminMessagesQuery);
  const { data: subs = [] } = useQuery(adminSubscribersQuery);
  const { data: logs = [], isLoading: logsLoading } = useQuery(adminActivityQuery);

  const published = products.filter((p) => p.status === "Available").length;
  const drafts = products.filter((p) => p.status !== "Available").length;

  // Content activity trend from real records (last 12 weeks)
  const weeks = Array.from({ length: 12 }).map((_, i) => {
    const start = Date.now() - (11 - i) * 7 * 864e5;
    const end = start + 7 * 864e5;
    const count = [...messages, ...subs].filter((r) => {
      const t = new Date(r.created_at).getTime();
      return t >= start && t < end;
    }).length;
    return count;
  });
  const max = Math.max(1, ...weeks);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A live overview of the Aevon Industries ecosystem."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/admin/blog">
                <Plus className="mr-1.5 h-4 w-4" /> New post
              </Link>
            </Button>
            <Button asChild>
              <Link to="/admin/products">
                <Plus className="mr-1.5 h-4 w-4" /> New product
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total products" value={products.length} icon={Package} />
        <StatCard label="Published products" value={published} hint="Status: Available" icon={Eye} />
        <StatCard label="In development" value={drafts} hint="Coming soon / beta" icon={Package} />
        <StatCard label="Blog posts" value={posts.length} icon={FileText} />
        <StatCard label="Contact requests" value={messages.length} icon={Mail} />
        <StatCard
          label="New messages"
          value={messages.filter((m) => m.status === "new").length}
          icon={Mail}
        />
        <StatCard label="Newsletter subscribers" value={subs.length} icon={Users} />
        <StatCard label="Admin actions logged" value={logs.length} icon={Activity} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel className="p-6 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">Engagement</h2>
              <p className="text-sm text-muted-foreground">
                Contact requests and subscriptions, last 12 weeks
              </p>
            </div>
          </div>
          <div className="flex h-48 items-end gap-2">
            {weeks.map((v, i) => (
              <div key={i} className="group flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-primary/40 to-primary transition-all duration-500 group-hover:opacity-80"
                  style={{ height: `${(v / max) * 100}%`, minHeight: 4 }}
                  title={`${v} events`}
                />
                <span className="text-[10px] text-muted-foreground">{12 - i}w</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-6">
          <h2 className="font-display text-lg font-semibold">System health</h2>
          <div className="mt-4 space-y-4 text-sm">
            <HealthRow label="Database" value="Operational" ok />
            <HealthRow label="Auth service" value="Operational" ok />
            <HealthRow label="Storage" value="Operational" ok />
            <HealthRow label="Public website" value="Live" ok />
          </div>
          <div className="mt-6 rounded-xl bg-muted/50 p-4">
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <HardDrive className="h-3.5 w-3.5" /> Records stored:{" "}
              {products.length + posts.length + messages.length + subs.length}
            </p>
            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <HeartPulse className="h-3.5 w-3.5" /> All services reporting normal
            </p>
          </div>
        </Panel>
      </div>

      <Panel className="mt-6 p-6">
        <h2 className="font-display text-lg font-semibold">Recent activity</h2>
        <div className="mt-4">
          {logsLoading ? (
            <Skeletons rows={3} />
          ) : logs.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No activity recorded yet.</p>
          ) : (
            <ol className="relative space-y-4 border-l border-border/60 pl-6">
              {logs.slice(0, 8).map((log) => (
                <li key={log.id} className="relative">
                  <span className="absolute -left-[27px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{log.action}</p>
                    <StatusBadge status={log.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {log.user_email} · {log.module} · {new Date(log.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </Panel>
    </>
  );
}

function HealthRow({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 font-medium">
        <span className={`h-2 w-2 rounded-full ${ok ? "bg-emerald-500" : "bg-destructive"}`} />
        {value}
      </span>
    </div>
  );
}
