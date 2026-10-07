"use client"

import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts"
import { lossRows } from "@/components/efficiency/metrics"
import { LazyMount } from "@/components/lazy-mount"
import { Panel } from "@/components/panel"
import { PanelTitle } from "@/components/panel-title"
import { BayLoad } from "@/components/plant/icons/console-icons"
import { CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { formatInt } from "@/lib/format"
import { type DailyMetric } from "@/lib/sim/history"

const lossConfig = { minutes: { label: "Lost machine-minutes / day", color: "var(--chart-2)" } } satisfies ChartConfig

export function LossPareto({ history }: { history: DailyMetric[] }) {
  const rows = lossRows(history)
  return (
    <Panel className="h-full">
      <CardHeader>
        <PanelTitle icon={BayLoad}>Loss Pareto</PanelTitle>
        <CardDescription>Average lost machine-minutes per day, last 7 days, by reason code</CardDescription>
      </CardHeader>
      <CardContent>
        <LazyMount className="h-72 w-full">
          <ChartContainer config={lossConfig} className="aspect-auto size-full">
            <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 48 }} barCategoryGap={4}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} width={150} />
              <ChartTooltip
                cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                content={
                  <ChartTooltipContent
                    formatter={(value, _, item) => `${formatInt(Number(value))} min/day · baseline ${formatInt(item.payload.baseline)}`}
                  />
                }
              />
              <Bar dataKey="minutes" fill="var(--color-minutes)" radius={4} isAnimationActive={false}>
                <LabelList dataKey="minutes" position="right" className="fill-foreground" fontSize={12} />
              </Bar>
            </BarChart>
          </ChartContainer>
        </LazyMount>
      </CardContent>
    </Panel>
  )
}
