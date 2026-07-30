import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, AccessDenied, StatusBadge } from "@/components/admin/kit";
import { ResourceManager } from "@/components/admin/resource-manager";
import { adminCareersQuery, type JobOpening } from "@/lib/admin/api";
import { useAdmin } from "@/lib/admin/use-admin";

export const Route = createFileRoute("/admin/_app/careers")({
  head: () => ({
    meta: [
      { title: "Careers — Aevon Admin" },
      { name: "description", content: "Publish and manage open roles at Aevon Industries." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CareersPage,
});

function CareersPage() {
  const { canView, canManage } = useAdmin();
  if (!canView("careers")) return <AccessDenied />;

  return (
    <>
      <PageHeader title="Careers" description="Roles published here appear in the public careers section." />
      <ResourceManager<JobOpening>
        title="Job opening"
        table="job_openings"
        moduleKey="careers"
        query={adminCareersQuery}
        canManage={canManage("careers")}
        allowDuplicate
        searchKeys={["title", "department", "location", "status"]}
        defaults={{ status: "open", employment_type: "Full-time", sort_order: 0, description: "" } as Partial<JobOpening>}
        columns={[
          { header: "Role", render: (j) => <span className="font-medium">{j.title}</span> },
          { header: "Department", render: (j) => j.department ?? "—" },
          { header: "Location", render: (j) => j.location ?? "Remote" },
          { header: "Type", render: (j) => j.employment_type },
          { header: "Status", render: (j) => <StatusBadge status={j.status} /> },
        ]}
        fields={[
          { name: "title", label: "Job title", required: true },
          { name: "slug", label: "Slug", required: true },
          { name: "department", label: "Department" },
          { name: "location", label: "Location" },
          {
            name: "employment_type",
            label: "Employment type",
            type: "select",
            options: ["Full-time", "Part-time", "Contract", "Internship"],
          },
          { name: "level", label: "Level", type: "select", options: ["Intern", "Junior", "Mid", "Senior", "Lead"] },
          { name: "salary_range", label: "Salary range" },
          { name: "apply_url", label: "Application URL" },
          { name: "status", label: "Status", type: "select", options: ["open", "paused", "closed"] },
          { name: "description", label: "Role description", type: "textarea", full: true },
          { name: "requirements", label: "Requirements", type: "textarea", full: true },
          { name: "sort_order", label: "Display order", type: "number" },
        ]}
      />
    </>
  );
}
