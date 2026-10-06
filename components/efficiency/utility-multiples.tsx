"use client"

import { Area, AreaChart, YAxis } from "recharts"
import { split } from "@/components/efficiency/metrics"
import { Delta } from "@/components/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { formatShortDate } from "@/lib/format"
import { average, type DailyMetric } from "@/lib/sim/history"

const UTILITIES = [
  { key: "energyKwhPerKg", label: "Energy", unit: "kWh/kg", digits: 2 },
  { key: "steamKgPerKg", label: "Steam", unit: "kg/kg", digits: 2 },
  { key: "waterLPerKg", label: "Water", unit: "L/kg", digits: 1 },
] as const

export function UtilityMultiples({ history }: { history: DailyMetric[] }) {
  const { baseline, recent } = split(history)
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {UTILITIES.map((utility) => {
        const config = { [utility.key]: { label: utility.label, color: "var(--chart-3)" } } satisfies ChartConfig
        const now = average(recent, (d) => d[utility.key])
        const base = average(baseline, (d) => d[utility.key])
        return (
          <Card key={utility.key} size="sm">
            <CardHeader>
              <CardDescription>{utility.label} intensity</CardDescription>
              <CardTitle className="text-2xl tabular">
                {now.toFixed(utility.digits)} <span className="text-sm font-normal text-muted-foreground">{utility.unit}</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                <Delta value={((now - base) / base) * 100} unit="%" invert /> vs baseline {base.toFixed(utility.digits)}
              </p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={config} className="aspect-auto h-24 w-full">
                <AreaChart data={history} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                  <YAxis hide domain={["dataMin", "dataMax"]} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(_, p) => formatShortDate(Number(p?.[0]?.payload?.date))}
                        formatter={(v) => `${Number(v).toFixed(utility.digits)} ${utility.unit}`}
                      />
                    }
                  />
                  <Area dataKey={utility.key} stroke={`var(--color-${utility.key})`} fill={`var(--color-${utility.key})`} fillOpacity={0.12} strokeWidth={2} isAnimationActive={false} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
