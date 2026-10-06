"use client"

import { BellRing } from "lucide-react"
import { alertTitle } from "@/components/plant/alert-list"
import { excessTone } from "@/components/plant/excess"
import { formatHm } from "@/lib/format"
import { usePlant } from "@/lib/store/plant"
import { cn } from "@/lib/utils"

export function AlertTicker() {
  const alerts = usePlant((state) => state.alerts)
  const renderItems = (copy: string) =>
    alerts.length ? (
      alerts.map((alert) => (
        <span key={`${alert.id}${copy}`} className="inline-flex items-center gap-3 px-6">
          <span className={cn("font-mono font-semibold", alert.severity === "critical" ? "text-delayed" : "text-held")}>{alert.machineId}</span>
          <span>{alert.batchId}</span>
          <span className={cn("font-mono", excessTone(alert.excessMin) ?? "text-held")}>+{formatHm(alert.excessMin)}</span>
          <span className="text-muted-foreground">{alertTitle(alert)}</span>
          <span className="text-border">|</span>
        </span>
      ))
    ) : (
      <span className="px-6 text-running">All machines within standard</span>
    )

  return (
    <footer className="mx-8 mt-4 mb-5 flex items-center overflow-hidden rounded-xl bg-card ring-1 ring-delayed/40">
      <div className="z-10 flex shrink-0 items-center gap-2 bg-delayed px-5 py-3 font-semibold text-white">
        <BellRing className="size-5" aria-hidden />
        Alerts ({alerts.length})
      </div>
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="flex w-max animate-marquee text-lg whitespace-nowrap" style={{ ["--marquee-duration" as string]: `${Math.max(20, alerts.length * 7)}s` }}>
          <span className="inline-flex">{renderItems("")}</span>
          <span className="inline-flex" aria-hidden>
            {renderItems("-copy")}
          </span>
        </div>
      </div>
    </footer>
  )
}
