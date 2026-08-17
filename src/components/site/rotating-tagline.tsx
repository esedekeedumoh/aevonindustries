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

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % TAGLINES.length), 4200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative h-7 overflow-hidden">
      <p
        key={index}
        className="animate-tagline absolute inset-0 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.18em] sm:text-sm"
      >
        <span className="text-gradient">{TAGLINES[index]}</span>
      </p>
    </div>
  );
}
