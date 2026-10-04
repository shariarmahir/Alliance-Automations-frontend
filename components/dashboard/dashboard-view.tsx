"use client"

import { Boxes, CircleCheckBig, CirclePause, Gauge, Play, Siren } from "lucide-react"
import Link from "next/link"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { AlertList } from "@/components/plant/alert-list"
import { FleetMap } from "@/components/plant/fleet-map"
import { PlantGate } from "@/components/plant/plant-gate"
import { Reveal } from "@/components/reveal"
import { Delta, StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress"
import { bayLoad, deliveryRisk, hourlyOutput } from "@/lib/domain/analytics"
import { buyerById } from "@/lib/domain/catalog"
import { formatClock, formatInt, formatKg, formatShortDate } from "@/lib/format"
import { GO_LIVE_DAYS_AGO, HISTORY_DAYS, average } from "@/lib/sim/history"
import { usePlant } from "@/lib/store/plant"
import { cn } from "@/lib/utils"

const outputConfig = { kg: { label: "Output", color: "var(--chart-1)" } } satisfies ChartConfig

function KpiRow() {
  const kpis = usePlant((state) => state.kpis)!
  const processing = kpis.running + kpis.delayed + kpis.held

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      <StatCard label="Processing" value={processing} icon={Play} tone="text-running" hint={`of ${kpis.total} machines`} />
      <StatCard label="Delayed" value={kpis.delayed} icon={Siren} tone="text-delayed" hint="≥ 15 min over target" />
      <StatCard label="On hold" value={kpis.held} icon={CirclePause} tone="text-held" hint={`${kpis.ready} ready · ${kpis.idle} idle`} />
      <StatCard label="Produced today" value={kpis.producedKg} suffix=" kg" icon={Boxes} hint="Since 06:00 shift start" />
      <StatCard label="Batches completed" value={kpis.batchesCompleted} icon={CircleCheckBig} tone="text-complete" hint={`${kpis.batchesPrepared} next batches ready`} />
      <StatCard
        label="Utilization"
        value={kpis.utilization}
        format={{ style: "percent", maximumFractionDigits: 1 }}
        icon={Gauge}
        hint={`RFT ${(kpis.rightFirstTime * 100).toFixed(1)}%`}
      />
    </div>
  )
}

function OutputChart() {
  const completed = usePlant((state) => state.snapshot!.completed)
  const now = usePlant((state) => state.snapshot!.now)
  const data = hourlyOutput(completed, now)
  const total = data.reduce((sum, row) => sum + row.kg, 0)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Output, last 24 hours</CardTitle>
        <CardDescription>Kilograms unloaded per hour across all bays</CardDescription>
        <CardAction className="text-right">
          <div className="text-xl font-semibold tabular">{formatInt(total)} kg</div>
          <div className="text-xs text-muted-foreground">{data.reduce((s, r) => s + r.batches, 0)} batches</div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={outputConfig} className="aspect-auto h-64 w-full">
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
                    return hour ? `${formatClock(hour)} – ${formatClock(hour + 3_600_000)}` : ""
                  }}
                  formatter={(value) => `${formatInt(Number(value))} kg`}
                />
              }
            />
            <Bar dataKey="kg" fill="var(--color-kg)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function BayLoad() {
  const views = usePlant((state) => state.views)
  const bays = bayLoad(views)
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Bay load</CardTitle>
        <CardDescription>Machines processing and kilograms in the bath</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {bays.map((bay) => (
          <div key={bay.bay} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium">
                {bay.label} <span className="text-xs font-normal text-muted-foreground">D{bay.range}</span>
              </span>
              <span className="text-xs text-muted-foreground tabular">
                {bay.processing}/{bay.available} · {formatKg(bay.kgInProcess)}
                {bay.alerts > 0 && <span className="ml-2 text-delayed">{bay.alerts} alert{bay.alerts > 1 && "s"}</span>}
              </span>
            </div>
            <Progress value={(bay.kgInProcess / bay.capacityKg) * 100} aria-label={`${bay.label} load`} />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function DeliveryRisk() {
  const orders = usePlant((state) => state.snapshot!.orders)
  const views = usePlant((state) => state.views)
  const now = usePlant((state) => state.snapshot!.now)
  const dailyKg = usePlant((state) => state.history.at(-1)?.producedKg ?? 60_000)
  const risks = deliveryRisk(orders, views, now, dailyKg).slice(0, 6)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Delivery risk</CardTitle>
        <CardDescription>Open orders ranked by slack between dyeing ETA and delivery</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" asChild>
            <Link href="/crm">All orders</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 gap-y-2.5 text-sm">
          <span className="text-xs text-muted-foreground">Order</span>
          <span className="text-right text-xs text-muted-foreground">Remaining</span>
          <span className="text-right text-xs text-muted-foreground">Due</span>
          <span className="text-right text-xs text-muted-foreground">Slack</span>
          {risks.map(({ order, remainingKg, slackHours }) => (
            <div key={order.id} className="contents">
              <span className="min-w-0 truncate">
                <span className="font-medium">{order.id}</span>{" "}
                <span className="text-muted-foreground">
                  {buyerById.get(order.buyerId)?.name} · {order.garment}
                </span>
              </span>
              <span className="text-right tabular">{formatInt(remainingKg)} kg</span>
              <span className="text-right tabular text-muted-foreground">{formatShortDate(order.dueAt)}</span>
              <span
                className={cn(
                  "text-right font-medium tabular",
                  slackHours < 0 ? "text-delayed" : slackHours < 24 ? "text-held" : "text-running",
                )}
              >
                {slackHours < 0 ? "−" : "+"}
                {Math.abs(slackHours / 24).toFixed(1)} d
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function UtilityIntensity() {
  const kpis = usePlant((state) => state.kpis)!
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

function Fleet() {
  const views = usePlant((state) => state.views)
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Fleet map</CardTitle>
        <CardDescription>Every machine by bay. The bar under each cell is cycle progress.</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" asChild>
            <Link href="/control">Control panel</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <FleetMap views={views} />
      </CardContent>
    </Card>
  )
}

function Alerts() {
  const alerts = usePlant((state) => state.alerts)
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Live alerts</CardTitle>
        <CardDescription>Delays escalate to the manager after 60 minutes</CardDescription>
        <CardAction className="text-sm font-medium text-delayed tabular">
          {alerts.filter((a) => !a.acknowledged).length} open
        </CardAction>
      </CardHeader>
      <CardContent>
        <AlertList alerts={alerts} limit={6} />
      </CardContent>
    </Card>
  )
}

export function DashboardView() {
  return (
    <PlantGate>
      <div className="flex flex-col gap-4">
        <Reveal>
          <KpiRow />
        </Reveal>
        <div className="grid gap-4 xl:grid-cols-5">
          <Reveal order={1} className="xl:col-span-3">
            <Fleet />
          </Reveal>
          <Reveal order={2} className="xl:col-span-2">
            <Alerts />
          </Reveal>
        </div>
        <div className="grid gap-4 xl:grid-cols-5">
          <Reveal order={3} className="xl:col-span-3">
            <OutputChart />
          </Reveal>
          <Reveal order={4} className="xl:col-span-2">
            <BayLoad />
          </Reveal>
        </div>
        <div className="grid gap-4 xl:grid-cols-5">
          <Reveal order={5} className="xl:col-span-3">
            <DeliveryRisk />
          </Reveal>
          <Reveal order={6} className="xl:col-span-2">
            <UtilityIntensity />
          </Reveal>
        </div>
      </div>
    </PlantGate>
  )
}
