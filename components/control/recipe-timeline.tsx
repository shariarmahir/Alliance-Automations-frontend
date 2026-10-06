"use client"

import { Check } from "lucide-react"
import { STEP_ICON } from "@/components/plant/step-readout"
import type { MachineView } from "@/lib/domain/types"
import { MINUTE } from "@/lib/time"
import { cn } from "@/lib/utils"

export function RecipeTimeline({ view }: { view: MachineView }) {
  const run = view.state.run
  if (!view.batch || !run) return null
  const done = new Map(run.steps.map((record) => [record.index, record]))

  return (
    <ol className="relative flex flex-col">
      {view.batch.recipe.map((step, index) => {
        const record = done.get(index)
        const current = view.state.phase === "running" && run.stepIndex === index
        const Icon = record ? Check : STEP_ICON[step.kind]
        const actualMin = record ? (record.endedAt - record.startedAt) / MINUTE : null
        return (
          <li key={index} className="relative flex gap-3 pb-3 last:pb-0">
            {index < view.batch!.recipe.length - 1 && <span className="absolute top-7 bottom-0 left-3.5 w-px bg-border" aria-hidden />}
            <span
              className={cn(
                "relative z-10 grid size-7 shrink-0 place-items-center rounded-full ring-1",
                record ? "bg-running/15 text-running ring-running/30" : current ? "bg-primary text-primary-foreground ring-primary" : "bg-muted text-muted-foreground ring-border",
              )}
            >
              <Icon className="size-3.5" aria-hidden />
            </span>
            <div className="flex min-w-0 flex-1 items-baseline justify-between gap-2 pt-1 text-sm">
              <span className={cn("truncate", current && "font-medium", !record && !current && "text-muted-foreground")}>{step.label}</span>
              <span className="shrink-0 font-mono text-xs tabular text-muted-foreground">
                {actualMin !== null && (
                  <span className={cn(actualMin > step.plannedMin * 1.05 ? "text-held" : "text-foreground")}>{Math.round(actualMin)}′ / </span>
                )}
                {step.plannedMin}′
              </span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
