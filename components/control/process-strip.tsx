"use client"

import { memo } from "react"
import { Panel } from "@/components/panel"
import { PanelTitle } from "@/components/panel-title"
import { Recipe } from "@/components/plant/icons/console-icons"
import { ANIMATED_STEP_ICON } from "@/components/plant/icons/step-icons"
import { STATUS_META } from "@/components/plant/status"
import { STEP_ICON, stepValue } from "@/components/plant/step-readout"
import { CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { plannedMinutes } from "@/lib/domain/catalog"
import type { MachineView, RecipeStep } from "@/lib/domain/types"
import { formatHm } from "@/lib/format"
import { cn } from "@/lib/utils"

interface RecipeBarProps {
  recipe: RecipeStep[]
  doneUpTo: number
  current: number
  progress: number
  color: string
}

/** One segment per step, as wide as its planned minutes. Memoised: it changes once per percent of step progress. */
const RecipeBar = memo(function RecipeBar({ recipe, doneUpTo, current, progress, color }: RecipeBarProps) {
  const total = plannedMinutes(recipe)
  return (
    <div className="flex h-9 w-full gap-0.5" role="img" aria-label={`Recipe progress, step ${doneUpTo + 1} of ${recipe.length}`}>
      {recipe.map((item, index) => {
        const fill = index < doneUpTo ? 1 : index === current ? progress : 0
        const Icon = STEP_ICON[item.kind]
        return (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "relative min-w-1 overflow-hidden rounded-md bg-muted/70 first:rounded-l-lg last:rounded-r-lg",
                  index === current && "ring-2 ring-foreground/60 ring-offset-1 ring-offset-background",
                )}
                style={{ flexGrow: item.plannedMin, flexBasis: 0 }}
              >
                <span className="absolute inset-y-0 left-0 transition-[width] duration-700" style={{ width: `${fill * 100}%`, backgroundColor: color, opacity: index < doneUpTo ? 0.55 : 0.9 }} />
                {item.plannedMin / total > 0.06 && <Icon className="absolute inset-0 m-auto size-4 text-foreground/80" aria-hidden />}
              </div>
            </TooltipTrigger>
            <TooltipContent className="text-xs">
              <p className="font-medium">
                {index + 1}. {item.label}
              </p>
              <p className="opacity-80">{item.plannedMin}′ planned</p>
            </TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
})

/**
 * The whole recipe on one line, each step as wide as its planned minutes, with the live step called out above it.
 * Answers "where is this batch and what comes next" without reading the step list.
 */
export function ProcessStrip({ view }: { view: MachineView }) {
  const recipe = view.batch?.recipe ?? []
  const total = plannedMinutes(recipe)
  const step = view.step
  const color = STATUS_META[view.status].color
  const doneUpTo = view.state.phase === "complete" ? recipe.length : (step?.index ?? 0)
  const StepIcon = step ? ANIMATED_STEP_ICON[step.step.kind] : null
  const leftMin = step ? Math.max(0, step.step.plannedMin - step.elapsedMin) : 0
  const next = step ? recipe[step.index + 1] : undefined

  return (
    <Panel>
      <CardHeader>
        <PanelTitle icon={Recipe}>Process</PanelTitle>
        <CardDescription>{total ? `${recipe.length} steps · ${formatHm(total)} planned` : "No recipe loaded"}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {step && StepIcon && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex min-w-0 items-center gap-4">
              <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand ring-1 ring-brand/25">
                <StepIcon className="size-10" />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  Step {step.index + 1} of {step.total}
                </p>
                <p className="truncate text-xl font-semibold">{step.step.label}</p>
                <p className="text-xs text-muted-foreground">{next ? `Then ${next.label}` : "Last step"}</p>
              </div>
            </div>
            <dl className="ml-auto grid grid-cols-3 gap-x-6 gap-y-1 text-right max-sm:ml-0 max-sm:w-full max-sm:text-left">
              <div>
                <dt className="text-xs text-muted-foreground">Live value</dt>
                <dd className="font-mono text-lg font-semibold tabular">{stepValue(view)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Step left</dt>
                <dd className="font-mono text-lg font-semibold tabular">{formatHm(leftMin)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Step done</dt>
                <dd className="font-mono text-lg font-semibold tabular">{Math.round(step.progress * 100)}%</dd>
              </div>
            </dl>
          </div>
        )}

        {total > 0 && (
          <RecipeBar recipe={recipe} doneUpTo={doneUpTo} current={step?.index ?? -1} progress={Math.round((step?.progress ?? 0) * 100) / 100} color={color} />
        )}
      </CardContent>
    </Panel>
  )
}
