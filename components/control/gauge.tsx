"use client"

import type { ComponentType } from "react"
import { GlowCard } from "@/components/glow-card"
import type { IconProps } from "@/components/landing/icons/frame"
import { cn } from "@/lib/utils"

const ARC = Math.PI * 40

interface GaugeProps {
  label: string
  value: number
  max: number
  unit: string
  digits?: number
  tone?: string
  icon: ComponentType<IconProps>
  index: number
}

/**
 * Half-ring gauge for one sensor channel, on a glow card with its animated icon. The reading is plain text, not
 * NumberFlow: a sensor value changes on every tick, and NumberFlow would measure layout each time.
 */
export function Gauge({ label, value, max, unit, digits = 0, tone = "text-brand", icon: Icon, index }: GaugeProps) {
  const ratio = Math.min(1, Math.max(0, value / max))
  return (
    <GlowCard index={index} className="flex flex-col items-center bg-card/45 px-4 pt-3 pb-3">
      <div className="flex w-full items-center justify-between gap-2">
        <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
        <Icon className={cn("size-5 shrink-0", tone)} />
      </div>
      <div className="relative mt-1 w-full max-w-40">
        <svg viewBox="0 0 100 56" className="w-full" aria-hidden>
          <path d="M10 50 A40 40 0 0 1 90 50" fill="none" strokeWidth="7" strokeLinecap="round" className="stroke-muted" />
          <path
            d="M10 50 A40 40 0 0 1 90 50"
            fill="none"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={ARC}
            strokeDashoffset={ARC * (1 - ratio)}
            className={cn("stroke-current transition-[stroke-dashoffset] duration-700 ease-out", tone)}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 text-center">
          <span className="text-2xl font-semibold tabular">{value.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}</span>
          <span className="ml-1 text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground tabular">
        of {max.toFixed(digits)} {unit}
      </p>
    </GlowCard>
  )
}
