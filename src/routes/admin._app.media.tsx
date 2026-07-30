import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, AccessDenied } from "@/components/admin/kit";
import { ResourceManager } from "@/components/admin/resource-manager";
import { adminMediaQuery, type MediaAsset } from "@/lib/admin/api";
import { useAdmin } from "@/lib/admin/use-admin";

export const Route = createFileRoute("/admin/_app/media")({
  head: () => ({
    meta: [
      { title: "Media Library — Aevon Admin" },
      { name: "description", content: "Central library of images and files used across the Aevon website." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MediaPage,
});

function MediaPage() {
  const { canView, canManage } = useAdmin();
  if (!canView("media")) return <AccessDenied />;

  return (
    <>
      <PageHeader
        title="Media Library"
        description="Register image and file URLs once, then reuse them across products, blog posts and team profiles."
      />
      <ResourceManager<MediaAsset>
        title="Media asset"
        table="media_assets"
        moduleKey="media"
        query={adminMediaQuery}
        canManage={canManage("media")}
        searchKeys={["name", "folder", "file_type"]}
        defaults={{ folder: "general" } as Partial<MediaAsset>}
        columns={[
          {
            header: "Asset",
            render: (m) => (
              <div className="flex items-center gap-3">
                <img
                  src={m.url}
                  alt={m.alt_text ?? ""}
                  className="h-10 w-10 rounded-lg border border-border/60 object-cover"
                  loading="lazy"
                />
                <div className="min-w-0">
                  <p className="truncate font-medium">{m.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{m.url}</p>
                </div>
              </div>
            ),
          },
          { header: "Folder", render: (m) => m.folder },
          { header: "Type", render: (m) => m.file_type ?? "—" },
          {
            header: "Added",
            render: (m) => new Date(m.created_at).toLocaleDateString(),
          },
        ]}
        fields={[
          { name: "name", label: "Name", required: true },
          { name: "url", label: "File URL", required: true },
          { name: "folder", label: "Folder" },
          { name: "file_type", label: "File type", placeholder: "image/png" },
          { name: "alt_text", label: "Alt text" },
          { name: "caption", label: "Caption", type: "textarea", full: true },
        ]}
      />
    </>
  );
}
