"use client"

import { useMemo } from "react"
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts"
import { LazyMount } from "@/components/lazy-mount"
import { Panel } from "@/components/panel"
import { PanelTitle } from "@/components/panel-title"
import { Temperature } from "@/components/plant/icons/console-icons"
import { CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { temperatureTrace } from "@/lib/domain/analytics"
import type { MachineView } from "@/lib/domain/types"
import { formatHm } from "@/lib/format"
import { MINUTE } from "@/lib/time"

const traceConfig = {
  actual: { label: "Actual", color: "var(--chart-2)" },
  planned: { label: "Recipe plan", color: "var(--muted-foreground)" },
} satisfies ChartConfig

/** The trace is redrawn once per minute of plant time; between minutes it would only move by sensor jitter. */
export function TemperatureCard({ view, now }: { view: MachineView; now: number }) {
  const minute = Math.floor(now / MINUTE) * MINUTE
  const run = view.state.run
  const recipe = view.batch?.recipe
  const end = run ? (view.state.phase === "running" ? minute : (run.steps.at(-1)?.endedAt ?? minute)) : minute
  const currentC = Math.round(view.telemetry.temperatureC)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `run` changes every tick; the trace depends only on its start, steps and current step
  const data = useMemo(() => (run && recipe ? temperatureTrace(recipe, run, end, currentC) : []), [recipe, run?.startedAt, run?.steps.length, run?.stepIndex, end, currentC])

  if (!run || !recipe) {
    return (
      <Panel className="h-full">
        <CardHeader>
          <PanelTitle icon={Temperature}>Temperature profile</PanelTitle>
          <CardDescription>No batch in the machine</CardDescription>
        </CardHeader>
      </Panel>
    )
  }
  const elapsed = (end - run.startedAt) / MINUTE

  return (
    <Panel className="h-full">
      <CardHeader>
        <PanelTitle icon={Temperature}>Temperature profile</PanelTitle>
        <CardDescription>Bath temperature against the recipe, minutes since load</CardDescription>
      </CardHeader>
      <CardContent>
        <LazyMount className="h-72 w-full">
          <ChartContainer config={traceConfig} className="aspect-auto size-full">
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
        </LazyMount>
      </CardContent>
    </Panel>
  )
}
