"use client"

import { Activity, Gauge, ShieldCheck, Timer } from "lucide-react"
import { pct, split } from "@/components/efficiency/metrics"
import { Delta, StatCard } from "@/components/stat-card"
import { average, type DailyMetric } from "@/lib/sim/history"

export function OeeTiles({ history }: { history: DailyMetric[] }) {
  const { baseline, recent } = split(history)
  const tiles = [
    { label: "OEE · last 7 days", pick: (d: DailyMetric) => d.oee, icon: Gauge },
    { label: "Availability", pick: (d: DailyMetric) => d.availability, icon: Timer },
    { label: "Performance", pick: (d: DailyMetric) => d.performance, icon: Activity },
    { label: "Quality · right first time", pick: (d: DailyMetric) => d.quality, icon: ShieldCheck },
  ]
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {tiles.map((tile) => {
        const now = average(recent, tile.pick)
        const base = average(baseline, tile.pick)
        return (
          <StatCard
            key={tile.label}
            label={tile.label}
            value={now}
            format={{ style: "percent", maximumFractionDigits: 1 }}
            icon={tile.icon}
            hint={
              <>
                <Delta value={(now - base) * 100} unit=" pts" /> vs baseline {pct(base)}
              </>
            }
          />
        )
      })}
    </div>
  )
}
