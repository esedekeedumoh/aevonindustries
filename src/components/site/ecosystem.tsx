import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUpRight, Boxes } from "lucide-react";
import { productsQueryOptions, type Product } from "@/lib/products";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

function statusStyle(status: string) {
  const s = status.toLowerCase();
  if (s === "available") return "bg-cyan/15 text-cyan";
  if (s === "beta") return "bg-royal/15 text-royal";
  if (s === "in development") return "bg-violet/15 text-violet";
  return "bg-accent text-accent-foreground";
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const href = product.website_url ?? "#contact";
  const external = Boolean(product.website_url);

  return (
    <Reveal as="article" delay={index * 70} className="h-full">
      <div className="glass group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] p-6 transition-all duration-500 hover:-translate-y-1.5 hover:glow-ring">
        <div
          aria-hidden
          className="brand-gradient pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
        />
        <div className="relative flex items-start justify-between gap-4">
          <div className="glass grid h-14 w-14 shrink-0 place-items-center rounded-2xl">
            {product.logo_url ? (
              <img
                src={product.logo_url}
                alt={`${product.name} logo`}
                loading="lazy"
                className="h-9 w-9 transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <Boxes className="h-6 w-6 text-primary" />
            )}
          </div>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-semibold",
              statusStyle(product.status),
            )}
          >
            {product.status}
          </span>
        </div>

        <div className="relative mt-5 min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            {product.category}
          </p>
          <h3 className="mt-1.5 text-xl font-semibold">{product.name}</h3>
          <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
          {product.platform && (
            <p className="mt-4 truncate text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Platform:</span> {product.platform}
            </p>
          )}
          {product.tags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {product.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-secondary px-2.5 py-1 text-[11px] text-secondary-foreground"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>

        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
          className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-foreground"
        >
          Learn more
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>
    </Reveal>
  );
}

export function Ecosystem() {
  const { data: products } = useSuspenseQuery(productsQueryOptions);

  return (
    <section id="ecosystem" className="relative px-4 py-24 sm:px-6 lg:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/4 -z-10 mx-auto h-[30rem] max-w-4xl rounded-full opacity-25 blur-[140px] brand-gradient"
      />
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            Our Ecosystem
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">
            One company. <span className="text-gradient">Many products.</span>
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Every Aevon product is built on the same foundation of speed, privacy, and
            intelligent design — and the catalogue keeps growing.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
