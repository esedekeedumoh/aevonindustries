import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, AccessDenied, StatusBadge } from "@/components/admin/kit";
import { ResourceManager } from "@/components/admin/resource-manager";
import { adminBlogQuery, type BlogPost } from "@/lib/admin/api";
import { useAdmin } from "@/lib/admin/use-admin";

export const Route = createFileRoute("/admin/_app/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Aevon Admin" },
      { name: "description", content: "Write, schedule and publish Aevon Industries articles." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  const { canView, canManage } = useAdmin();
  if (!canView("blog")) return <AccessDenied />;

  return (
    <>
      <PageHeader
        title="Blog"
        description="Drafts, scheduled posts and published articles with full SEO control."
      />
      <ResourceManager<BlogPost>
        title="Post"
        table="blog_posts"
        moduleKey="blog"
        query={adminBlogQuery}
        canManage={canManage("blog")}
        allowDuplicate
        searchKeys={["title", "slug", "author", "status"]}
        defaults={{ status: "draft", comments_enabled: true, tags: [], content: "" } as Partial<BlogPost>}
        columns={[
          { header: "Title", render: (p) => <span className="font-medium">{p.title}</span> },
          { header: "Category", render: (p) => p.category ?? "—" },
          { header: "Author", render: (p) => p.author ?? "—" },
          { header: "Status", render: (p) => <StatusBadge status={p.status} /> },
          {
            header: "Published",
            render: (p) => (p.published_at ? new Date(p.published_at).toLocaleDateString() : "—"),
          },
        ]}
        fields={[
          { name: "title", label: "Title", required: true },
          { name: "slug", label: "Slug", required: true },
          { name: "excerpt", label: "Excerpt", type: "textarea" },
          { name: "content", label: "Content (Markdown supported)", type: "textarea", full: true },
          { name: "cover_image", label: "Cover image URL" },
          { name: "category", label: "Category" },
          { name: "author", label: "Author" },
          { name: "status", label: "Status", type: "select", options: ["draft", "scheduled", "published"] },
          { name: "published_at", label: "Publish date", type: "date" },
          { name: "tags", label: "Tags", type: "tags", full: true },
          { name: "comments_enabled", label: "Comments enabled", type: "switch" },
          { name: "seo_title", label: "SEO title" },
          { name: "seo_description", label: "SEO description", type: "textarea" },
        ]}
      />
    </>
  );
}
