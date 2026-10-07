"use client"

import NumberFlow, { type Format } from "@number-flow/react"
import type { ComponentType, ReactNode } from "react"
import { GlowCard } from "@/components/glow-card"
import type { IconProps } from "@/components/landing/icons/frame"
import { Sparkline } from "@/components/sparkline"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: number
  format?: Format
  suffix?: string
  /** An animated icon from `components/plant/icons` or `components/landing/icons`. */
  icon?: ComponentType<IconProps>
  /** Text colour for the icon and sparkline. */
  tone?: string
  hint?: ReactNode
  /** Recent values, oldest first, drawn as a sparkline under the number. */
  trend?: number[]
  /** A share from 0 to 1, drawn as a thin meter when there is no trend, such as machines out of the fleet. */
  meter?: number
  index?: number
  className?: string
}

export function StatCard({ label, value, format, suffix, icon: Icon, tone = "text-brand", hint, trend, meter, index = 0, className }: StatCardProps) {
  return (
    <GlowCard index={index} className={cn("flex min-w-0 flex-col bg-card/45 p-3.5 sm:p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg bg-current/10 ring-1 ring-current/20", tone)}>
            <Icon className="size-6" />
          </span>
        )}
      </div>
      <div className="mt-1 min-w-0 truncate text-2xl font-semibold tracking-tight min-[420px]:text-3xl">
        <NumberFlow value={value} format={format} suffix={suffix} className="tabular" />
      </div>
      {hint && <div className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</div>}
      {trend && trend.length > 1 && <Sparkline values={trend} className={cn("mt-auto h-8 w-full pt-3", tone)} />}
      {meter !== undefined && (
        <div className={cn("mt-auto pt-4", tone)}>
          <div className="h-1.5 overflow-hidden rounded-full bg-current/15">
            <div className="h-full rounded-full bg-current transition-[width] duration-700" style={{ width: `${Math.min(1, Math.max(0, meter)) * 100}%` }} />
          </div>
        </div>
      )}
    </GlowCard>
  )
}

export function Delta({ value, unit = "", invert = false, digits = 1 }: { value: number; unit?: string; invert?: boolean; digits?: number }) {
  const good = invert ? value < 0 : value > 0
  const sign = value > 0 ? "+" : value < 0 ? "−" : "±"
  return (
    <span className={cn("font-medium tabular", value === 0 ? "text-muted-foreground" : good ? "text-running" : "text-delayed")}>
      {sign}
      {Math.abs(value).toFixed(digits)}
      {unit}
    </span>
  )
}
