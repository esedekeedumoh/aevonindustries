import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search } from "lucide-react";
import { listSiteUsers } from "@/lib/admin/admins.functions";
import { PageHeader, Panel, AccessDenied, Skeletons } from "@/components/admin/kit";
import { useAdmin } from "@/lib/admin/use-admin";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/_app/users")({
  head: () => ({
    meta: [
      { title: "Site Users — Aevon Admin" },
      { name: "description", content: "View people who signed up on the Aevon Industries website." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: UsersPage,
});

function UsersPage() {
  const { canView } = useAdmin();
  const fetchUsers = useServerFn(listSiteUsers);
  const [q, setQ] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin", "site-users"],
    queryFn: () => fetchUsers(),
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => u.email.toLowerCase().includes(term));
  }, [users, q]);

  if (!canView("admins")) return <AccessDenied />;

  return (
    <>
      <PageHeader
        title="Site Users"
        description="People who created an account on the public website. Administrators are managed separately."
      />

      <Panel className="overflow-x-auto">
        <div className="flex items-center gap-2 border-b border-border/50 p-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by email…"
            className="h-9 max-w-xs"
          />
          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} users</span>
        </div>

        {isLoading ? (
          <div className="p-4">
            <Skeletons />
          </div>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No site users yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Confirmed</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Last sign-in</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{u.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.confirmed ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : "Never"}
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
