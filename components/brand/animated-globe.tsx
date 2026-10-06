import { cn } from "@/lib/utils"

/** A small coloured globe: two meridians turn, a satellite orbits. The global reduced-motion rule stills it. */
export function AnimatedGlobe({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={cn("size-6 shrink-0 overflow-visible", className)}>
      <circle cx={12} cy={12} r={10} fill="#0f172a" />
      <circle cx={12} cy={12} r={10} stroke="#22d3ee" strokeWidth={1.4} />
      <path d="M2.4 12h19.2" stroke="#f472b6" strokeWidth={1.2} strokeLinecap="round" />
      <path d="M4 7.5h16M4 16.5h16" stroke="#a3e635" strokeWidth={1} strokeLinecap="round" opacity={0.8} />
      <ellipse cx={12} cy={12} rx={4.6} ry={10} stroke="#22d3ee" strokeWidth={1.2} className="origin-center animate-globe-turn [transform-box:fill-box]" />
      <ellipse
        cx={12}
        cy={12}
        rx={4.6}
        ry={10}
        stroke="#fbbf24"
        strokeWidth={1.2}
        className="origin-center animate-globe-turn [transform-box:fill-box] [animation-delay:-1.6s]"
      />
      <g className="origin-center animate-globe-orbit [transform-box:view-box]">
        <circle cx={12} cy={0.6} r={1.7} fill="#fb923c" />
      </g>
    </svg>
  )
}
