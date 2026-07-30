import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { SiteNav } from "@/components/site/site-nav";
import { Hero } from "@/components/site/hero";
import { Ecosystem } from "@/components/site/ecosystem";
import {
  Careers,
  Categories,
  Founder,
  Impact,
  MissionVision,
  News,
  Timeline,
  WhoWeAre,
  WhyAevon,
} from "@/components/site/sections";
import { Contact } from "@/components/site/contact";
import { SiteFooter } from "@/components/site/site-footer";
import { productsQueryOptions } from "@/lib/products";

const description =
  "Aevon Industries builds intelligent software, AI solutions, education platforms, browsers, and digital services that help people and businesses learn, create, and innovate.";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQueryOptions),
  head: () => ({
    meta: [
      { title: "Aevon Industries — Building the Future Through Technology" },
      { name: "description", content: description },
      {
        property: "og:title",
        content: "Aevon Industries — Building the Future Through Technology",
      },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function EcosystemFallback() {
  return (
    <div className="mx-auto grid max-w-6xl gap-5 px-4 py-24 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="glass h-72 animate-pulse rounded-[1.75rem]" />
      ))}
    </div>
  );
}

function Index() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <SiteNav />
      <main>
        <Hero />
        <WhoWeAre />
        <MissionVision />
        <Suspense fallback={<EcosystemFallback />}>
          <Ecosystem />
        </Suspense>
        <Categories />
        <WhyAevon />
        <Impact />
        <Timeline />
        <Founder />
        <News />
        <Careers />
        <Contact />
      </main>
      <SiteFooter />
      <Toaster position="top-center" />
    </div>
  );
}
