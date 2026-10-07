import type { ComponentType, CSSProperties } from "react"
import { FROM_BOTTOM, IconFrame, PIVOT, PIVOT_VIEW, stagger, type IconProps } from "@/components/landing/icons/frame"
import type { StepKind } from "@/lib/domain/types"
import { cn } from "@/lib/utils"

/** The machine vessel every wet step draws inside. */
const VESSEL = "M10 12v24a5 5 0 0 0 5 5h18a5 5 0 0 0 5-5V12"

function Load({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M8 26h32v14a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3z" />
      <g className="animate-icon-bob">
        <path d="M24 4v14M18 13l6 6 6-6" />
      </g>
    </IconFrame>
  )
}

function Fill({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d={VESSEL} />
      <rect x={13} y={18} width={22} height={20} rx={2} fill="currentColor" stroke="none" opacity={0.35} className={cn(FROM_BOTTOM, "animate-icon-sand-in")} />
      <path d="M24 3v9" strokeDasharray="2 3" className="animate-layer-flow" />
    </IconFrame>
  )
}

function Dose({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M19 6h10M21 6v11l-9 18a4 4 0 0 0 3.6 6h16.8a4 4 0 0 0 3.6-6l-9-18V6" />
      <path d="M15 31h18" opacity={0.45} />
      {[20, 27].map((x, index) => (
        <circle key={x} cx={x} cy={22} r={1.8} fill="currentColor" stroke="none" className="animate-icon-drop" style={{ ...stagger(index, 1.1), "--drop": "12px" } as CSSProperties} />
      ))}
    </IconFrame>
  )
}

function Heat({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <g className={cn(FROM_BOTTOM, "animate-icon-pulse")}>
        <path d="M24 42c-7 0-12-5-12-11 0-8 8-11 8-20 5 3 9 8 9 14 2-1 3-3 3-5 3 3 4 7 4 11 0 6-5 11-12 11z" />
        <path d="M24 42c-3 0-5-2-5-5 0-3 3-5 5-8 2 3 5 5 5 8 0 3-2 5-5 5z" fill="currentColor" stroke="none" opacity={0.5} />
      </g>
    </IconFrame>
  )
}

function Hold({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M20 28V9a4 4 0 0 1 8 0v19a8 8 0 1 1-8 0z" />
      <circle cx={24} cy={34} r={4} fill="currentColor" stroke="none" className={cn(PIVOT, "animate-icon-pulse")} />
      <rect x={22.5} y={14} width={3} height={18} rx={1.5} fill="currentColor" stroke="none" className={cn(FROM_BOTTOM, "animate-layer-bar")} />
      <path d="M33 12h5M33 18h3M33 24h5" strokeWidth={2} opacity={0.5} />
    </IconFrame>
  )
}

function Cool({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <g className={cn(PIVOT_VIEW, "animate-layer-gear")}>
        <path d="M24 5v38M7.5 14.5l33 19M7.5 33.5l33-19" />
        <path d="M19 8l5 4 5-4M19 40l5-4 5 4M8 21l6-1-2-6M40 27l-6 1 2 6M8 27l6 1-2 6M40 21l-6-1 2-6" strokeWidth={2} />
      </g>
    </IconFrame>
  )
}

function Drain({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d={VESSEL} />
      <rect x={13} y={16} width={22} height={22} rx={2} fill="currentColor" stroke="none" opacity={0.35} className={cn(FROM_BOTTOM, "animate-icon-sand-out")} />
      <path d="M24 41v5" strokeDasharray="2 3" className="animate-layer-flow" />
    </IconFrame>
  )
}

function Rinse({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <rect x={7} y={5} width={34} height={38} rx={5} />
      <path d="M12 11h6" strokeWidth={2} />
      <circle cx={24} cy={27} r={10} />
      <g className={cn(PIVOT_VIEW, "animate-layer-gear")} style={{ transformOrigin: "24px 27px", animationDuration: "2.4s" }}>
        <path d="M17 28c2.5-2.5 4.5 2.5 7 0s4.5 2.5 7 0" strokeWidth={2} />
      </g>
    </IconFrame>
  )
}

function Unload({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M8 26h32v14a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3z" />
      <g className="animate-icon-bob" style={{ animationDirection: "reverse" }}>
        <path d="M24 20V5M18 11l6-6 6 6" />
      </g>
    </IconFrame>
  )
}

/** One animated icon per recipe step kind, on the same canvas as the landing icons. */
export const ANIMATED_STEP_ICON: Record<StepKind, ComponentType<IconProps>> = {
  load: Load,
  fill: Fill,
  dose: Dose,
  heat: Heat,
  hold: Hold,
  cool: Cool,
  drain: Drain,
  rinse: Rinse,
  unload: Unload,
}
