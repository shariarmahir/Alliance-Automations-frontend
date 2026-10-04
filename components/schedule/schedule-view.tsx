"use client"

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { ChevronLeft, ChevronRight, PackageCheck, Wrench } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { PlantGate } from "@/components/plant/plant-gate"
import { STATUS_META } from "@/components/plant/status"
import { Reveal } from "@/components/reveal"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { BAYS, MACHINES, buyerById, plannedMinutes } from "@/lib/domain/catalog"
import { MINUTE } from "@/lib/domain/rules"
import type { MachineView, Order, PlantSnapshot } from "@/lib/domain/types"
import { formatClock, formatInt } from "@/lib/format"
import { usePlant } from "@/lib/store/plant"
import { cn } from "@/lib/utils"

const HOUR = 60 * MINUTE
const WINDOW_BACK = 8 * HOUR
const WINDOW_AHEAD = 10 * HOUR
const CHANGEOVER_MIN = 15

interface Segment {
  key: string
  start: number
  end: number
  label: string
  detail: string
  kind: "done" | "live" | "planned"
  className: string
}

function segmentsFor(view: MachineView, snapshot: PlantSnapshot): Segment[] {
  const id = view.machine.id
  const segments: Segment[] = snapshot.completed
    .filter((c) => c.machineId === id)
    .map((c) => ({
      key: c.batchId,
      start: c.startedAt,
      end: c.endedAt,
      label: c.batchId,
      detail: `${formatInt(c.qtyKg)} kg · ${formatClock(c.startedAt)}–${formatClock(c.endedAt)}`,
      kind: "done",
      className: "bg-muted-foreground/25",
    }))

  const run = view.state.run
  let freeAt = snapshot.now
  if (run && view.batch) {
    const end = view.projectedEndAt ?? run.targetEndAt
    segments.push({
      key: run.batchId,
      start: run.startedAt,
      end: Math.max(end, snapshot.now),
      label: `${run.batchId} · ${view.buyer?.name ?? ""}`,
      detail: `Target ${formatClock(run.targetEndAt)} · projected ${formatClock(end)}`,
      kind: "live",
      className: STATUS_META[view.status].solid,
    })
    freeAt = Math.max(end, snapshot.now) + CHANGEOVER_MIN * MINUTE
  }

  const next = view.state.next
  if (next) {
    const batch = snapshot.batches[next.batchId]
    segments.push({
      key: next.batchId,
      start: freeAt,
      end: freeAt + plannedMinutes(batch.recipe) * MINUTE,
      label: `${next.batchId} · next`,
      detail: `${formatInt(batch.qtyKg)} kg · prep ${next.prep}`,
      kind: "planned",
      className: "",
    })
  }
  return segments
}

function Timeline() {
  const snapshot = usePlant((state) => state.snapshot)!
  const views = usePlant((state) => state.views)
  const [bay, setBay] = useState("1")
  const from = snapshot.now - WINDOW_BACK
  const span = WINDOW_BACK + WINDOW_AHEAD
  const position = (time: number) => Math.min(100, Math.max(0, ((time - from) / span) * 100))
  const hours = Array.from({ length: span / HOUR + 1 }, (_, i) => Math.ceil(from / HOUR) * HOUR + i * HOUR).filter((h) => h <= from + span)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Machine timeline</CardTitle>
        <CardDescription>Finished, running and next batch per machine. The vertical line is now.</CardDescription>
        <CardAction>
          <Select value={bay} onValueChange={setBay}>
            <SelectTrigger size="sm" className="w-40" aria-label="Bay">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BAYS.map((option) => (
                <SelectItem key={option.bay} value={String(option.bay)}>
                  {option.label} · D{option.range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-[860px]">
          <div className="flex gap-3">
            <span className="w-28 shrink-0" />
            <div className="relative h-6 flex-1 text-[11px] text-muted-foreground">
              {hours.map((hour) => (
                <span key={hour} className="absolute -translate-x-1/2 font-mono tabular" style={{ left: `${position(hour)}%` }}>
                  {formatClock(hour)}
                </span>
              ))}
            </div>
          </div>
          <div className="relative flex flex-col gap-1.5">
            {views
              .filter((view) => view.machine.bay === Number(bay))
              .map((view) => (
                <div key={view.machine.id} className="flex items-center gap-3">
                  <Link href={`/control/${view.machine.id}`} className="w-28 shrink-0 truncate text-xs hover:underline">
                    <span className="font-mono text-muted-foreground">{view.machine.id}</span> {view.machine.name}
                  </Link>
                  <div className={cn("relative h-8 flex-1 rounded-md bg-muted/40", view.status === "offline" && "bg-hatch")}>
                    {hours.map((hour) => (
                      <span key={hour} className="absolute inset-y-0 w-px bg-border" style={{ left: `${position(hour)}%` }} />
                    ))}
                    {segmentsFor(view, snapshot)
                      .filter((segment) => segment.end > from && segment.start < from + span)
                      .map((segment) => (
                        <Tooltip key={segment.key}>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "absolute inset-y-1 flex items-center overflow-hidden rounded-[5px] px-1.5 text-[10px] font-medium whitespace-nowrap",
                                segment.kind === "planned" ? "border border-dashed border-primary/60 text-primary" : segment.className,
                                segment.kind === "live" && "text-background",
                              )}
                              style={{ left: `${position(segment.start)}%`, width: `calc(${position(segment.end) - position(segment.start)}% - 2px)` }}
                            >
                              {segment.label}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="text-xs">
                            <p className="font-medium">{segment.label}</p>
                            <p className="opacity-80">{segment.detail}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                  </div>
                </div>
              ))}
            <span className="pointer-events-none absolute inset-y-0 w-0.5 rounded bg-primary" style={{ left: `calc(7rem + 0.75rem + (100% - 7.75rem) * ${position(snapshot.now) / 100})` }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface CalendarItem {
  id: string
  kind: "delivery" | "maintenance"
  title: string
  detail: string
}

/** Preventive maintenance repeats every 28 days per machine, staggered so two machines are serviced per day at most. */
function maintenanceOn(day: Date): CalendarItem[] {
  const dayIndex = Math.floor(day.getTime() / 86_400_000)
  return MACHINES.filter((_, i) => (dayIndex + i * 11) % 28 === 0).map((machine) => ({
    id: `pm-${machine.id}-${dayIndex}`,
    kind: "maintenance",
    title: `${machine.id} ${machine.name}`,
    detail: "Preventive maintenance · pump seals, heat exchanger",
  }))
}

function deliveriesOn(day: Date, orders: Order[]): CalendarItem[] {
  return orders
    .filter((order) => isSameDay(order.dueAt, day))
    .map((order) => ({
      id: order.id,
      kind: "delivery",
      title: `${order.id} · ${buyerById.get(order.buyerId)?.name}`,
      detail: `${order.garment} · ${formatInt(order.qtyKg)} kg · ${order.shade.name}`,
    }))
}

function MonthCalendar() {
  const now = usePlant((state) => state.snapshot!.now)
  const orders = usePlant((state) => state.snapshot!.orders)
  const [month, setMonth] = useState(() => startOfMonth(now))
  const [selected, setSelected] = useState(() => new Date(now))
  const days = eachDayOfInterval({ start: startOfWeek(month, { weekStartsOn: 6 }), end: endOfWeek(endOfMonth(month), { weekStartsOn: 6 }) })
  const itemsFor = (day: Date) => [...deliveriesOn(day, orders), ...maintenanceOn(day)]
  const agenda = itemsFor(selected)

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
      <Card>
        <CardHeader>
          <CardTitle>{format(month, "MMMM yyyy")}</CardTitle>
          <CardDescription>Buyer deliveries and preventive maintenance. Weeks start Saturday.</CardDescription>
          <CardAction className="flex gap-1">
            <Button variant="outline" size="icon-sm" onClick={() => setMonth((m) => addMonths(m, -1))} aria-label="Previous month">
              <ChevronLeft />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setMonth(startOfMonth(now))}>
              Today
            </Button>
            <Button variant="outline" size="icon-sm" onClick={() => setMonth((m) => addMonths(m, 1))} aria-label="Next month">
              <ChevronRight />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg bg-border ring-1 ring-border">
            {days.slice(0, 7).map((day) => (
              <div key={day.toISOString()} className="bg-muted/60 py-2 text-center text-xs font-medium text-muted-foreground">
                {format(day, "EEE")}
              </div>
            ))}
            {days.map((day) => {
              const items = itemsFor(day)
              const deliveries = items.filter((i) => i.kind === "delivery").length
              const services = items.length - deliveries
              const isSelected = isSameDay(day, selected)
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => setSelected(day)}
                  className={cn(
                    "flex min-h-24 flex-col gap-1 bg-card p-2 text-left transition-colors hover:bg-accent focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-ring",
                    !isSameMonth(day, month) && "text-muted-foreground/50",
                    isSelected && "bg-accent",
                  )}
                  aria-pressed={isSelected}
                >
                  <span className={cn("grid size-6 place-items-center rounded-full text-xs tabular", isSameDay(day, now) && "bg-primary font-semibold text-primary-foreground")}>
                    {format(day, "d")}
                  </span>
                  {deliveries > 0 && (
                    <span className="truncate rounded bg-chart-1/15 px-1.5 py-0.5 text-[11px] font-medium text-chart-1">
                      {deliveries} deliver{deliveries > 1 ? "ies" : "y"}
                    </span>
                  )}
                  {services > 0 && (
                    <span className="truncate rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">{services} service</span>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{format(selected, "EEEE, d MMMM")}</CardTitle>
          <CardDescription>{agenda.length ? `${agenda.length} scheduled items` : "Nothing scheduled"}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {agenda.map((item) => {
            const Icon = item.kind === "delivery" ? PackageCheck : Wrench
            return (
              <div key={item.id} className="flex gap-3">
                <span className={cn("grid size-8 shrink-0 place-items-center rounded-md", item.kind === "delivery" ? "bg-chart-1/15 text-chart-1" : "bg-muted text-muted-foreground")}>
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 text-sm">
                  <p className="truncate font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

export function ScheduleView() {
  return (
    <PlantGate>
      <Reveal>
        <Tabs defaultValue="timeline">
          <TabsList>
            <TabsTrigger value="timeline">Machine timeline</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
          <TabsContent value="timeline" className="mt-3">
            <Timeline />
          </TabsContent>
          <TabsContent value="calendar" className="mt-3">
            <MonthCalendar />
          </TabsContent>
        </Tabs>
      </Reveal>
    </PlantGate>
  )
}
