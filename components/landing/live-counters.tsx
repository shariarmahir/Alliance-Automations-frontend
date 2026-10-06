"use client"

import NumberFlow from "@number-flow/react"
import { GlowCard } from "@/components/glow-card"
import { usePlant } from "@/lib/store/plant"

export function LiveCounters() {
  const kpis = usePlant((state) => state.kpis)
  const counters = [
    { label: "Machines processing", value: kpis ? kpis.running + kpis.delayed + kpis.held : 0 },
    { label: "Kilograms dyed today", value: kpis?.producedKg ?? 0 },
    { label: "Batches completed", value: kpis?.batchesCompleted ?? 0 },
    { label: "Right first time", value: kpis?.rightFirstTime ?? 0, percent: true },
  ]
  return (
    <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {counters.map((counter, index) => (
        <GlowCard lift index={index} key={counter.label} className="p-6">
          <dt className="text-xs text-muted-foreground">{counter.label}</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-brand">
            <NumberFlow
              value={counter.value}
              format={counter.percent ? { style: "percent", maximumFractionDigits: 1 } : undefined}
              className="tabular"
            />
          </dd>
        </GlowCard>
      ))}
    </dl>
  )
}
