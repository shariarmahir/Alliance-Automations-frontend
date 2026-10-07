"use client"

import { useMemo } from "react"
import { GlowCard } from "@/components/glow-card"
import { Produced } from "@/components/plant/icons/console-icons"
import { hourlyOutput } from "@/lib/domain/analytics"
import { formatClock, formatKg } from "@/lib/format"
import { useKpi, useSnapshot } from "@/lib/store/plant"
import { HOUR } from "@/lib/time"

/** Finished hours shown as bars. The running hour is left out because it is still filling. */
const HOURS = 12

/** Output by hour, so the wall shows whether the floor is speeding up or slowing down, not only today's total. */
export function OutputPanel() {
  const completed = useSnapshot((snapshot) => snapshot.completed)
  const hour = useSnapshot((snapshot) => Math.floor(snapshot.now / HOUR) * HOUR)
  const producedKg = useKpi((k) => k.producedKg)
  const energy = useKpi((k) => k.energyKwhPerKg)
  const water = useKpi((k) => k.waterLPerKg)
  const rows = useMemo(() => hourlyOutput(completed, hour - HOUR, HOURS), [completed, hour])
  const peak = Math.max(1, ...rows.map((row) => row.kg))
  const last = rows.at(-1)

  return (
    <GlowCard index={2} className="flex flex-col bg-card/45 p-4">
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-lg bg-brand/10 text-brand ring-1 ring-brand/20">
          <Produced className="size-6" />
        </span>
        <p className="text-lg font-semibold">Output by hour</p>
        <span className="ml-auto text-sm text-muted-foreground tabular">{formatKg(producedKg)} today</span>
      </div>
      <div className="mt-4 flex h-24 items-end gap-1 [@media(max-height:50rem)]:h-16" role="img" aria-label={`Kilograms unloaded in each of the last ${HOURS} hours`}>
        {rows.map((row, index) => (
          <div
            key={row.hour}
            className="flex-1 rounded-t-sm bg-brand transition-[height] duration-700"
            style={{ height: `${Math.max(4, (row.kg / peak) * 100)}%`, opacity: 0.45 + (index / rows.length) * 0.55 }}
            title={`${formatClock(row.hour)} · ${formatKg(row.kg)}`}
          />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[11px] text-muted-foreground tabular">
        <span>{rows[0] && formatClock(rows[0].hour)}</span>
        <span>{last && formatClock(last.hour + HOUR)}</span>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 border-t pt-3 text-center">
        <div>
          <dt className="text-xs text-muted-foreground">Last hour</dt>
          <dd className="font-semibold tabular">{formatKg(last?.kg ?? 0)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Energy</dt>
          <dd className="font-semibold tabular">{producedKg ? `${energy.toFixed(2)} kWh/kg` : "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Water</dt>
          <dd className="font-semibold tabular">{producedKg ? `${water.toFixed(0)} L/kg` : "—"}</dd>
        </div>
      </dl>
    </GlowCard>
  )
}
