"use client"

import { Delta } from "@/components/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GO_LIVE_DAYS_AGO, HISTORY_DAYS, average } from "@/lib/sim/history"
import { useKpis, usePlant } from "@/lib/store/plant"

export function UtilityIntensity() {
  const kpis = useKpis()
  const history = usePlant((state) => state.history)
  const baseline = history.slice(0, HISTORY_DAYS - GO_LIVE_DAYS_AGO)
  const rows = [
    { label: "Energy", unit: "kWh/kg", today: kpis.energyKwhPerKg, base: average(baseline, (d) => d.energyKwhPerKg), digits: 2 },
    { label: "Steam", unit: "kg/kg", today: kpis.steamKgPerKg, base: average(baseline, (d) => d.steamKgPerKg), digits: 2 },
    { label: "Water", unit: "L/kg", today: kpis.waterLPerKg, base: average(baseline, (d) => d.waterLPerKg), digits: 1 },
  ]

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Utility intensity</CardTitle>
        <CardDescription>Today against the four-week pre-pilot baseline</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {rows.map((row) => {
          const change = ((row.today - row.base) / row.base) * 100
          return (
            <div key={row.label} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5">
              <div>
                <p className="text-xs text-muted-foreground">{row.label}</p>
                <p className="text-lg font-semibold tabular">
                  {row.today.toFixed(row.digits)} <span className="text-xs font-normal text-muted-foreground">{row.unit}</span>
                </p>
              </div>
              <div className="text-right text-xs">
                <Delta value={change} unit="%" invert />
                <p className="text-muted-foreground tabular">
                  base {row.base.toFixed(row.digits)}
                </p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
