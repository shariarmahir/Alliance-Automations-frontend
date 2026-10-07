import type { CSSProperties } from "react"
import { FROM_BOTTOM, FROM_LEFT, IconFrame, PIVOT, PIVOT_VIEW, stagger, type IconProps } from "@/components/landing/icons/frame"
import { cn } from "@/lib/utils"

const DRAW: CSSProperties = { strokeDasharray: 1, strokeDashoffset: 1 }
const BARS = [
  { x: 9, h: 14 },
  { x: 19, h: 22 },
  { x: 29, h: 17 },
  { x: 39, h: 28 },
]

export function Processing({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <g className={cn(PIVOT_VIEW, "animate-layer-gear")}>
        <circle cx={24} cy={24} r={9} />
        <path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.6 10.6l4.2 4.2M33.2 33.2l4.2 4.2M10.6 37.4l4.2-4.2M33.2 14.8l4.2-4.2" />
      </g>
      <path d="M21.5 20.5v7l6-3.5z" fill="currentColor" stroke="none" />
    </IconFrame>
  )
}

export function Delayed({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M13 38V26a11 11 0 0 1 22 0v12" />
      <path d="M9 42h30" />
      <path d="M24 8V4M10 13l-3-3M38 13l3-3" className="animate-layer-blink" />
      <path d="M20 30a4 4 0 0 1 4-4" strokeWidth={2} className="animate-layer-blink" style={{ animationDelay: "-1.2s" }} />
    </IconFrame>
  )
}

export function Held({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <circle cx={24} cy={24} r={18} />
      <rect x={17} y={16} width={4.5} height={16} rx={1.5} fill="currentColor" stroke="none" className="animate-layer-blink" />
      <rect x={26.5} y={16} width={4.5} height={16} rx={1.5} fill="currentColor" stroke="none" className="animate-layer-blink" style={{ animationDelay: "-1.2s" }} />
    </IconFrame>
  )
}

export function Produced({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M5 42h38" />
      {BARS.map((bar, index) => (
        <rect
          key={bar.x}
          x={bar.x - 3}
          y={40 - bar.h}
          width={6}
          height={bar.h}
          rx={1.5}
          fill="currentColor"
          stroke="none"
          opacity={0.85}
          className={cn(FROM_BOTTOM, "animate-layer-bar")}
          style={stagger(index, 0.35)}
        />
      ))}
    </IconFrame>
  )
}

export function Completed({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <circle cx={24} cy={24} r={18} />
      <path d="M16 24.5l5.5 5.5L32.5 18" pathLength={1} style={DRAW} className="animate-icon-draw" />
    </IconFrame>
  )
}

export function Utilization({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M7 34a17 17 0 0 1 34 0" />
      <path d="M7 34a17 17 0 0 1 27-13.7" strokeWidth={4} opacity={0.35} />
      <g className="animate-icon-swing" style={{ transformOrigin: "24px 34px", transformBox: "view-box", animationDuration: "3.6s" }}>
        <path d="M24 34L24 20" />
      </g>
      <circle cx={24} cy={34} r={3} fill="currentColor" stroke="none" />
    </IconFrame>
  )
}

export function Bell({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <g className="animate-icon-ring" style={{ transformOrigin: "24px 8px", transformBox: "view-box" }}>
        <path d="M13 33V22a11 11 0 0 1 22 0v11l3 4H10z" />
        <path d="M21 41a3 3 0 0 0 6 0" />
      </g>
      <circle cx={37} cy={10} r={4} fill="currentColor" stroke="none" className="animate-layer-blink" />
    </IconFrame>
  )
}

export function BayLoad({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      {[10, 20, 30, 40].map((y, index) => (
        <g key={y}>
          <path d={`M7 ${y}h34`} strokeWidth={4} opacity={0.2} />
          <path d={`M7 ${y}h34`} strokeWidth={4} className={cn(FROM_LEFT, "animate-icon-fill")} style={{ animationDuration: `${2.6 + index * 0.5}s` }} />
        </g>
      ))}
    </IconFrame>
  )
}

export function Delivery({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <g className="animate-icon-bob" style={{ animationDuration: "1.4s" }}>
        <path d="M4 12h24v20H4zM28 19h8l7 7v6H28z" />
      </g>
      <circle cx={12} cy={36} r={4} />
      <circle cx={35} cy={36} r={4} />
      <path d="M2 42h44" strokeWidth={2} strokeDasharray="3 4" className="animate-layer-flow" />
    </IconFrame>
  )
}

export function Utility({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M17 6c6 8 11 13 11 20a11 11 0 0 1-22 0c0-7 5-12 11-20z" />
      <path d="M33 4l-5 12h8l-6 14" className="animate-layer-blink" />
      <circle cx={17} cy={29} r={3} fill="currentColor" stroke="none" className={cn(PIVOT, "animate-icon-pulse")} />
    </IconFrame>
  )
}

export function EventFeed({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <rect x={6} y={6} width={36} height={36} rx={5} />
      {[15, 24, 33].map((y, index) => (
        <g key={y}>
          <circle cx={13} cy={y} r={1.8} fill="currentColor" stroke="none" className="animate-layer-blink" style={stagger(index, 0.5)} />
          <path d={`M19 ${y}h16`} strokeWidth={2} opacity={0.55} />
        </g>
      ))}
    </IconFrame>
  )
}

export function Recipe({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M5 38h8V28h8V18h8v10h8V12h6" opacity={0.3} />
      <path d="M5 38h8V28h8V18h8v10h8V12h6" pathLength={1} style={DRAW} className="animate-icon-draw" />
    </IconFrame>
  )
}

export function Temperature({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M5 34c5 0 6-14 11-14s6 10 11 10 6-18 11-18 4 4 5 6" pathLength={1} style={DRAW} className="animate-icon-draw" />
      <path d="M5 42h38" strokeWidth={2} opacity={0.4} />
      <circle cx={38} cy={12} r={3} fill="currentColor" stroke="none" className="animate-layer-blink" />
    </IconFrame>
  )
}

export function ActionQueue({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <circle cx={24} cy={24} r={18} opacity={0.35} />
      <circle cx={24} cy={24} r={11} />
      <circle cx={24} cy={24} r={18} strokeWidth={1.5} className={cn(PIVOT, "animate-layer-ring")} />
      <circle cx={24} cy={24} r={4} fill="currentColor" stroke="none" />
    </IconFrame>
  )
}

export function Batch({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M8 16l16-9 16 9-16 9z" />
      <path d="M8 16v16l16 9 16-9V16M24 25v16" />
      <path d="M16 12l16 9" strokeWidth={2} opacity={0.5} className="animate-layer-blink" />
    </IconFrame>
  )
}

export function Shift({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <circle cx={24} cy={24} r={18} />
      <g className={cn(PIVOT_VIEW, "animate-layer-gear")} style={{ animationDuration: "12s" }}>
        <path d="M24 24V12" />
      </g>
      <g className={cn(PIVOT_VIEW, "animate-layer-gear")} style={{ animationDuration: "3s" }}>
        <path d="M24 24l8 4" strokeWidth={2} />
      </g>
      <circle cx={24} cy={24} r={2.5} fill="currentColor" stroke="none" />
    </IconFrame>
  )
}
