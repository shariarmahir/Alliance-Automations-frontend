"use client"

import NumberFlow from "@number-flow/react"
import { STATUS_META } from "@/components/plant/status"
import { useKpis } from "@/lib/store/plant"
import { cn } from "@/lib/utils"

export function KpiStrip() {
  const kpis = useKpis()
  const tiles = [
    { label: "Total machines", value: kpis.total, tone: "text-primary" },
    { label: "Running", value: kpis.running, tone: STATUS_META.running.text },
    { label: "Delayed", value: kpis.delayed, tone: STATUS_META.delayed.text },
    { label: "On hold", value: kpis.held, tone: STATUS_META.held.text },
    { label: "Idle", value: kpis.idle, tone: STATUS_META.idle.text },
    { label: "Batch ready", value: kpis.batchesPrepared, tone: STATUS_META.ready.text },
    { label: "Not available", value: kpis.offline, tone: STATUS_META.offline.text },
    { label: "Today's production", value: kpis.producedKg, tone: "text-primary", suffix: " kg" },
    { label: "Completed today", value: kpis.batchesCompleted, tone: STATUS_META.running.text },
  ]
  return (
    <div className="grid grid-cols-[repeat(7,1fr)_1.5fr_1.2fr] gap-3 px-8 pt-4">
      {tiles.map((tile) => (
        <div key={tile.label} className="rounded-xl bg-card px-4 py-2.5 ring-1 ring-foreground/10">
          <p className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">{tile.label}</p>
          <NumberFlow value={tile.value} suffix={tile.suffix} className={cn("text-3xl font-semibold tabular", tile.tone)} />
        </div>
      ))}
    </div>
  )
}
