import type { CSSProperties } from "react"
import { FROM_BOTTOM, IconFrame, PIVOT, PIVOT_VIEW, stagger, type IconProps } from "@/components/landing/icons/frame"
import { cn } from "@/lib/utils"

const PALETTE_DOTS = [
  { x: 16, y: 21 },
  { x: 24, y: 14 },
  { x: 33, y: 18 },
]

/** Delays: a clock whose hands never stop. */
export function ClockIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <circle cx={24} cy={24} r={18} />
      <path d="M24 9v3M24 36v3M9 24h3M36 24h3" strokeWidth={2} />
      <g className={cn(PIVOT_VIEW, "animate-layer-gear")} style={{ animationDuration: "24s" }}>
        <path d="M24 24v-8" />
      </g>
      <g className={cn(PIVOT_VIEW, "animate-layer-gear")} style={{ animationDuration: "4s" }}>
        <path d="M24 24V12" />
      </g>
      <circle cx={24} cy={24} r={2} fill="currentColor" stroke="none" />
    </IconFrame>
  )
}

/** Shade corrections: a palette whose colours light up in turn. */
export function PaletteIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M24 6C14 6 6 14 6 24s8 18 16 18c3 0 4-2 3-4s-1-5 3-5h5c6 0 9-4 9-9C42 13 34 6 24 6z" />
      {PALETTE_DOTS.map((dot, index) => (
        <circle key={dot.x} cx={dot.x} cy={dot.y} r={2.8} fill="currentColor" stroke="none" className="animate-layer-blink" style={stagger(index, 0.6)} />
      ))}
    </IconFrame>
  )
}

/** Machines wait for batches: sand runs from the top glass to the bottom one. */
export function HourglassIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M14 6h20M14 42h20M16 6c0 11 8 12 8 18s-8 7-8 18M32 6c0 11-8 12-8 18s8 7 8 18" />
      <path d="M18 10h12c-.6 5-3.6 7-6 10-2.4-3-5.4-5-6-10z" fill="currentColor" stroke="none" className={cn(FROM_BOTTOM, "animate-icon-sand-out")} />
      <path d="M17.5 40h13c-.6-5-3.4-6.6-6.5-8-3.1 1.4-5.9 3-6.5 8z" fill="currentColor" stroke="none" className={cn(FROM_BOTTOM, "animate-icon-sand-in")} />
      <path d="M24 20v12" strokeWidth={1.5} strokeDasharray="2 3" className="animate-layer-flow" />
    </IconFrame>
  )
}

/** Energy and water per kilo: a breathing drop, a falling droplet and a ripple. */
export function DropletsIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <g className={cn(PIVOT, "animate-icon-pulse")}>
        <path d="M22 6c7 9.5 11 14 11 20a11 11 0 0 1-22 0c0-6 4-10.5 11-20z" />
        <path d="M16 28a6 6 0 0 0 5 6" strokeWidth={2} />
      </g>
      <circle cx={40} cy={8} r={2.2} fill="currentColor" stroke="none" className="animate-icon-drop" style={{ "--drop": "16px" } as CSSProperties} />
      <ellipse cx={22} cy={43} rx={12} ry={2.5} strokeWidth={1.5} className={cn(PIVOT, "animate-layer-ring")} />
    </IconFrame>
  )
}
