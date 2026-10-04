"use client"

import NumberFlow, { type Format } from "@number-flow/react"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: number
  format?: Format
  suffix?: string
  icon?: LucideIcon
  tone?: string
  hint?: ReactNode
  className?: string
}

export function StatCard({ label, value, format, suffix, icon: Icon, tone = "text-primary", hint, className }: StatCardProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-card p-4 ring-1 ring-foreground/10", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <span className={cn("grid size-7 place-items-center rounded-md bg-muted", tone)}>
            <Icon className="size-4" aria-hidden />
          </span>
        )}
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">
        <NumberFlow value={value} format={format} suffix={suffix} className="tabular" />
      </div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
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
