import { useEffect, useRef, useState } from "react";
import {
  Accessibility,
  ArrowRight,
  Brain,
  Briefcase,
  Code2,
  Compass,
  GraduationCap,
  Globe2,
  Layers,
  Megaphone,
  Rocket,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Reveal, useInView } from "./reveal";
import founderPortrait from "@/assets/founder.jpg";

/* ---------------- Who we are ---------------- */

const pillars = [
  { icon: Brain, label: "Artificial Intelligence" },
  { icon: Globe2, label: "Internet Technologies" },
  { icon: GraduationCap, label: "Education" },
  { icon: Layers, label: "Enterprise Software" },
];

export function WhoWeAre() {
  return (
    <section id="who-we-are" className="relative px-4 py-24 sm:px-6 lg:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            Who We Are
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">
            A technology company built for <span className="text-gradient">real problems.</span>
          </h2>
          <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">
            Aevon Industries is a technology company dedicated to building innovative digital
            products that solve real-world problems. Our ecosystem spans artificial
            intelligence, education, internet technologies, enterprise software, productivity
            tools, developer platforms, and digital services. Every product is designed to help
            people and businesses achieve more through technology.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 gap-4">
          {pillars.map((p, i) => (
            <Reveal key={p.label} delay={i * 90}>
              <div className="glass animate-float-slow h-full rounded-3xl p-6 transition-all duration-500 hover:-translate-y-1.5 hover:glow-ring" style={{ animationDelay: `${i * 1.5}s` }}>
                <div className="brand-gradient grid h-11 w-11 place-items-center rounded-2xl text-white">
                  <p.icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm font-semibold leading-snug">{p.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Mission & Vision ---------------- */

export function MissionVision() {
  const cards = [
    {
      icon: Compass,
      title: "Mission",
      body: "To build technology that empowers people to learn, create, connect, and innovate.",
    },
    {
      icon: Rocket,
      title: "Vision",
      body: "To become one of Africa's leading technology companies, building products used by millions around the world.",
    },
  ];

  return (
    <section className="relative px-4 py-8 sm:px-6 lg:py-16">
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
        {cards.map((c, i) => (
          <Reveal key={c.title} delay={i * 120}>
            <div className="glass group relative h-full overflow-hidden rounded-[2rem] p-8 transition-all duration-500 hover:-translate-y-1.5 hover:glow-ring sm:p-12">
              <div
                aria-hidden
                className="brand-gradient absolute -left-20 -top-20 h-52 w-52 rounded-full opacity-25 blur-3xl transition-opacity duration-500 group-hover:opacity-50"
              />
              <div className="relative">
                <div className="glass grid h-12 w-12 place-items-center rounded-2xl text-primary">
                  <c.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold sm:text-3xl">{c.title}</h3>
                <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
                  {c.body}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Categories ---------------- */

const categories = [
  { icon: Brain, name: "Artificial Intelligence", desc: "Assistants, models, and reasoning tools." },
  { icon: Globe2, name: "Internet Technologies", desc: "Browsers and connected experiences." },
  { icon: GraduationCap, name: "Education", desc: "Future-ready digital skills." },
  { icon: Megaphone, name: "Marketing", desc: "Brand and growth platforms." },
  { icon: Briefcase, name: "Business Solutions", desc: "Software that runs operations." },
  { icon: Code2, name: "Developer Tools", desc: "Platforms builders rely on." },
  { icon: Sparkles, name: "Future Innovations", desc: "What we're building next." },
];

export function Categories() {
  return (
    <section className="relative px-4 py-24 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            Product Categories
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">Where we build.</h2>
        </Reveal>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => (
            <Reveal as="li" key={c.name} delay={i * 60}>
              <div className="glass group flex h-full items-start gap-4 rounded-3xl p-6 transition-all duration-500 hover:-translate-y-1 hover:glow-ring">
                <div className="glass grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-primary transition-transform duration-500 group-hover:scale-110">
                  <c.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold">{c.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------- Why Aevon ---------------- */

const reasons = [
  { icon: Sparkles, title: "Innovation", body: "Building modern technology with users at the center." },
  { icon: ShieldCheck, title: "Security", body: "Privacy-first products designed with trust." },
  { icon: Accessibility, title: "Accessibility", body: "Technology for everyone." },
  { icon: TrendingUp, title: "Growth", body: "Helping individuals and businesses reach their potential." },
];

export function WhyAevon() {
  return (
    <section className="relative px-4 py-24 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            Why Aevon
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">
            Principles behind <span className="text-gradient">every release.</span>
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r, i) => (
            <Reveal key={r.title} delay={i * 90}>
              <div className="glass group relative h-full overflow-hidden rounded-3xl p-7 transition-all duration-500 hover:-translate-y-2 hover:glow-ring">
                <div
                  aria-hidden
                  className="brand-gradient absolute inset-x-0 -top-24 h-32 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-40"
                />
                <div className="brand-gradient relative grid h-11 w-11 place-items-center rounded-2xl text-white">
                  <r.icon className="h-5 w-5" />
                </div>
                <h3 className="relative mt-5 text-lg font-semibold">{r.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                  {r.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Impact counters ---------------- */

const stats = [
  { label: "Products Built", value: 12, suffix: "+" },
  { label: "Students Trained", value: 850, suffix: "+" },
  { label: "Projects Delivered", value: 140, suffix: "+" },
  { label: "Businesses Served", value: 60, suffix: "+" },
  { label: "AI Conversations", value: 25000, suffix: "+" },
  { label: "Countries Reached", value: 14, suffix: "" },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [display, setDisplay] = useState(0);
  const frame = useRef<number>(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1600;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [inView, value]);

  return (
    <span ref={ref} className="text-gradient text-4xl font-semibold sm:text-5xl">
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

export function Impact() {
  return (
    <section id="impact" className="relative px-4 py-24 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            Our Impact
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">Measured in people.</h2>
        </Reveal>

        <div className="glass mt-12 grid gap-8 rounded-[2rem] p-8 sm:grid-cols-2 sm:p-12 lg:grid-cols-3">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 70}>
              <div>
                <Counter value={s.value} suffix={s.suffix} />
                <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Timeline ---------------- */

const milestones = [
  { title: "Company Founded", note: "Aevon Industries begins." },
  { title: "First AI Prototype", note: "Early experiments in assistive intelligence." },
  { title: "Von Coming Soon", note: "Our flagship AI assistant enters build." },
  { title: "Catalyst Launch", note: "Digital marketing platform goes live." },
  { title: "Aevon Browser", note: "Private, AI-native browsing in development." },
  { title: "Aevon Academy", note: "Digital skills programme in progress." },
  { title: "Future Products", note: "The ecosystem keeps expanding." },
];

export function Timeline() {
  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            Timeline
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">The road so far.</h2>
        </Reveal>
      </div>

      <div className="mt-12 overflow-x-auto pb-6">
        <ol className="mx-auto flex min-w-max max-w-6xl gap-5 px-4 sm:px-0">
          {milestones.map((m, i) => (
            <Reveal as="li" key={m.title} delay={i * 70} className="w-[260px] shrink-0">
              <div className="relative pt-8">
                <div aria-hidden className="absolute left-0 top-[13px] h-px w-full bg-border" />
                <div className="brand-gradient absolute left-0 top-2 h-2.5 w-2.5 rounded-full ring-4 ring-background" />
                <div className="glass h-full rounded-3xl p-6 transition-all duration-500 hover:-translate-y-1.5 hover:glow-ring">
                  <p className="text-xs font-semibold text-primary">Step {i + 1}</p>
                  <h3 className="mt-2 text-lg font-semibold">{m.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{m.note}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------------- Founder ---------------- */

export function Founder() {
  return (
    <section className="relative px-4 py-24 sm:px-6 lg:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <Reveal>
          <div className="glass relative overflow-hidden rounded-[2rem] p-3">
            <img
              src={founderPortrait}
              alt="Portrait of the founder of Aevon Industries"
              loading="lazy"
              width={1024}
              height={1280}
              className="h-full w-full rounded-[1.5rem] object-cover"
            />
          </div>
        </Reveal>

        <Reveal delay={120}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            Leadership
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">Meet the Founder</h2>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
            Behind every Aevon product is a team of passionate innovators, engineers, designers,
            and visionaries committed to building technology that shapes the future. Together,
            they transform bold ideas into intelligent solutions, driving the innovation,
            creativity, and excellence that power the entire Aevon ecosystem.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- News ---------------- */

const articles = [
  { title: "Aevon Rising", tag: "Company", body: "How a small team is building an ecosystem of products from the ground up." },
  { title: "Building the Future with AI", tag: "Artificial Intelligence", body: "Our approach to assistive intelligence that respects people and their data." },
  { title: "Inside Aevon Browser", tag: "Product", body: "A look at the architecture behind private, AI-native browsing." },
  { title: "Introducing EduHub", tag: "Education", body: "Bringing structured, practical digital skills to more learners." },
];

export function News() {
  return (
    <section id="news" className="relative px-4 py-24 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              Latest News
            </p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">From the newsroom.</h2>
          </div>
          <a
            href="#news"
            className="glass inline-flex w-fit items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300 hover:scale-[1.03] hover:text-primary"
          >
            View All Articles
            <ArrowRight className="h-4 w-4" />
          </a>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {articles.map((a, i) => (
            <Reveal as="article" key={a.title} delay={i * 80}>
              <div className="glass group flex h-full flex-col rounded-3xl p-6 transition-all duration-500 hover:-translate-y-2 hover:glow-ring">
                <div className="brand-gradient h-28 rounded-2xl opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
                <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                  {a.tag}
                </p>
                <h3 className="mt-1.5 text-lg font-semibold">{a.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {a.body}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Read article
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Careers ---------------- */

export function Careers() {
  return (
    <section id="careers" className="relative px-4 py-24 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="glass relative overflow-hidden rounded-[2.5rem] px-6 py-16 text-center sm:px-16 sm:py-24">
            <div
              aria-hidden
              className="brand-gradient animate-drift absolute -left-24 top-0 h-72 w-72 rounded-full opacity-30 blur-[100px]"
            />
            <div
              aria-hidden
              className="brand-gradient animate-float-slow absolute -right-20 bottom-0 h-72 w-72 rounded-full opacity-25 blur-[100px]"
            />
            <div className="relative">
              <h2 className="text-balance text-3xl font-semibold sm:text-5xl">
                Build the Future <span className="text-gradient">With Us</span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-pretty text-muted-foreground">
                We're looking for engineers, designers, educators, and builders who want their
                work used by millions.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <a
                  href="#contact"
                  className="brand-gradient inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-primary/25 transition-transform duration-300 hover:scale-[1.03]"
                >
                  View Careers
                </a>
                <a
                  href="#contact"
                  className="glass inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all duration-300 hover:scale-[1.03] hover:text-primary"
                >
                  Internships
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
