"use client"

import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts"
import { pct, split } from "@/components/efficiency/metrics"
import { LazyMount } from "@/components/lazy-mount"
import { Panel } from "@/components/panel"
import { PanelTitle } from "@/components/panel-title"
import { Temperature } from "@/components/plant/icons/console-icons"
import { CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { formatShortDate } from "@/lib/format"
import { GO_LIVE_DAYS_AGO, HISTORY_DAYS, average, type DailyMetric } from "@/lib/sim/history"

const oeeConfig = { oee: { label: "OEE", color: "var(--chart-1)" } } satisfies ChartConfig

export function OeeTrend({ history }: { history: DailyMetric[] }) {
  const goLive = history[HISTORY_DAYS - GO_LIVE_DAYS_AGO]?.date
  const baseline = average(split(history).baseline, (d) => d.oee)
  return (
    <Panel className="h-full">
      <CardHeader>
        <PanelTitle icon={Temperature}>OEE trend</PanelTitle>
        <CardDescription>Availability × performance × quality, daily. Monitoring went live {GO_LIVE_DAYS_AGO} days ago.</CardDescription>
      </CardHeader>
      <CardContent>
        <LazyMount className="h-72 w-full">
          <ChartContainer config={oeeConfig} className="aspect-auto size-full">
            <LineChart data={history} margin={{ left: 0, right: 16, top: 16 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} tickFormatter={formatShortDate} />
              <YAxis tickLine={false} axisLine={false} width={44} domain={[0.45, 0.75]} tickFormatter={(v: number) => `${Math.round(v * 100)}%`} />
              <ChartTooltip
                content={<ChartTooltipContent labelFormatter={(_, p) => formatShortDate(Number(p?.[0]?.payload?.date))} formatter={(v) => `OEE ${pct(Number(v))}`} />}
              />
              <ReferenceLine y={baseline} stroke="var(--muted-foreground)" strokeOpacity={0.6} label={{ value: "Baseline", position: "insideBottomRight", fill: "var(--muted-foreground)", fontSize: 11 }} />
              <ReferenceLine x={goLive} stroke="var(--primary)" label={{ value: "Pilot go-live", position: "insideTopRight", fill: "var(--primary)", fontSize: 11 }} />
              <Line dataKey="oee" stroke="var(--color-oee)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
            </LineChart>
          </ChartContainer>
        </LazyMount>
      </CardContent>
    </Panel>
  )
}
