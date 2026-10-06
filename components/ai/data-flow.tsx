"use client"

import { Card, CardContent } from "@/components/ui/card"

const PIPELINE = [
  { label: "Signals", detail: "PLC, sensors, operator tablets" },
  { label: "Plant data", detail: "Batches, steps, holds, ΔE" },
  { label: "Agents", detail: "Rules, models, solver, LLM" },
  { label: "Actions", detail: "Alerts, plans, answers" },
  { label: "People", detail: "Approve before anything changes" },
]

export function DataFlow() {
  return (
    <Card size="sm">
      <CardContent>
        <ol className="grid gap-3 sm:grid-cols-5">
          {PIPELINE.map((step, index) => (
            <li key={step.label} className="relative flex flex-col gap-0.5 rounded-lg bg-muted/40 p-3">
              <span className="font-mono text-[11px] text-primary">0{index + 1}</span>
              <span className="text-sm font-medium">{step.label}</span>
              <span className="text-xs text-muted-foreground">{step.detail}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
