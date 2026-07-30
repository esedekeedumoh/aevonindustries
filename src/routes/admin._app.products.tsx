import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, AccessDenied, StatusBadge } from "@/components/admin/kit";
import { ResourceManager } from "@/components/admin/resource-manager";
import { adminProductsQuery, adminCategoriesQuery, type AdminProduct } from "@/lib/admin/api";
import { useAdmin } from "@/lib/admin/use-admin";

export const Route = createFileRoute("/admin/_app/products")({
  head: () => ({
    meta: [
      { title: "Products — Aevon Admin" },
      { name: "description", content: "Create, edit and publish products in the Aevon ecosystem." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { canView, canManage } = useAdmin();
  const { data: categories = [] } = useQuery(adminCategoriesQuery);
  if (!canView("products")) return <AccessDenied />;

  return (
    <>
      <PageHeader
        title="Products"
        description="Everything here powers the public ecosystem grid instantly."
      />
      <ResourceManager<AdminProduct>
        title="Product"
        table="products"
        moduleKey="products"
        query={adminProductsQuery}
        canManage={canManage("products")}
        allowDuplicate
        searchKeys={["name", "category", "status", "platform"]}
        defaults={{ status: "Coming Soon", featured: false, archived: false, sort_order: 0, images: [], tags: [] } as Partial<AdminProduct>}
        columns={[
          {
            header: "Product",
            render: (p) => (
              <div className="flex items-center gap-3">
                {p.logo_url ? (
                  <img src={p.logo_url} alt="" className="h-8 w-8 rounded-lg object-contain" />
                ) : (
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                    {p.name.slice(0, 2)}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">/{p.slug}</p>
                </div>
              </div>
            ),
          },
          { header: "Category", render: (p) => p.category },
          { header: "Platform", render: (p) => p.platform ?? "—" },
          { header: "Status", render: (p) => <StatusBadge status={p.status} /> },
          { header: "Featured", render: (p) => (p.featured ? "Yes" : "—") },
          { header: "Order", render: (p) => p.sort_order },
        ]}
        fields={[
          { name: "name", label: "Product name", required: true },
          { name: "slug", label: "Slug", required: true },
          {
            name: "category",
            label: "Category",
            type: "select",
            options: categories.map((c) => c.name),
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: ["Available", "Beta", "Coming Soon", "In Development"],
          },
          { name: "platform", label: "Platform" },
          { name: "version", label: "Version" },
          { name: "description", label: "Short description", type: "textarea", required: true },
          { name: "long_description", label: "Long description", type: "textarea" },
          { name: "logo_url", label: "Logo URL" },
          { name: "website_url", label: "Website URL" },
          { name: "download_url", label: "Download URL" },
          { name: "docs_url", label: "Documentation URL" },
          { name: "video_url", label: "Video URL" },
          { name: "images", label: "Gallery image URLs", type: "tags", full: true },
          { name: "tags", label: "Tags", type: "tags", full: true },
          { name: "release_date", label: "Release date", type: "date" },
          { name: "sort_order", label: "Display order", type: "number" },
          { name: "featured", label: "Featured", type: "switch" },
          { name: "archived", label: "Archived", type: "switch" },
          { name: "seo_title", label: "SEO title" },
          { name: "seo_description", label: "SEO description", type: "textarea" },
        ]}
      />
    </>
  );
}
