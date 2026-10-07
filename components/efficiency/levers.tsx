"use client"

import { lossRows } from "@/components/efficiency/metrics"
import { Panel } from "@/components/panel"
import { PanelTitle } from "@/components/panel-title"
import { ActionQueue } from "@/components/plant/icons/console-icons"
import { CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { MACHINES, REASONS } from "@/lib/domain/catalog"
import { formatInt } from "@/lib/format"
import { average, type DailyMetric, type LossReason } from "@/lib/sim/history"

/** Each lever: the loss it attacks, the reduction we target, and the output it frees at current run rate. */
const LEVERS: { reason: LossReason; target: number; action: string }[] = [
  { reason: "waiting-batch", target: 0.6, action: "Prepare the next batch when the running one passes 50% of its cycle" },
  { reason: "shade-correction", target: 0.35, action: "Lab-to-bulk recipe correction from spectrophotometer history" },
  { reason: "changeover", target: 0.3, action: "Sequence light to dark shades per machine to skip cleaning cycles" },
  { reason: "steam-pressure", target: 0.5, action: "Alert utilities on header pressure drop before heating steps start" },
]

export function Levers({ history }: { history: DailyMetric[] }) {
  const rows = lossRows(history)
  const dailyKg = average(history.slice(-7), (d) => d.producedKg)
  const kgPerMachineMinute = dailyKg / (MACHINES.length * 24 * 60)
  return (
    <Panel className="h-full">
      <CardHeader>
        <PanelTitle icon={ActionQueue}>Improvement levers</PanelTitle>
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
    </Panel>
  )
}
