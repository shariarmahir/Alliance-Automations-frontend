"use client"

import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns"
import { ChevronLeft, ChevronRight, PackageCheck, Wrench } from "lucide-react"
import { useState } from "react"
import { maintenanceOn, deliveriesOn } from "@/components/schedule/calendar-items"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSnapshot } from "@/lib/store/plant"
import { cn } from "@/lib/utils"

export function MonthCalendar() {
  const now = useSnapshot((snapshot) => snapshot.now)
  const orders = useSnapshot((snapshot) => snapshot.orders)
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
