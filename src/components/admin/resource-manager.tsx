import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { Copy, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/admin/api";
import { Panel, EmptyState, Skeletons, StatusBadge } from "./kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type FieldType = "text" | "textarea" | "number" | "select" | "switch" | "date" | "tags";

export type Field = {
  name: string;
  label: string;
  type?: FieldType;
  options?: string[];
  placeholder?: string;
  required?: boolean;
  full?: boolean;
};

export type Column<T> = {
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
};

type Row = Record<string, unknown> & { id: string };

export function ResourceManager<T extends Row>({
  title,
  table,
  moduleKey,
  query,
  columns,
  fields,
  searchKeys,
  canManage,
  defaults,
  allowDuplicate,
}: {
  title: string;
  table: string;
  moduleKey: string;
  query: UseQueryOptions<T[], Error, T[], string[]>;
  columns: Column<T>[];
  fields: Field[];
  searchKeys: (keyof T & string)[];
  canManage: boolean;
  defaults?: Partial<T>;
  allowDuplicate?: boolean;
}) {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery(query);
  const [term, setTerm] = useState("");
  const [editing, setEditing] = useState<Partial<T> | null>(null);
  const [deleting, setDeleting] = useState<T | null>(null);

  const rows = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) =>
      searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q)),
    );
  }, [data, term, searchKeys]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: query.queryKey });

  const save = useMutation({
    mutationFn: async (values: Partial<T>) => {
      const payload = { ...values } as Record<string, unknown>;
      const id = payload.id as string | undefined;
      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;
      if (id) {
        const { error } = await supabase.from(table as never).update(payload as never).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(table as never).insert(payload as never);
        if (error) throw error;
      }
      await logActivity({
        action: id ? `Updated ${title.toLowerCase()} record` : `Created ${title.toLowerCase()} record`,
        module: moduleKey,
        details: { id: id ?? null, name: payload.name ?? payload.title ?? null },
      });
    },
    onSuccess: () => {
      toast.success("Saved");
      setEditing(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (row: T) => {
      const { error } = await supabase.from(table as never).delete().eq("id", row.id);
      if (error) throw error;
      await logActivity({
        action: `Deleted ${title.toLowerCase()} record`,
        module: moduleKey,
        details: { id: row.id },
      });
    },
    onSuccess: () => {
      toast.success("Deleted");
      setDeleting(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function duplicate(row: T) {
    const clone: Record<string, unknown> = { ...row };
    delete clone.id;
    delete clone.created_at;
    delete clone.updated_at;
    if (typeof clone.name === "string") clone.name = `${clone.name} (copy)`;
    if (typeof clone.title === "string") clone.title = `${clone.title} (copy)`;
    if (typeof clone.slug === "string") clone.slug = `${clone.slug}-copy-${Date.now().toString(36)}`;
    save.mutate(clone as Partial<T>);
  }

  return (
    <>
      <Panel className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-border/60 p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}…`}
              className="pl-9"
            />
          </div>
          {canManage && (
            <Button onClick={() => setEditing({ ...(defaults ?? {}) } as Partial<T>)}>
              <Plus className="mr-1.5 h-4 w-4" /> New
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4">
              <Skeletons />
            </div>
          ) : rows.length === 0 ? (
            <div className="p-4">
              <EmptyState title={`No ${title.toLowerCase()} yet`} description="Create your first record to get started." />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  {columns.map((c) => (
                    <th key={c.header} className="whitespace-nowrap px-4 py-3 font-medium">
                      {c.header}
                    </th>
                  ))}
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-border/50 transition hover:bg-muted/30">
                    {columns.map((c) => (
                      <td key={c.header} className={`px-4 py-3 align-middle ${c.className ?? ""}`}>
                        {c.render(row)}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      {canManage && (
                        <div className="flex justify-end gap-1">
                          {allowDuplicate && (
                            <Button size="icon" variant="ghost" onClick={() => duplicate(row)} aria-label="Duplicate">
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" onClick={() => setEditing(row)} aria-label="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => setDeleting(row)}
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Panel>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? `Edit ${title}` : `New ${title}`}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form
              id="resource-form"
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate(editing);
              }}
            >
              {fields.map((f) => (
                <FieldInput
                  key={f.name}
                  field={f}
                  value={(editing as Record<string, unknown>)[f.name]}
                  onChange={(v) => setEditing({ ...editing, [f.name]: v } as Partial<T>)}
                />
              ))}
            </form>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} type="button">
              Cancel
            </Button>
            <Button form="resource-form" type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone and will be written to the activity log.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleting && remove.mutate(deleting)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const type = field.type ?? "text";
  const wrapper = field.full || type === "textarea" ? "sm:col-span-2" : "";

  return (
    <div className={`space-y-1.5 ${wrapper}`}>
      <Label htmlFor={field.name}>{field.label}</Label>
      {type === "textarea" ? (
        <Textarea
          id={field.name}
          rows={4}
          required={field.required}
          value={(value as string) ?? ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : type === "select" ? (
        <select
          id={field.name}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">—</option>
          {field.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : type === "switch" ? (
        <div className="flex h-10 items-center">
          <Switch checked={!!value} onCheckedChange={onChange} id={field.name} />
        </div>
      ) : type === "tags" ? (
        <Input
          id={field.name}
          value={Array.isArray(value) ? (value as string[]).join(", ") : ((value as string) ?? "")}
          placeholder="comma, separated, values"
          onChange={(e) =>
            onChange(
              e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            )
          }
        />
      ) : (
        <Input
          id={field.name}
          type={type === "number" ? "number" : type === "date" ? "date" : "text"}
          required={field.required}
          placeholder={field.placeholder}
          value={(value as string | number) ?? ""}
          onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
        />
      )}
    </div>
  );
}

export { StatusBadge };
