"use client"

import { useMemo } from "react"
import { Completed, Delayed, Held, Processing, Produced, Utilization } from "@/components/plant/icons/console-icons"
import { StatCard } from "@/components/stat-card"
import { hourlyOutput } from "@/lib/domain/analytics"
import { PERCENT_FORMAT } from "@/lib/number-format"
import { useKpi, useSnapshot } from "@/lib/store/plant"
import { HOUR } from "@/lib/time"

/** Finished hours behind the output and batch sparklines. The running hour is left out because it is still filling. */
const TREND_HOURS = 12

/** Each card reads only its own numbers, so the one-second tick re-renders a card only when its value moves. */
export function KpiRow() {
  const total = useKpi((kpis) => kpis.total)
  const processing = useKpi((kpis) => kpis.running + kpis.delayed + kpis.held)
  const delayed = useKpi((kpis) => kpis.delayed)
  const held = useKpi((kpis) => kpis.held)
  const ready = useKpi((kpis) => kpis.ready)
  const idle = useKpi((kpis) => kpis.idle)
  const producedKg = useKpi((kpis) => kpis.producedKg)
  const batches = useKpi((kpis) => kpis.batchesCompleted)
  const prepared = useKpi((kpis) => kpis.batchesPrepared)
  const utilization = useKpi((kpis) => kpis.utilization)
  const rightFirstTime = useKpi((kpis) => kpis.rightFirstTime)
  const completed = useSnapshot((snapshot) => snapshot.completed)
  const hour = useSnapshot((snapshot) => Math.floor(snapshot.now / HOUR) * HOUR)
  const hourly = useMemo(() => hourlyOutput(completed, hour - HOUR, TREND_HOURS), [completed, hour])

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-6">
      <StatCard index={0} label="Processing" value={processing} icon={Processing} tone="text-running" hint={`of ${total} machines`} meter={processing / total} />
      <StatCard index={1} label="Delayed" value={delayed} icon={Delayed} tone="text-delayed" hint="≥ 15 min over target" meter={delayed / total} />
      <StatCard index={2} label="On hold" value={held} icon={Held} tone="text-held" hint={`${ready} ready · ${idle} idle`} meter={held / total} />
      <StatCard
        index={3}
        label="Produced today"
        value={producedKg}
        suffix=" kg"
        icon={Produced}
        hint="Since 06:00 · last 12 h"
        trend={hourly.map((row) => row.kg)}
      />
      <StatCard
        index={4}
        label="Batches completed"
        value={batches}
        icon={Completed}
        tone="text-complete"
        hint={`${prepared} next batches ready`}
        trend={hourly.map((row) => row.batches)}
      />
      <StatCard index={5} label="Utilization" value={utilization} format={PERCENT_FORMAT} icon={Utilization} hint={`RFT ${(rightFirstTime * 100).toFixed(1)}%`} meter={utilization} />
    </div>
  )
}
