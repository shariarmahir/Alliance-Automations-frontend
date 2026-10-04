"use client"

import { Activity, Gauge, ShieldCheck, Timer } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts"
import { PlantGate } from "@/components/plant/plant-gate"
import { Reveal } from "@/components/reveal"
import { Delta, StatCard } from "@/components/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { MACHINES, REASONS } from "@/lib/domain/catalog"
import { formatInt, formatShortDate } from "@/lib/format"
import { GO_LIVE_DAYS_AGO, HISTORY_DAYS, average, type DailyMetric, type LossReason } from "@/lib/sim/history"
import { usePlant } from "@/lib/store/plant"

const oeeConfig = { oee: { label: "OEE", color: "var(--chart-1)" } } satisfies ChartConfig
const lossConfig = { minutes: { label: "Lost machine-minutes / day", color: "var(--chart-2)" } } satisfies ChartConfig

const pct = (value: number) => `${(value * 100).toFixed(1)}%`

function split(history: DailyMetric[]) {
  const baseline = history.slice(0, HISTORY_DAYS - GO_LIVE_DAYS_AGO)
  const recent = history.slice(-7)
  return { baseline, recent }
}

function OeeTiles({ history }: { history: DailyMetric[] }) {
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

function OeeTrend({ history }: { history: DailyMetric[] }) {
  const goLive = history[HISTORY_DAYS - GO_LIVE_DAYS_AGO]?.date
  const baseline = average(split(history).baseline, (d) => d.oee)
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>OEE trend</CardTitle>
        <CardDescription>Availability × performance × quality, daily. Monitoring went live {GO_LIVE_DAYS_AGO} days ago.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={oeeConfig} className="aspect-auto h-72 w-full">
          <LineChart data={history} margin={{ left: 0, right: 16, top: 16 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} tickFormatter={formatShortDate} />
            <YAxis tickLine={false} axisLine={false} width={44} domain={[0.45, 0.75]} tickFormatter={(v: number) => `${Math.round(v * 100)}%`} />
            <ChartTooltip
              content={<ChartTooltipContent labelFormatter={(_, p) => formatShortDate(Number(p?.[0]?.payload?.date))} formatter={(v) => `OEE ${pct(Number(v))}`} />}
            />
            <ReferenceLine y={baseline} stroke="var(--muted-foreground)" strokeOpacity={0.6} label={{ value: "Baseline", position: "insideBottomLeft", fill: "var(--muted-foreground)", fontSize: 11 }} />
            <ReferenceLine x={goLive} stroke="var(--primary)" label={{ value: "Pilot go-live", position: "insideTopRight", fill: "var(--primary)", fontSize: 11 }} />
            <Line dataKey="oee" stroke="var(--color-oee)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function lossRows(history: DailyMetric[]) {
  const { baseline, recent } = split(history)
  return (Object.keys(REASONS) as LossReason[])
    .filter((reason) => reason in recent[0].losses)
    .map((reason) => ({
      reason,
      label: REASONS[reason].label,
      minutes: Math.round(average(recent, (d) => d.losses[reason])),
      baseline: Math.round(average(baseline, (d) => d.losses[reason])),
    }))
    .sort((a, b) => b.minutes - a.minutes)
}

function LossPareto({ history }: { history: DailyMetric[] }) {
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

const UTILITIES = [
  { key: "energyKwhPerKg", label: "Energy", unit: "kWh/kg", digits: 2 },
  { key: "steamKgPerKg", label: "Steam", unit: "kg/kg", digits: 2 },
  { key: "waterLPerKg", label: "Water", unit: "L/kg", digits: 1 },
] as const

function UtilityMultiples({ history }: { history: DailyMetric[] }) {
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

/** Each lever: the loss it attacks, the reduction we target, and the output it frees at current run rate. */
const LEVERS: { reason: LossReason; target: number; action: string }[] = [
  { reason: "waiting-batch", target: 0.6, action: "Prepare the next batch when the running one passes 50% of its cycle" },
  { reason: "shade-correction", target: 0.35, action: "Lab-to-bulk recipe correction from spectrophotometer history" },
  { reason: "changeover", target: 0.3, action: "Sequence light to dark shades per machine to skip cleaning cycles" },
  { reason: "steam-pressure", target: 0.5, action: "Alert utilities on header pressure drop before heating steps start" },
]

function Levers({ history }: { history: DailyMetric[] }) {
  const rows = lossRows(history)
  const dailyKg = average(history.slice(-7), (d) => d.producedKg)
  const kgPerMachineMinute = dailyKg / (MACHINES.length * 24 * 60)
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Improvement levers</CardTitle>
        <CardDescription>Output recovered at today&apos;s run rate of {formatInt(kgPerMachineMinute * 60)} kg per machine-hour</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col divide-y">
        {LEVERS.map((lever) => {
          const minutes = rows.find((row) => row.reason === lever.reason)?.minutes ?? 0
          const recoveredKg = minutes * lever.target * kgPerMachineMinute
          return (
            <div key={lever.reason} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="text-sm font-medium">{REASONS[lever.reason].label}</p>
                <p className="text-xs text-muted-foreground text-pretty">{lever.action}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-running tabular">+{formatInt(recoveredKg)} kg/day</p>
                <p className="text-xs text-muted-foreground tabular">
                  −{Math.round(lever.target * 100)}% of {formatInt(minutes)} min
                </p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function Efficiency() {
  const history = usePlant((state) => state.history)
  return (
    <div className="flex flex-col gap-4">
      <Reveal>
        <OeeTiles history={history} />
      </Reveal>
      <div className="grid gap-4 xl:grid-cols-2">
        <Reveal order={1}>
          <OeeTrend history={history} />
        </Reveal>
        <Reveal order={2}>
          <LossPareto history={history} />
        </Reveal>
      </div>
      <Reveal order={3}>
        <UtilityMultiples history={history} />
      </Reveal>
      <Reveal order={4}>
        <Levers history={history} />
      </Reveal>
    </div>
  )
}

export function EfficiencyView() {
  return (
    <PlantGate>
      <Efficiency />
    </PlantGate>
  )
}
