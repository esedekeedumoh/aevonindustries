import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Reveal } from "./reveal";
import aevonLogo from "@/assets/aevon.png.asset.json";
import vonLogo from "@/assets/von.png.asset.json";
import hakuLogo from "@/assets/haku.png.asset.json";
import academyLogo from "@/assets/academy.png.asset.json";

const orbitNodes = [
  { src: vonLogo.url, label: "Von" },
  { src: hakuLogo.url, label: "Aevon Browser" },
  { src: aevonLogo.url, label: "Catalyst Digital" },
  { src: academyLogo.url, label: "Aevon Academy" },
];

function Particles() {
  const dots = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => ({
        left: `${(i * 37) % 100}%`,
        top: `${(i * 61) % 100}%`,
        delay: `${(i % 9) * 0.6}s`,
        size: i % 5 === 0 ? 3 : 2,
      })),
    [],
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d, i) => (
        <span
          key={i}
          className="animate-twinkle absolute rounded-full bg-primary"
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            animationDelay: d.delay,
          }}
        />
      ))}
    </div>
  );
}

export function Hero() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => setOffset(Math.min(window.scrollY, 600));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center overflow-hidden px-4 pb-20 pt-32 sm:px-6 lg:pt-36"
    >
      {/* animated background */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="animate-drift absolute -left-40 -top-32 h-[38rem] w-[38rem] rounded-full opacity-40 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, var(--violet), transparent 65%)",
            transform: `translateY(${offset * 0.15}px)`,
          }}
        />
        <div
          className="animate-float-slow absolute -right-32 top-10 h-[34rem] w-[34rem] rounded-full opacity-40 blur-[120px]"
          style={{
            background: "radial-gradient(circle at 60% 40%, var(--royal), transparent 65%)",
            transform: `translateY(${offset * -0.1}px)`,
          }}
        />
        <div
          className="animate-drift absolute bottom-[-10rem] left-1/3 h-[30rem] w-[30rem] rounded-full opacity-25 blur-[130px]"
          style={{
            background: "radial-gradient(circle at 50% 50%, var(--cyan), transparent 65%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.18] dark:opacity-[0.14]"
          style={{
            backgroundImage:
              "linear-gradient(to right, color-mix(in oklab, var(--foreground) 22%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 22%, transparent) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent 75%)",
          }}
        />
        <Particles />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Reveal>
            <RotatingTagline />
          </Reveal>


          <Reveal delay={80}>
            <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] sm:text-6xl lg:text-[4.25rem]">
              Building the Future <span className="text-gradient">Through Technology.</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Aevon Industries is a technology company creating intelligent software, AI
              solutions, education platforms, browsers, productivity tools, and digital
              services that empower people and businesses to learn, create, and innovate.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="#ecosystem"
                className="brand-gradient group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-primary/25 transition-transform duration-300 hover:scale-[1.03]"
              >
                Explore Our Ecosystem
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a
                href="#contact"
                className="glass inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all duration-300 hover:scale-[1.03] hover:text-primary"
              >
                Contact Us
              </a>
            </div>
          </Reveal>
        </div>

        {/* interconnected ecosystem illustration */}
        <Reveal delay={200} className="relative mx-auto w-full max-w-md">
          <div className="relative aspect-square" style={{ perspective: "1000px" }}>
            <div
              className="animate-spin-slow absolute inset-[8%] rounded-full border border-dashed border-primary/25"
              style={{ transform: "rotateX(62deg)" }}
            />
            <div
              className="animate-spin-slow absolute inset-[22%] rounded-full border border-primary/20"
              style={{ transform: "rotateX(62deg) rotateY(20deg)", animationDirection: "reverse" }}
            />
            <div className="absolute inset-[30%] rounded-full opacity-70 blur-2xl brand-gradient" />

            <div className="glass glow-ring absolute left-1/2 top-1/2 grid h-28 w-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[2rem] sm:h-32 sm:w-32">
              <img
                src={aevonLogo.url}
                alt="Aevon Industries ecosystem core"
                className="animate-float-slow h-16 w-16 sm:h-20 sm:w-20"
              />
            </div>

            {orbitNodes.map((node, i) => {
              const angle = (i / orbitNodes.length) * Math.PI * 2;
              const x = 50 + Math.cos(angle) * 38;
              const y = 50 + Math.sin(angle) * 38;
              return (
                <div
                  key={node.label}
                  className="glass animate-float-slow absolute grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl transition-transform duration-500 hover:scale-110 sm:h-20 sm:w-20"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    animationDelay: `${i * 1.4}s`,
                  }}
                >
                  <img src={node.src} alt="" aria-hidden className="h-9 w-9 sm:h-11 sm:w-11" />
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
