"use client"

import NumberFlow from "@number-flow/react"
import { cn } from "@/lib/utils"

const ARC = Math.PI * 40

/** Half-ring gauge for one sensor channel. */
export function Gauge({
  label,
  value,
  max,
  unit,
  digits = 0,
  tone = "text-primary",
}: {
  label: string
  value: number
  max: number
  unit: string
  digits?: number
  tone?: string
}) {
  const ratio = Math.min(1, Math.max(0, value / max))
  return (
    <div className="flex flex-col items-center rounded-xl bg-card px-4 pt-4 pb-3 ring-1 ring-foreground/10">
      <div className="relative w-full max-w-40">
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
          <NumberFlow
            value={value}
            format={{ maximumFractionDigits: digits, minimumFractionDigits: digits }}
            className="text-2xl font-semibold tabular"
          />
          <span className="ml-1 text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
      <p className="mt-2 text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  )
}
