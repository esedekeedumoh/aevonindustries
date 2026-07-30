import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Mail, Reply, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { adminMessagesQuery, logActivity, type ContactMessage } from "@/lib/admin/api";
import { PageHeader, Panel, AccessDenied, EmptyState, Skeletons, StatusBadge } from "@/components/admin/kit";
import { useAdmin } from "@/lib/admin/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/_app/messages")({
  head: () => ({
    meta: [
      { title: "Messages — Aevon Admin" },
      { name: "description", content: "Inbox for every contact request submitted on the Aevon website." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const { canView, canManage } = useAdmin();
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery(adminMessagesQuery);
  const [term, setTerm] = useState("");
  const [active, setActive] = useState<ContactMessage | null>(null);

  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id);
      if (error) throw error;
      await logActivity({ action: `Marked message ${status}`, module: "messages", details: { id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminMessagesQuery.queryKey });
      toast.success("Updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_messages").delete().eq("id", id);
      if (error) throw error;
      await logActivity({ action: "Deleted message", module: "messages", details: { id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminMessagesQuery.queryKey });
      setActive(null);
      toast.success("Deleted");
    },
  });

  if (!canView("messages")) return <AccessDenied />;

  const filtered = data.filter((m) =>
    [m.name, m.email, m.subject, m.message].some((v) =>
      String(v ?? "").toLowerCase().includes(term.toLowerCase()),
    ),
  );

  return (
    <>
      <PageHeader
        title="Messages"
        description={`${data.filter((m) => m.status === "new").length} unread of ${data.length} total`}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Panel className="overflow-hidden">
          <div className="border-b border-border/60 p-4">
            <Input placeholder="Search messages…" value={term} onChange={(e) => setTerm(e.target.value)} />
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {isLoading ? (
              <div className="p-4">
                <Skeletons />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-4">
                <EmptyState title="No messages" description="Contact form submissions land here." />
              </div>
            ) : (
              filtered.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setActive(m);
                    if (m.status === "new" && canManage("messages")) {
                      update.mutate({ id: m.id, status: "read" });
                    }
                  }}
                  className={`flex w-full flex-col items-start gap-1 border-b border-border/50 p-4 text-left transition hover:bg-muted/40 ${
                    active?.id === m.id ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="truncate font-medium">{m.name}</span>
                    <StatusBadge status={m.status} />
                  </div>
                  <span className="truncate text-xs text-muted-foreground">{m.subject || "No subject"}</span>
                  <span className="line-clamp-1 text-xs text-muted-foreground">{m.message}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(m.created_at).toLocaleString()}
                  </span>
                </button>
              ))
            )}
          </div>
        </Panel>

        <Panel className="p-6">
          {active ? (
            <div className="space-y-4">
              <div>
                <h2 className="font-display text-xl font-semibold">{active.subject || "No subject"}</h2>
                <p className="text-sm text-muted-foreground">
                  {active.name} · {active.email} · {new Date(active.created_at).toLocaleString()}
                </p>
              </div>
              <p className="whitespace-pre-wrap rounded-xl bg-muted/40 p-4 text-sm leading-relaxed">
                {active.message}
              </p>
              {canManage("messages") && (
                <div className="flex flex-wrap gap-2">
                  <Button asChild>
                    <a href={`mailto:${active.email}?subject=Re: ${encodeURIComponent(active.subject ?? "")}`}>
                      <Reply className="mr-1.5 h-4 w-4" /> Reply
                    </a>
                  </Button>
                  <Button variant="outline" onClick={() => update.mutate({ id: active.id, status: "archived" })}>
                    <Archive className="mr-1.5 h-4 w-4" /> Archive
                  </Button>
                  <Button variant="ghost" className="text-destructive" onClick={() => remove.mutate(active.id)}>
                    <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid h-full place-items-center py-16 text-center text-muted-foreground">
              <div>
                <Mail className="mx-auto h-8 w-8" />
                <p className="mt-3 text-sm">Select a message to read it.</p>
              </div>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
