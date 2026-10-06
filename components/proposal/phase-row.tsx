import { format } from "date-fns"
import { GlowCard } from "@/components/glow-card"
import { WeeksStepper } from "@/components/proposal/weeks-stepper"
import { Switch } from "@/components/ui/switch"
import type { Phase } from "@/lib/proposal/phases"
import type { ScheduledPhase } from "@/lib/proposal/schedule"
import { cn } from "@/lib/utils"

interface PhaseRowProps {
  phase: Phase
  weeks: number
  included: boolean
  /** Present only while the phase is part of the plan. */
  entry?: ScheduledPhase
  onWeeks: (weeks: number) => void
  onIncluded: (included: boolean) => void
}

const day = (date: Date) => format(date, "d MMM yyyy")

export function PhaseRow({ phase, weeks, included, entry, onWeeks, onIncluded }: PhaseRowProps) {
  const active = !phase.optional || included

  return (
    <GlowCard asChild index={phase.id}>
      <li className={cn("p-5 transition-opacity", !active && "opacity-60")}>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="min-w-0 flex-1 basis-56">
            <p className="font-mono text-xs text-muted-foreground">
              Phase {phase.id}
              {phase.optional && " · optional"}
            </p>
            <h4 className="font-medium">{phase.name}</h4>
            <p className="text-sm text-brand text-pretty">{phase.goal}</p>
          </div>
          <WeeksStepper phase={phase} weeks={weeks} disabled={!active} onChange={onWeeks} />
          <p className="w-60 text-sm tabular text-muted-foreground">{entry ? `${day(entry.start)} → ${day(entry.end)}` : "Not in your plan"}</p>
          {phase.optional && <Switch checked={included} onCheckedChange={onIncluded} aria-label={`Include ${phase.name}`} />}
        </div>
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-muted-foreground select-none hover:text-foreground">What this phase delivers</summary>
          <ul className="mt-2 flex list-disc flex-col gap-1 pl-5">
            {phase.deliverables.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <dl className="mt-3 grid gap-1.5 border-t pt-3 text-xs">
            {[
              ["Output", phase.output],
              ["Team", phase.team.join(", ")],
              ["Exit test", phase.exit],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </details>
      </li>
    </GlowCard>
  )
}
