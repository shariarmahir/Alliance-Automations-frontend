"use client"

import { AnimatePresence, motion } from "motion/react"
import { Check, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { REASONS, machineById } from "@/lib/domain/catalog"
import type { Alert } from "@/lib/domain/types"
import { formatHm } from "@/lib/format"
import { usePlant } from "@/lib/store/plant"
import { cn } from "@/lib/utils"

export const alertTitle = (alert: Alert) => (alert.cause === "overrun" ? "Cycle overrun" : REASONS[alert.cause].label)

export function AlertList({ alerts, limit }: { alerts: Alert[]; limit?: number }) {
  const acknowledge = usePlant((state) => state.acknowledge)
  const shown = limit ? alerts.slice(0, limit) : alerts

  if (!alerts.length) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
        <ShieldCheck className="size-6 text-running" aria-hidden />
        Every machine is within standard.
      </div>
    )
  }

  return (
    <ul className="flex flex-col divide-y">
      <AnimatePresence initial={false}>
        {shown.map((alert) => (
          <motion.li
            key={alert.id}
            layout
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: alert.acknowledged ? 0.5 : 1, x: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 py-2.5"
          >
            <span
              className={cn(
                "grid h-9 w-11 shrink-0 place-items-center rounded-md font-mono text-xs font-semibold",
                alert.severity === "critical" ? "bg-delayed/15 text-delayed" : "bg-held/15 text-held",
              )}
            >
              {alert.machineId}
            </span>
            <div className="min-w-0 flex-1">
              <Link href={`/control/${alert.machineId}`} className="block truncate text-sm font-medium hover:underline">
                {alertTitle(alert)}
                <span className="font-normal text-muted-foreground"> · {machineById.get(alert.machineId)?.name}</span>
              </Link>
              <p className="truncate text-xs text-muted-foreground tabular">
                {alert.batchId} · +{formatHm(alert.excessMin)} projected ·{" "}
                {alert.severity === "critical" ? "Escalated to manager" : "Supervisor notified"}
              </p>
            </div>
            {alert.acknowledged ? (
              <span className="text-xs text-muted-foreground">Acknowledged</span>
            ) : (
              <Button size="sm" variant="outline" onClick={() => acknowledge(alert.id)}>
                <Check />
                Ack
              </Button>
            )}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}
