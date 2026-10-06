"use client"

import { formatClockSeconds, formatLongDate } from "@/lib/format"
import { usePlant } from "@/lib/store/plant"

export function PlantClock() {
  const now = usePlant((state) => state.snapshot?.now)
  if (!now) return <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
  return (
    <div className="hidden text-right leading-tight sm:block">
      <div className="font-mono text-sm font-semibold tabular">{formatClockSeconds(now)}</div>
      <div className="text-[11px] text-muted-foreground">{formatLongDate(now)}</div>
    </div>
  )
}
