import { useEffect, useState } from "react";

const TAGLINES = [
  "An ecosystem of intelligent products",
  "AI that learns, teaches and builds with you",
  "Software engineered for speed and privacy",
  "Education platforms for the next generation",
  "Built in Africa. Made for the world.",
];

export function RotatingTagline() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    const out = setTimeout(() => setPhase("out"), 3200);
    const next = setTimeout(() => {
      setIndex((i) => (i + 1) % TAGLINES.length);
      setPhase("in");
    }, 3800);
    return () => {
      clearTimeout(out);
      clearTimeout(next);
    };
  }, [index]);

  return (
    <div className="relative h-6 overflow-hidden">
      <p
        key={index}
        className={[
          "absolute inset-0 whitespace-nowrap text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground transition-all duration-700 ease-out sm:text-sm",
          phase === "in"
            ? "translate-x-0 opacity-100"
            : "-translate-x-10 opacity-0",
        ].join(" ")}
        style={phase === "in" ? undefined : undefined}
      >
        <span className="text-gradient">{TAGLINES[index]}</span>
      </p>
    </div>
  );
}
