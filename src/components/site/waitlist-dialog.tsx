import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function WaitlistDialog({
  open,
  onOpenChange,
  productId,
  productName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
}) {
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setSubmitting(true);
    const { error } = await supabase.from("waitlist_entries" as never).insert({
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim() || null,
      product_id: productId,
      product_name: productName,
    } as never);
    setSubmitting(false);
    if (error) {
      toast.error(
        error.code === "23505"
          ? `You're already on the ${productName} waitlist.`
          : "Something went wrong. Please try again.",
      );
      return;
    }
    toast.success(`You're on the ${productName} waitlist — we'll email you at launch.`);
    form.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join the {productName} waitlist</DialogTitle>
          <DialogDescription>
            {productName} is still in progress. Leave your details and we'll let you know the
            moment it goes live.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Name</span>
            <input
              name="name"
              required
              autoComplete="name"
              className="rounded-2xl border border-input bg-background/60 px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-2xl border border-input bg-background/60 px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium">
              Phone <span className="text-muted-foreground">(optional)</span>
            </span>
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              className="rounded-2xl border border-input bg-background/60 px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="brand-gradient mt-1 inline-flex items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold text-white transition-transform duration-300 hover:scale-[1.02] disabled:opacity-60"
          >
            {submitting ? "Joining…" : "Join the waitlist"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
