import { addWeeks, format } from "date-fns"
import type { Schedule } from "@/lib/proposal/schedule"
import { cn } from "@/lib/utils"

const TICKS = [0, 0.25, 0.5, 0.75, 1]

interface PlanGanttProps {
  schedule: Schedule
  /** Shows every scheduled phase; otherwise only the first. */
  expanded: boolean
}

export function PlanGantt({ schedule, expanded }: PlanGanttProps) {
  const { totalWeeks, phases } = schedule
  const origin = phases[0].start
  const offset = (week: number) => `${(week / totalWeeks) * 100}%`
  const rows = expanded ? phases : phases.slice(0, 1)

  return (
    <div>
      <div className="flex gap-3">
        <span className="w-28 shrink-0 sm:w-44" />
        <div className="relative h-5 flex-1 text-[11px] text-muted-foreground">
          {TICKS.map((fraction) => {
            const week = Math.round(totalWeeks * fraction)
            return (
              <span
                key={fraction}
                className={cn(
                  "absolute font-mono whitespace-nowrap tabular",
                  fraction === 1 ? "-translate-x-full" : fraction > 0 && "-translate-x-1/2",
                  fraction % 0.5 !== 0 && "max-sm:hidden",
                )}
                style={{ left: offset(week) }}
              >
                {format(addWeeks(origin, week), "d MMM")}
              </span>
            )
          })}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {rows.map(({ phase, weeks, startWeek }) => (
          <div key={phase.id} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-sm sm:w-44">
              <span className="font-mono text-xs text-muted-foreground">P{phase.id}</span> {phase.name}
            </span>
            <div className="relative h-8 flex-1 rounded-md bg-muted/40">
              {TICKS.map((fraction) => (
                <span key={fraction} className="absolute inset-y-0 w-px bg-border" style={{ left: offset(Math.round(totalWeeks * fraction)) }} />
              ))}
              <div
                className={cn(
                  "absolute inset-y-1 flex items-center rounded-[5px] px-2 text-[11px] font-medium whitespace-nowrap transition-[left,width] duration-300",
                  phase.optional ? "bg-primary/45 text-foreground" : "bg-primary text-primary-foreground",
                )}
                style={{ left: offset(startWeek), width: `calc(${offset(weeks)} - 2px)` }}
              >
                {weeks} wk
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
