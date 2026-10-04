"use client"

import { ArrowLeft, Check } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts"
import { Gauge } from "@/components/control/gauge"
import { MachineCommands } from "@/components/control/machine-commands"
import { PlantGate } from "@/components/plant/plant-gate"
import { StatusBadge } from "@/components/plant/status"
import { STEP_ICON, ShadeSwatch } from "@/components/plant/step-readout"
import { Reveal } from "@/components/reveal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { ScrollArea } from "@/components/ui/scroll-area"
import { temperatureTrace } from "@/lib/domain/analytics"
import { MINUTE } from "@/lib/domain/rules"
import type { MachineView } from "@/lib/domain/types"
import { formatClock, formatHm, formatInt } from "@/lib/format"
import { useMachineView, usePlant } from "@/lib/store/plant"
import { cn } from "@/lib/utils"

const traceConfig = {
  actual: { label: "Actual", color: "var(--chart-2)" },
  planned: { label: "Recipe plan", color: "var(--muted-foreground)" },
} satisfies ChartConfig

function TemperatureCard({ view, now }: { view: MachineView; now: number }) {
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

function RecipeTimeline({ view }: { view: MachineView }) {
  const run = view.state.run
  if (!view.batch || !run) return null
  const done = new Map(run.steps.map((record) => [record.index, record]))

  return (
    <ol className="relative flex flex-col">
      {view.batch.recipe.map((step, index) => {
        const record = done.get(index)
        const current = view.state.phase === "running" && run.stepIndex === index
        const Icon = record ? Check : STEP_ICON[step.kind]
        const actualMin = record ? (record.endedAt - record.startedAt) / MINUTE : null
        return (
          <li key={index} className="relative flex gap-3 pb-3 last:pb-0">
            {index < view.batch!.recipe.length - 1 && <span className="absolute top-7 bottom-0 left-3.5 w-px bg-border" aria-hidden />}
            <span
              className={cn(
                "relative z-10 grid size-7 shrink-0 place-items-center rounded-full ring-1",
                record ? "bg-running/15 text-running ring-running/30" : current ? "bg-primary text-primary-foreground ring-primary" : "bg-muted text-muted-foreground ring-border",
              )}
            >
              <Icon className="size-3.5" aria-hidden />
            </span>
            <div className="flex min-w-0 flex-1 items-baseline justify-between gap-2 pt-1 text-sm">
              <span className={cn("truncate", current && "font-medium", !record && !current && "text-muted-foreground")}>{step.label}</span>
              <span className="shrink-0 font-mono text-xs tabular text-muted-foreground">
                {actualMin !== null && (
                  <span className={cn(actualMin > step.plannedMin * 1.05 ? "text-held" : "text-foreground")}>{Math.round(actualMin)}′ / </span>
                )}
                {step.plannedMin}′
              </span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-medium tabular">{children}</dd>
    </div>
  )
}

function Detail({ machineId }: { machineId: string }) {
  const view = useMachineView(machineId)!
  const now = usePlant((state) => state.snapshot!.now)
  const events = usePlant((state) => state.snapshot!.events)
  const log = events.filter((event) => event.machineId === machineId).slice(-14).reverse()
  const { machine, batch, order, buyer, telemetry } = view
  const liquorL = batch?.recipe.find((step) => step.kind === "fill")?.target ?? machine.capacityKg * 8

  return (
    <div className="flex flex-col gap-4">
      <Reveal className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/control" aria-label="Back to control panel">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="mr-auto min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-sm text-muted-foreground">{machine.id}</span>
            <h2 className="text-2xl font-semibold tracking-tight">{machine.name}</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Bay {machine.bay} · {machine.type} · {formatInt(machine.capacityKg)} kg · {machine.link}
          </p>
        </div>
        <StatusBadge status={view.status} className="h-7 px-3 text-sm" />
      </Reveal>

      <Reveal order={1} className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Gauge label="Bath temperature" value={telemetry.temperatureC} max={135} unit="°C" digits={1} tone="text-chart-2" />
        <Gauge label="Liquor level" value={telemetry.levelL} max={liquorL} unit="L" />
        <Gauge label="Pressure" value={telemetry.pressureBar} max={4} unit="bar" digits={2} />
        <Gauge label="Circulation" value={telemetry.circulationPct} max={100} unit="%" />
        <Gauge label="Pump power" value={telemetry.powerKw} max={machine.capacityKg * 0.05} unit="kW" digits={1} />
      </Reveal>

      <div className="grid gap-4 xl:grid-cols-3">
        <Reveal order={2} className="xl:col-span-2">
          <TemperatureCard view={view} now={now} />
        </Reveal>
        <Reveal order={3}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Batch</CardTitle>
              <CardDescription>{batch ? `${batch.id} · ${buyer?.name}` : view.remark}</CardDescription>
            </CardHeader>
            {batch && order && (
              <CardContent>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <Fact label="Order">{order.id}</Fact>
                  <Fact label="Garment">{order.garment}</Fact>
                  <Fact label="Shade">
                    <ShadeSwatch hex={order.shade.hex} name={`${order.shade.name} (${order.shade.code})`} />
                  </Fact>
                  <Fact label="Weight · GSM">
                    {formatInt(batch.qtyKg)} kg · {order.gsm}
                  </Fact>
                  <Fact label="Start">{view.startedAt ? formatClock(view.startedAt) : "—"}</Fact>
                  <Fact label="Target unload">{view.targetEndAt ? formatClock(view.targetEndAt) : "—"}</Fact>
                  <Fact label="Projected">{view.projectedEndAt ? formatClock(view.projectedEndAt) : "—"}</Fact>
                  <Fact label="Excess">
                    <span className={cn(view.excessMin >= 15 ? "text-delayed" : view.excessMin > 0 ? "text-held" : "")}>
                      {view.excessMin > 0 ? `+${formatHm(view.excessMin)}` : "On standard"}
                    </span>
                  </Fact>
                  <Fact label="Running time">{formatHm(view.runningMin)}</Fact>
                  <Fact label="Corrections">{view.state.run?.corrections ?? 0}</Fact>
                </dl>
              </CardContent>
            )}
          </Card>
        </Reveal>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Reveal order={4}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recipe steps</CardTitle>
              <CardDescription>Actual ′ / planned ′ minutes</CardDescription>
            </CardHeader>
            <CardContent>
              {batch ? <RecipeTimeline view={view} /> : <p className="text-sm text-muted-foreground">No recipe loaded.</p>}
            </CardContent>
          </Card>
        </Reveal>
        <Reveal order={5}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Operator commands</CardTitle>
              <CardDescription>Logged with time and user</CardDescription>
            </CardHeader>
            <CardContent>
              <MachineCommands view={view} />
            </CardContent>
          </Card>
        </Reveal>
        <Reveal order={6}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Event log</CardTitle>
              <CardDescription>Latest machine and operator events</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80 pr-3">
                <ul className="flex flex-col gap-2.5 text-sm">
                  {log.map((event) => (
                    <li key={event.id} className="flex gap-3">
                      <span className="w-11 shrink-0 font-mono text-xs text-muted-foreground tabular">{formatClock(event.at)}</span>
                      <span className={cn(event.kind === "hold" ? "text-held" : event.kind === "command" || event.kind === "shade-check" ? "text-primary" : "")}>
                        {event.message}
                      </span>
                    </li>
                  ))}
                  {!log.length && <li className="text-muted-foreground">No events yet.</li>}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  )
}

export function MachineDetail({ machineId }: { machineId: string }) {
  return (
    <PlantGate>
      <Detail machineId={machineId} />
    </PlantGate>
  )
}
