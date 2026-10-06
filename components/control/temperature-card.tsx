"use client"

import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { temperatureTrace } from "@/lib/domain/analytics"
import type { MachineView } from "@/lib/domain/types"
import { formatHm } from "@/lib/format"
import { MINUTE } from "@/lib/time"

const traceConfig = {
  actual: { label: "Actual", color: "var(--chart-2)" },
  planned: { label: "Recipe plan", color: "var(--muted-foreground)" },
} satisfies ChartConfig

export function TemperatureCard({ view, now }: { view: MachineView; now: number }) {
  const run = view.state.run
  if (!run || !view.batch) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Temperature profile</CardTitle>
          <CardDescription>No batch in the machine</CardDescription>
        </CardHeader>
      </Card>
    )
  }
  const end = view.state.phase === "running" ? now : (run.steps.at(-1)?.endedAt ?? now)
  const data = temperatureTrace(view.batch.recipe, run, end, view.telemetry.temperatureC)
  const elapsed = (end - run.startedAt) / MINUTE

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Temperature profile</CardTitle>
        <CardDescription>Bath temperature against the recipe, minutes since load</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={traceConfig} className="aspect-auto h-72 w-full">
          <LineChart data={data} margin={{ left: 0, right: 12, top: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="minute" type="number" domain={[0, "dataMax"]} tickLine={false} axisLine={false} tickFormatter={(m: number) => formatHm(m)} />
            <YAxis tickLine={false} axisLine={false} width={40} domain={[20, 100]} unit="°" />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => `+${formatHm(Number(payload?.[0]?.payload?.minute ?? 0))}`}
                  formatter={(value, name) => `${traceConfig[name as keyof typeof traceConfig]?.label}: ${Number(value).toFixed(1)} °C`}
                />
              }
            />
            <ReferenceLine x={elapsed} stroke="var(--primary)" strokeOpacity={0.6} />
            <Line dataKey="planned" stroke="var(--color-planned)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} connectNulls isAnimationActive={false} />
            <Line dataKey="actual" stroke="var(--color-actual)" strokeWidth={2} dot={false} connectNulls isAnimationActive={false} />
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
