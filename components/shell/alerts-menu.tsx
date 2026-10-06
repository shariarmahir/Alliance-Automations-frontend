"use client"

import { Bell, Check } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { REASONS } from "@/lib/domain/catalog"
import { formatHm } from "@/lib/format"
import { usePlant } from "@/lib/store/plant"
import { cn } from "@/lib/utils"

export function AlertsMenu() {
  const alerts = usePlant((state) => state.alerts)
  const acknowledge = usePlant((state) => state.acknowledge)
  const open = alerts.filter((alert) => !alert.acknowledged).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`${open} open alerts`}>
          <Bell />
          {open > 0 && (
            <span className="absolute -top-0.5 -right-0.5 grid min-w-4 place-items-center rounded-full bg-delayed px-1 text-[10px] font-semibold text-white tabular">
              {open}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-sm font-medium">Alerts</p>
          <span className="text-xs text-muted-foreground">{open} open</span>
        </div>
        <Separator />
        <ScrollArea className="max-h-96">
          {alerts.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">All machines on standard.</p>}
          {alerts.map((alert) => (
            <div key={alert.id} className={cn("flex items-start gap-3 px-4 py-3", alert.acknowledged && "opacity-55")}>
              <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", alert.severity === "critical" ? "bg-delayed" : "bg-held")} />
              <div className="min-w-0 flex-1 text-sm">
                <Link href={`/control/${alert.machineId}`} className="font-medium hover:underline">
                  {alert.machineId} · {alert.cause === "overrun" ? "Cycle overrun" : REASONS[alert.cause].label}
                </Link>
                <p className="text-xs text-muted-foreground tabular">
                  {alert.batchId} · projected +{formatHm(alert.excessMin)} ·{" "}
                  {alert.severity === "critical" ? "Manager" : "Supervisor"}
                </p>
              </div>
              {!alert.acknowledged && (
                <Button size="xs" variant="outline" onClick={() => acknowledge(alert.id)}>
                  <Check />
                  Ack
                </Button>
              )}
            </div>
          ))}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
