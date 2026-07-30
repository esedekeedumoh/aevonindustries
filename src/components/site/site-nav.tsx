import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import aevonLogo from "@/assets/aevon.png.asset.json";
import { cn } from "@/lib/utils";

const links = [
  { label: "Company", href: "#who-we-are" },
  { label: "Ecosystem", href: "#ecosystem" },
  { label: "Impact", href: "#impact" },
  { label: "Newsroom", href: "#news" },
  { label: "Careers", href: "#careers" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
      <nav
        aria-label="Primary"
        className={cn(
          "mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-3xl px-4 py-3 transition-all duration-500 sm:px-5 lg:grid-cols-[auto_1fr_auto]",
          scrolled ? "glass glow-ring" : "border border-transparent",
        )}
      >
        <a href="#top" className="flex min-w-0 items-center gap-2.5">
          <img src={aevonLogo.url} alt="Aevon Industries" className="h-8 w-8 shrink-0" />
          <span className="truncate font-display text-[15px] font-semibold tracking-tight">
            Aevon Industries
          </span>
        </a>

        <ul className="hidden items-center justify-center gap-1 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="rounded-full px-3.5 py-2 text-sm text-muted-foreground transition-colors duration-300 hover:bg-accent hover:text-foreground"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <a
            href="#contact"
            className="brand-gradient hidden rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-transform duration-300 hover:scale-[1.03] sm:inline-flex"
          >
            Contact
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="glass grid h-10 w-10 place-items-center rounded-full lg:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="glass glow-ring mx-auto mt-2 max-w-6xl rounded-3xl p-3 lg:hidden">
          <ul className="grid gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-sm text-foreground transition-colors hover:bg-accent"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="brand-gradient mt-1 block rounded-2xl px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Contact us
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
