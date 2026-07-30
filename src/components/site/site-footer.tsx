import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { socials } from "./contact";
import aevonLogo from "@/assets/aevon.png.asset.json";

const columns = [
  {
    heading: "Products",
    links: ["Von", "Aevon Browser", "Catalyst Digital", "Aevon Academy"],
  },
  { heading: "Company", links: ["About", "Mission", "Leadership", "Newsroom"] },
  { heading: "Resources", links: ["Blog", "Guides", "Brand assets", "Press kit"] },
  { heading: "Developers", links: ["Documentation", "API status", "Changelog", "Open roles"] },
  { heading: "Support", links: ["Help centre", "Contact", "Report an issue", "Community"] },
  { heading: "Legal", links: ["Privacy", "Terms", "Cookies", "Security"] },
];

export function SiteFooter() {
  const [submitting, setSubmitting] = useState(false);

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "");
    setSubmitting(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email });
    setSubmitting(false);
    if (error) {
      toast.error(
        error.code === "23505" ? "You're already subscribed." : "Subscription failed. Try again.",
      );
      return;
    }
    toast.success("You're on the list.");
    form.reset();
  }

  return (
    <footer className="relative px-4 pb-10 pt-16 sm:px-6">
      <div className="glass mx-auto max-w-6xl rounded-[2.5rem] p-8 sm:p-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <img src={aevonLogo.url} alt="Aevon Industries" className="h-9 w-9" />
              <span className="font-display text-base font-semibold">Aevon Industries</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Building intelligent software, education, and digital services for people and
              businesses everywhere.
            </p>

            <form onSubmit={subscribe} className="mt-6 flex max-w-sm gap-2">
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <input
                id="newsletter-email"
                name="email"
                type="email"
                required
                placeholder="you@company.com"
                className="min-w-0 flex-1 rounded-full border border-input bg-background/60 px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
              <button
                type="submit"
                disabled={submitting}
                className="brand-gradient shrink-0 rounded-full px-5 py-3 text-sm font-semibold text-white transition-transform duration-300 hover:scale-[1.03] disabled:opacity-60"
              >
                Subscribe
              </button>
            </form>

            <ul className="mt-6 flex flex-wrap gap-2">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Aevon Industries on ${s.label}`}
                    className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition-all duration-300 hover:scale-110 hover:text-primary"
                  >
                    <s.icon className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.heading}>
                <h3 className="text-sm font-semibold">{col.heading}</h3>
                <ul className="mt-3 space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#contact"
                        className="text-sm text-muted-foreground transition-colors duration-300 hover:text-primary"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Aevon Industries. All rights reserved.</p>
          <p>Building the future through technology.</p>
        </div>
      </div>
    </footer>
  );
}
