"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { LazyMount } from "@/components/lazy-mount"
import { Panel } from "@/components/panel"
import { PanelTitle } from "@/components/panel-title"
import { Produced } from "@/components/plant/icons/console-icons"
import { CardAction, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { hourlyOutput } from "@/lib/domain/analytics"
import { formatClock, formatInt } from "@/lib/format"
import { useSnapshot } from "@/lib/store/plant"
import { HOUR } from "@/lib/time"

const outputConfig = { kg: { label: "Output", color: "var(--chart-1)" } } satisfies ChartConfig

export function OutputChart() {
  const completed = useSnapshot((snapshot) => snapshot.completed)
  // Subscribing to the hour instead of the clock keeps the chart still between batch completions.
  const hour = useSnapshot((snapshot) => Math.floor(snapshot.now / HOUR) * HOUR)
  const data = useMemo(() => hourlyOutput(completed, hour), [completed, hour])
  const total = data.reduce((sum, row) => sum + row.kg, 0)

  return (
    <Panel className="h-full">
      <CardHeader>
        <PanelTitle icon={Produced}>Output, last 24 hours</PanelTitle>
        <CardDescription>Kilograms unloaded per hour across all bays</CardDescription>
        <CardAction className="text-right">
          <div className="text-xl font-semibold tabular">{formatInt(total)} kg</div>
          <div className="text-xs text-muted-foreground">{data.reduce((s, r) => s + r.batches, 0)} batches</div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <LazyMount className="h-64 w-full">
          <ChartContainer config={outputConfig} className="aspect-auto size-full">
            <BarChart data={data} margin={{ left: 4, right: 4 }} barCategoryGap={2}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="hour"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={2}
                tickFormatter={(hour: number) => formatClock(hour)}
              />
              <YAxis tickLine={false} axisLine={false} width={44} tickFormatter={(kg: number) => `${Math.round(kg / 1000)}t`} />
              <ChartTooltip
                cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => {
                      const hour = payload?.[0]?.payload?.hour as number | undefined
                      return hour ? `${formatClock(hour)} – ${formatClock(hour + HOUR)}` : ""
                    }}
                    formatter={(value) => `${formatInt(Number(value))} kg`}
                  />
                }
              />
              <Bar dataKey="kg" fill="var(--color-kg)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ChartContainer>
        </LazyMount>
      </CardContent>
    </Panel>
  )
}
