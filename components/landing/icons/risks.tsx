import type { ComponentType, CSSProperties } from "react"
import { IconFrame, stagger, type IconProps } from "@/components/landing/icons/frame"

/** Pathlength 1 lets a stroke "draw" itself with one dash. */
const DRAW: CSSProperties = { strokeDasharray: 1, strokeDashoffset: 1 }

function Padlock({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M16 22v-6a8 8 0 0 1 16 0v6" className="animate-icon-bob" />
      <rect x={10} y={22} width={28} height={20} rx={4} fill="var(--card)" />
      <circle cx={24} cy={31} r={2.5} fill="currentColor" stroke="none" />
      <path d="M24 33v4" strokeWidth={2} />
    </IconFrame>
  )
}

function QrScan({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M8 16v-6a2 2 0 0 1 2-2h6M32 8h6a2 2 0 0 1 2 2v6M40 32v6a2 2 0 0 1-2 2h-6M16 40h-6a2 2 0 0 1-2-2v-6" />
      <rect x={17} y={17} width={5} height={5} rx={1} fill="currentColor" stroke="none" />
      <rect x={26} y={17} width={5} height={5} rx={1} fill="currentColor" stroke="none" />
      <rect x={17} y={26} width={5} height={5} rx={1} fill="currentColor" stroke="none" />
      <path d="M12 15h24" strokeWidth={2} className="animate-icon-scan" style={{ "--scan": "18px" } as CSSProperties} />
    </IconFrame>
  )
}

function Signal({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <circle cx={24} cy={39} r={2.5} fill="currentColor" stroke="none" />
      {["M18 32a8 8 0 0 1 12 0", "M12 26a17 17 0 0 1 24 0", "M6 20a26 26 0 0 1 36 0"].map((path, index) => (
        <path key={path} d={path} className="animate-layer-blink" style={{ ...stagger(index + 1, 0.3), animationDuration: "2s" }} />
      ))}
    </IconFrame>
  )
}

function ShieldCheck({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M24 5l15 6v11c0 10-6 17-15 21C15 39 9 32 9 22V11z" />
      <path d="M17 24l5 5 9-10" pathLength={1} style={DRAW} className="animate-icon-draw" />
    </IconFrame>
  )
}

function TrendUp({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M7 7v34h34" strokeWidth={2} opacity={0.5} />
      <path d="M12 32l9-9 6 6 12-14" pathLength={1} style={DRAW} className="animate-icon-draw" />
      <path d="M31 15h8v8" pathLength={1} style={DRAW} className="animate-icon-draw" />
    </IconFrame>
  )
}

/** One per risk, in the order of RISKS. */
export const RISK_ICONS: ComponentType<IconProps>[] = [Padlock, QrScan, Signal, ShieldCheck, TrendUp]
