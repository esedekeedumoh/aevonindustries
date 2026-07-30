import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, AccessDenied } from "@/components/admin/kit";
import { ResourceManager } from "@/components/admin/resource-manager";
import { adminCategoriesQuery, type Category } from "@/lib/admin/api";
import { useAdmin } from "@/lib/admin/use-admin";

export const Route = createFileRoute("/admin/_app/categories")({
  head: () => ({
    meta: [
      { title: "Categories — Aevon Admin" },
      { name: "description", content: "Organise the Aevon product ecosystem into categories." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { canView, canManage } = useAdmin();
  if (!canView("categories")) return <AccessDenied />;

  return (
    <>
      <PageHeader title="Categories" description="Used across the ecosystem grid and product filters." />
      <ResourceManager<Category>
        title="Category"
        table="categories"
        moduleKey="categories"
        query={adminCategoriesQuery}
        canManage={canManage("categories")}
        searchKeys={["name", "slug"]}
        defaults={{ sort_order: 0 } as Partial<Category>}
        columns={[
          { header: "Name", render: (c) => <span className="font-medium">{c.name}</span> },
          { header: "Slug", render: (c) => <span className="text-muted-foreground">/{c.slug}</span> },
          { header: "Icon", render: (c) => c.icon ?? "—" },
          { header: "Order", render: (c) => c.sort_order },
        ]}
        fields={[
          { name: "name", label: "Name", required: true },
          { name: "slug", label: "Slug", required: true },
          { name: "icon", label: "Lucide icon name", placeholder: "Sparkles" },
          { name: "sort_order", label: "Display order", type: "number" },
          { name: "description", label: "Description", type: "textarea" },
        ]}
      />
    </>
  );
}
