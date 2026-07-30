import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, AccessDenied } from "@/components/admin/kit";
import { ResourceManager } from "@/components/admin/resource-manager";
import { adminTeamQuery, type TeamMember } from "@/lib/admin/api";
import { useAdmin } from "@/lib/admin/use-admin";

export const Route = createFileRoute("/admin/_app/team")({
  head: () => ({
    meta: [
      { title: "Team — Aevon Admin" },
      { name: "description", content: "Manage the people behind Aevon Industries." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  const { canView, canManage } = useAdmin();
  if (!canView("team")) return <AccessDenied />;

  return (
    <>
      <PageHeader title="Team" description="Profiles shown in the public team and founder sections." />
      <ResourceManager<TeamMember>
        title="Team member"
        table="team_members"
        moduleKey="team"
        query={adminTeamQuery}
        canManage={canManage("team")}
        searchKeys={["name", "role", "department"]}
        defaults={{ featured: false, sort_order: 0 } as Partial<TeamMember>}
        columns={[
          {
            header: "Member",
            render: (m) => (
              <div className="flex items-center gap-3">
                {m.photo_url ? (
                  <img src={m.photo_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {m.name.slice(0, 2)}
                  </span>
                )}
                <span className="font-medium">{m.name}</span>
              </div>
            ),
          },
          { header: "Role", render: (m) => m.role },
          { header: "Department", render: (m) => m.department ?? "—" },
          { header: "Featured", render: (m) => (m.featured ? "Yes" : "—") },
          { header: "Order", render: (m) => m.sort_order },
        ]}
        fields={[
          { name: "name", label: "Full name", required: true },
          { name: "role", label: "Role", required: true },
          { name: "department", label: "Department" },
          { name: "email", label: "Email" },
          { name: "photo_url", label: "Photo URL" },
          { name: "linkedin_url", label: "LinkedIn" },
          { name: "x_url", label: "X (Twitter)" },
          { name: "github_url", label: "GitHub" },
          { name: "bio", label: "Biography", type: "textarea" },
          { name: "sort_order", label: "Display order", type: "number" },
          { name: "featured", label: "Featured", type: "switch" },
        ]}
      />
    </>
  );
}
