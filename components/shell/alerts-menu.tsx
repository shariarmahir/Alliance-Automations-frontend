"use client"

import { BellOff, Check, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { alertTitle } from "@/components/plant/alert-list"
import { Bell } from "@/components/plant/icons/console-icons"
import { acknowledgeAll } from "@/components/plant/operator-actions"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { machineById } from "@/lib/domain/catalog"
import type { Alert } from "@/lib/domain/types"
import { formatHm } from "@/lib/format"
import { usePlant, usePlantDerived } from "@/lib/store/plant"
import { cn } from "@/lib/utils"

type Filter = "open" | "critical" | "all"

const FILTERS: { value: Filter; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "critical", label: "Critical" },
  { value: "all", label: "All" },
]

const matches = (alert: Alert, filter: Filter) =>
  filter === "all" || (filter === "open" ? !alert.acknowledged : alert.severity === "critical" && !alert.acknowledged)

function AlertRow({ alert, onNavigate }: { alert: Alert; onNavigate: () => void }) {
  const acknowledge = usePlant((state) => state.acknowledge)
  const critical = alert.severity === "critical"

  return (
    <li className={cn("flex items-start gap-3 px-4 py-3", alert.acknowledged && "opacity-55")}>
      <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", critical ? "bg-delayed" : "bg-held")} aria-label={critical ? "Critical" : "Warning"} role="img" />
      <div className="min-w-0 flex-1 text-sm">
        <Link href={`/control/${alert.machineId}`} onClick={onNavigate} className="block truncate font-medium hover:underline">
          <span className="font-mono text-xs text-muted-foreground">{alert.machineId}</span> {alertTitle(alert)}
          <span className="font-normal text-muted-foreground"> · {machineById.get(alert.machineId)?.name}</span>
        </Link>
        <p className="truncate text-xs text-muted-foreground tabular">
          {alert.batchId} · +{formatHm(alert.excessMin)} projected · {critical ? "Manager" : "Supervisor"}
        </p>
      </div>
      {alert.acknowledged ? (
        <span className="mt-0.5 shrink-0 text-xs text-muted-foreground">Done</span>
      ) : (
        <Button size="xs" variant="outline" onClick={() => acknowledge(alert.id)} className="shrink-0">
          <Check />
          Ack
        </Button>
      )}
    </li>
  )
}

export function AlertsMenu() {
  const alerts = usePlantDerived((state) => state.alerts)
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<Filter>("open")
  const openCount = alerts.filter((alert) => !alert.acknowledged).length
  const criticalCount = alerts.filter((alert) => !alert.acknowledged && alert.severity === "critical").length
  const shown = alerts.filter((alert) => matches(alert, filter))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`${openCount} open alerts`}>
          <Bell className="size-6" />
          {openCount > 0 && (
            <span
              className={cn(
                "absolute -top-0.5 -right-0.5 grid min-w-4 place-items-center rounded-full px-1 text-[10px] font-semibold text-white tabular",
                criticalCount ? "bg-delayed" : "bg-held",
              )}
            >
              {openCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" collisionPadding={12} className="w-[min(26rem,calc(100vw-1.5rem))] gap-0 p-0">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-sm font-medium">Alerts</p>
            <p className="text-xs text-muted-foreground tabular">
              {openCount} open{criticalCount > 0 && <span className="text-delayed"> · {criticalCount} critical</span>}
            </p>
          </div>
          <Button size="xs" variant="outline" disabled={!openCount} onClick={acknowledgeAll}>
            <BellOff />
            Ack all
          </Button>
        </div>
        <div className="px-4 pb-3">
          <ToggleGroup type="single" size="sm" variant="outline" value={filter} onValueChange={(value) => value && setFilter(value as Filter)} className="w-full" aria-label="Filter alerts">
            {FILTERS.map(({ value, label }) => (
              <ToggleGroupItem key={value} value={value} className="flex-1 text-xs">
                {label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <Separator />
        <ul className="max-h-[min(24rem,60dvh)] divide-y overflow-y-auto overscroll-contain">
          {shown.map((alert) => (
            <AlertRow key={alert.id} alert={alert} onNavigate={() => setOpen(false)} />
          ))}
        </ul>
        {!shown.length && (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-sm text-muted-foreground">
            <ShieldCheck className="size-6 text-running" aria-hidden />
            {filter === "all" ? "No alerts. Every machine is on standard." : "Nothing here. All machines are within standard."}
          </div>
        )}
        <Separator />
        <Button variant="ghost" asChild className="h-10 rounded-t-none rounded-b-lg text-xs text-muted-foreground">
          <Link href="/dashboard" onClick={() => setOpen(false)}>
            Open the overview
          </Link>
        </Button>
      </PopoverContent>
    </Popover>
  )
}
