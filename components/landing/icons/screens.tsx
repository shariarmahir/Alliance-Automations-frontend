import type { ComponentType, CSSProperties } from "react"
import { FROM_LEFT, IconFrame, PIVOT, stagger, type IconProps } from "@/components/landing/icons/frame"
import { cn } from "@/lib/utils"

const TILES = [
  { x: 8, y: 8 },
  { x: 26, y: 8 },
  { x: 8, y: 26 },
  { x: 26, y: 26 },
]
const SLIDERS = [
  { x: 14, y: 20, duration: "2.6s" },
  { x: 24, y: 30, duration: "3.2s" },
  { x: 34, y: 24, duration: "2.2s" },
]
const BATCH_ROWS = [17, 24, 31]
const CALENDAR_CELLS = [
  [15, 27],
  [24, 27],
  [33, 27],
  [15, 34],
  [24, 34],
  [33, 34],
]

function Overview({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      {TILES.map((tile, index) => (
        <g key={`${tile.x}-${tile.y}`}>
          <rect x={tile.x} y={tile.y} width={14} height={14} rx={3} />
          <rect
            x={tile.x + 3.5}
            y={tile.y + 3.5}
            width={7}
            height={7}
            rx={1.5}
            fill="currentColor"
            stroke="none"
            className="animate-layer-blink"
            style={stagger(index, 0.6)}
          />
        </g>
      ))}
    </IconFrame>
  )
}

function ControlPanel({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      {SLIDERS.map((slider, index) => (
        <g key={slider.x}>
          <path d={`M${slider.x} 8v32`} strokeWidth={2} opacity={0.45} />
          <circle
            cx={slider.x}
            cy={slider.y}
            r={4.5}
            fill="var(--card)"
            className="animate-icon-bob"
            style={{ animationDuration: slider.duration, animationDelay: `${index * -0.7}s` }}
          />
        </g>
      ))}
    </IconFrame>
  )
}

function Batches({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <rect x={6} y={9} width={36} height={30} rx={4} />
      {BATCH_ROWS.map((y, index) => (
        <g key={y}>
          <path d={`M13 ${y}h22`} strokeWidth={4} opacity={0.25} />
          <path d={`M13 ${y}h22`} strokeWidth={4} className={cn(FROM_LEFT, "animate-icon-fill")} style={{ animationDuration: `${3 + index * 0.6}s` }} />
        </g>
      ))}
    </IconFrame>
  )
}

function Schedule({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <rect x={7} y={10} width={34} height={31} rx={4} />
      <path d="M7 19h34M16 6v7M32 6v7" />
      {CALENDAR_CELLS.map(([x, y], index) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r={2.2}
          fill="currentColor"
          stroke="none"
          className="animate-layer-blink"
          style={{ ...stagger(index, 0.45), animationDuration: "2.7s" }}
        />
      ))}
    </IconFrame>
  )
}

function Efficiency({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M7 34a17 17 0 0 1 34 0" />
      <path d="M12 24l2 1.5M24 15v3M36 24l-2 1.5" strokeWidth={2} />
      <g className="animate-icon-swing" style={{ transformOrigin: "24px 34px", transformBox: "view-box" }}>
        <path d="M24 34L24 19" />
      </g>
      <circle cx={24} cy={34} r={3} fill="currentColor" stroke="none" />
    </IconFrame>
  )
}

function AiAgents({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M24 12V7" />
      <circle cx={24} cy={5.5} r={2.5} fill="currentColor" stroke="none" className="animate-layer-blink" />
      <rect x={9} y={12} width={30} height={26} rx={7} />
      <path d="M5 22v8M43 22v8" />
      <rect x={16} y={21} width={5} height={7} rx={2.5} fill="currentColor" stroke="none" className={cn(PIVOT, "animate-icon-eye")} />
      <rect x={27} y={21} width={5} height={7} rx={2.5} fill="currentColor" stroke="none" className={cn(PIVOT, "animate-icon-eye")} />
      <path d="M18 33h12" strokeWidth={2} />
    </IconFrame>
  )
}

function Crm({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <circle cx={15} cy={16} r={5.5} className={cn(PIVOT, "animate-icon-pulse")} />
      <circle cx={33} cy={16} r={5.5} className={cn(PIVOT, "animate-icon-pulse")} style={{ animationDelay: "-1.2s" }} />
      <path d="M5 38c0-6 4-10 10-10s10 4 10 10M23 38c0-6 4-10 10-10s10 4 10 10" />
      <path d="M21 16h6" strokeWidth={2} strokeDasharray="2 3" className="animate-layer-flow" />
    </IconFrame>
  )
}

function Wallboard({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <rect x={4} y={8} width={40} height={27} rx={3} />
      <path d="M16 42h16M24 35v7" />
      <path d="M10 15h12M10 21h18" strokeWidth={2} opacity={0.4} />
      <path d="M9 14h30" strokeWidth={2} className="animate-icon-scan" style={{ "--scan": "14px" } as CSSProperties} />
    </IconFrame>
  )
}

function Tablet({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <rect x={10} y={4} width={28} height={40} rx={4} />
      <path d="M22 39h4M17 11h14" strokeWidth={2} />
      <circle cx={24} cy={24} r={9} strokeWidth={1.5} className={cn(PIVOT, "animate-layer-ring")} />
      <circle cx={24} cy={24} r={2.5} fill="currentColor" stroke="none" />
    </IconFrame>
  )
}

/** One animated icon per console screen, keyed by the navigation item's title. */
export const SCREEN_ICONS: Record<string, ComponentType<IconProps>> = {
  Overview,
  "Control panel": ControlPanel,
  Batches,
  Schedule,
  Efficiency,
  "AI agents": AiAgents,
  CRM: Crm,
  "TV wallboard": Wallboard,
  "Operator tablet": Tablet,
}
