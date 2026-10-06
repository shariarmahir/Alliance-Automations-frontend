"use client"

import { Boxes, CircleCheckBig, CirclePause, Gauge, Play, Siren } from "lucide-react"
import { StatCard } from "@/components/stat-card"
import { PERCENT_FORMAT } from "@/lib/number-format"
import { useKpis } from "@/lib/store/plant"

export function KpiRow() {
  const kpis = useKpis()
  const processing = kpis.running + kpis.delayed + kpis.held

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      <StatCard label="Processing" value={processing} icon={Play} tone="text-running" hint={`of ${kpis.total} machines`} />
      <StatCard label="Delayed" value={kpis.delayed} icon={Siren} tone="text-delayed" hint="≥ 15 min over target" />
      <StatCard label="On hold" value={kpis.held} icon={CirclePause} tone="text-held" hint={`${kpis.ready} ready · ${kpis.idle} idle`} />
      <StatCard label="Produced today" value={kpis.producedKg} suffix=" kg" icon={Boxes} hint="Since 06:00 shift start" />
      <StatCard
        label="Batches completed"
        value={kpis.batchesCompleted}
        icon={CircleCheckBig}
        tone="text-complete"
        hint={`${kpis.batchesPrepared} next batches ready`}
      />
      <StatCard label="Utilization" value={kpis.utilization} format={PERCENT_FORMAT} icon={Gauge} hint={`RFT ${(kpis.rightFirstTime * 100).toFixed(1)}%`} />
    </div>
  )
}
