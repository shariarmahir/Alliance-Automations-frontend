"use client"

import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts"
import { lossRows } from "@/components/efficiency/metrics"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { formatInt } from "@/lib/format"
import { type DailyMetric } from "@/lib/sim/history"

const lossConfig = { minutes: { label: "Lost machine-minutes / day", color: "var(--chart-2)" } } satisfies ChartConfig

export function LossPareto({ history }: { history: DailyMetric[] }) {
  const rows = lossRows(history)
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Loss Pareto</CardTitle>
        <CardDescription>Average lost machine-minutes per day, last 7 days, by reason code</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={lossConfig} className="aspect-auto h-72 w-full">
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
      </CardContent>
    </Card>
  )
}
