"use client"

import NumberFlow, { type Format } from "@number-flow/react"
import type { ComponentType } from "react"
import { GlowCard } from "@/components/glow-card"
import type { IconProps } from "@/components/landing/icons/frame"
import { Completed, Delayed, Held, Processing, Produced, Utilization } from "@/components/plant/icons/console-icons"
import { PERCENT_FORMAT } from "@/lib/number-format"
import { useKpi } from "@/lib/store/plant"
import { cn } from "@/lib/utils"

interface Tile {
  label: string
  value: number
  tone: string
  icon: ComponentType<IconProps>
  suffix?: string
  format?: Format
  hint: string
}

export function KpiStrip() {
  const total = useKpi((k) => k.total)
  const running = useKpi((k) => k.running)
  const delayed = useKpi((k) => k.delayed)
  const held = useKpi((k) => k.held)
  const prepared = useKpi((k) => k.batchesPrepared)
  const offline = useKpi((k) => k.offline)
  const producedKg = useKpi((k) => k.producedKg)
  const batches = useKpi((k) => k.batchesCompleted)
  const utilization = useKpi((k) => k.utilization)
  const rightFirstTime = useKpi((k) => k.rightFirstTime)

  const tiles: Tile[] = [
    { label: "Running", value: running, tone: "text-running", icon: Processing, hint: `of ${total} machines` },
    { label: "Delayed", value: delayed, tone: "text-delayed", icon: Delayed, hint: "≥ 15 min over" },
    { label: "On hold", value: held, tone: "text-held", icon: Held, hint: `${offline} not available` },
    { label: "Produced today", value: producedKg, tone: "text-brand", icon: Produced, suffix: " kg", hint: `${prepared} batches ready next` },
    { label: "Completed", value: batches, tone: "text-complete", icon: Completed, hint: `RFT ${(rightFirstTime * 100).toFixed(1)}%` },
    { label: "Utilization", value: utilization, tone: "text-brand", icon: Utilization, format: PERCENT_FORMAT, hint: "of available machines" },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 px-4 pt-4 sm:grid-cols-3 md:px-8 xl:grid-cols-6">
      {tiles.map((tile, index) => (
        <GlowCard key={tile.label} index={index} tone={tile.label === "Delayed" && delayed > 0 ? "var(--status-delayed)" : undefined} className="flex items-center gap-3 bg-card/45 px-4 py-3">
          <span className={cn("grid size-12 shrink-0 max-[420px]:hidden [@media(max-height:50rem)]:size-10 place-items-center rounded-xl bg-current/10 ring-1 ring-current/20", tile.tone)}>
            <tile.icon className="size-8" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">{tile.label}</p>
            <NumberFlow value={tile.value} suffix={tile.suffix} format={tile.format} className={cn("text-2xl font-semibold tabular min-[420px]:text-3xl", tile.tone)} />
            <p className="truncate text-xs text-muted-foreground [@media(max-height:50rem)]:hidden">{tile.hint}</p>
          </div>
        </GlowCard>
      ))}
    </div>
  )
}
