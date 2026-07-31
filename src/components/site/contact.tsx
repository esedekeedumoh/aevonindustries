import { useState, type FormEvent } from "react";
import { Facebook, Instagram, Linkedin, Mail, Phone, Youtube } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "./reveal";

export const socials = [
  { label: "Instagram", href: "https://instagram.com/aevonindustries", icon: Instagram },
  { label: "X", href: "https://x.com/aevonindustries", icon: XIcon },
  { label: "YouTube", href: "https://youtube.com/@aevonindustries", icon: Youtube },
  { label: "LinkedIn", href: "https://linkedin.com/company/aevonindustries", icon: Linkedin },
  { label: "Facebook", href: "https://facebook.com/aevonindustries", icon: Facebook },
];

export function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function Contact() {
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setSubmitting(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      message: String(data.get("message") ?? ""),
    });

    setSubmitting(false);
    if (error) {
      toast.error("We couldn't send your message. Please try again.");
      return;
    }
    toast.success("Thanks — your message is on its way to the Aevon team.");
    form.reset();
  }

  return (
    <section id="contact" className="relative px-4 py-24 sm:px-6 lg:py-28">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            Contact
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">Let's talk.</h2>
          <p className="mt-4 text-muted-foreground">
            Partnerships, press, careers, or product questions — we read everything.
          </p>

          <div className="mt-8 space-y-3">
            <a
              href="mailto:aevontechonolies@gmail.com"
              className="glass flex items-center gap-3 rounded-2xl px-5 py-4 text-sm transition-all duration-300 hover:-translate-y-0.5 hover:text-primary"
            >
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate">aevontechonolies@gmail.com</span>
            </a>
            <a
              href="https://wa.me/2347063985329"
              target="_blank"
              rel="noreferrer"
              className="glass flex items-center gap-3 rounded-2xl px-5 py-4 text-sm transition-all duration-300 hover:-translate-y-0.5 hover:text-primary"
            >
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              <span>07063985329</span>
              <span className="ml-auto text-xs text-muted-foreground">WhatsApp</span>
            </a>
            <a
              href="https://wa.me/2347069899116"
              target="_blank"
              rel="noreferrer"
              className="glass flex items-center gap-3 rounded-2xl px-5 py-4 text-sm transition-all duration-300 hover:-translate-y-0.5 hover:text-primary"
            >
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              <span>07069899116</span>
              <span className="ml-auto text-xs text-muted-foreground">WhatsApp</span>
            </a>

          </div>

          <ul className="mt-8 flex flex-wrap gap-2">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Aevon Industries on ${s.label}`}
                  className="glass grid h-11 w-11 place-items-center rounded-full text-muted-foreground transition-all duration-300 hover:scale-110 hover:text-primary"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120}>
          <form
            onSubmit={onSubmit}
            className="glass grid gap-4 rounded-[2rem] p-6 sm:p-9"
            aria-label="Contact Aevon Industries"
          >
            <div className="grid gap-4 sm:grid-cols-2">
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
            </div>
            <label className="grid gap-2 text-sm">
              <span className="font-medium">Message</span>
              <textarea
                name="message"
                required
                rows={5}
                className="resize-y rounded-2xl border border-input bg-background/60 px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="brand-gradient mt-2 inline-flex items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-primary/25 transition-transform duration-300 hover:scale-[1.02] disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Send message"}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
