"use client"

import { GlowCard } from "@/components/glow-card"
import { CycleRing } from "@/components/plant/cycle-ring"
import { excessTone } from "@/components/plant/excess"
import { ANIMATED_STEP_ICON } from "@/components/plant/icons/step-icons"
import { STATUS_META, StatusBadge } from "@/components/plant/status"
import { stepValue } from "@/components/plant/step-readout"
import type { MachineView } from "@/lib/domain/types"
import { formatClock, formatHm } from "@/lib/format"
import { cn } from "@/lib/utils"

/** Upcoming steps shown after the live one. */
const UPCOMING = 3

/** The machine and its live step at arm's length: big type, an animated step icon and what comes next. */
export function StepCard({ view }: { view: MachineView }) {
  const step = view.step
  const meta = STATUS_META[view.status]
  const Icon = step ? ANIMATED_STEP_ICON[step.step.kind] : null
  const upcoming = step && view.batch ? view.batch.recipe.slice(step.index + 1, step.index + 1 + UPCOMING) : []
  const leftMin = step ? Math.max(0, step.step.plannedMin - step.elapsedMin) : 0

  return (
    <GlowCard tone={meta.color} className="flex flex-col gap-5 bg-card/45 p-5">
      <div className="flex flex-wrap items-center gap-4">
        <CycleRing view={view} className="size-20 shrink-0">
          <span className="text-lg font-semibold tabular">{Math.round(view.cycleProgress * 100)}%</span>
        </CycleRing>
        <div className="mr-auto min-w-0">
          <p className="font-mono text-sm text-muted-foreground">
            {view.machine.id} · Bay {view.machine.bay}
          </p>
          <p className="truncate text-3xl font-semibold tracking-tight">{view.machine.name}</p>
          <p className="truncate text-sm text-muted-foreground">
            {view.machine.type} · {view.machine.capacityKg} kg
          </p>
        </div>
        <StatusBadge status={view.status} className="h-10 px-4 text-base" />
      </div>

      {step && Icon ? (
        <div className="flex flex-col gap-4 border-t pt-5">
          <div className="flex flex-wrap items-center gap-4">
            <span className="grid size-20 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand ring-1 ring-brand/25">
              <Icon className="size-12" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">
                Step {step.index + 1} of {step.total} · {formatHm(leftMin)} left
              </p>
              <p className="text-2xl font-semibold">{step.step.label}</p>
            </div>
            <p className="font-mono text-4xl font-semibold tabular max-[480px]:w-full">{stepValue(view)}</p>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div className={cn("h-full rounded-full transition-[width] duration-700", meta.solid)} style={{ width: `${step.progress * 100}%` }} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground" aria-label="Next steps">
              {upcoming.map((item, index) => (
                <li key={index} className="rounded-full bg-muted px-2.5 py-1">
                  {item.label} <span className="tabular opacity-70">{item.plannedMin}′</span>
                </li>
              ))}
              {!upcoming.length && <li>Last step</li>}
            </ol>
            <span className="tabular text-muted-foreground">
              Target {view.targetEndAt ? formatClock(view.targetEndAt) : "--"} · projected {view.projectedEndAt ? formatClock(view.projectedEndAt) : "--"}
              {view.excessMin > 0 && <span className={cn("ml-2 font-semibold", excessTone(view.excessMin))}>+{formatHm(view.excessMin)}</span>}
            </span>
          </div>
        </div>
      ) : (
        <p className="border-t pt-5 text-lg text-muted-foreground">{view.remark}</p>
      )}
    </GlowCard>
  )
}
