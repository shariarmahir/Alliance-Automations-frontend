import { format } from "date-fns"
import { PHASE_STATUS, weekDate } from "@/components/roadmap/phase-meta"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PHASES, PLAN_WEEKS, PROJECT_START } from "@/lib/roadmap"
import { cn } from "@/lib/utils"

const QUARTER_STARTS = [0, 13, 26, 39]
const weekOffset = (week: number) => `${(week / PLAN_WEEKS) * 100}%`

export function PlanCalendar() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>52-week plan</CardTitle>
        <CardDescription>
          Week 0 is {format(PROJECT_START, "d MMMM yyyy")}. Phases overlap where one team can start before the last one closes.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="flex gap-3">
            <span className="w-44 shrink-0" />
            <div className="relative h-5 flex-1 text-[11px] text-muted-foreground">
              {QUARTER_STARTS.map((week) => (
                <span key={week} className="absolute font-mono" style={{ left: weekOffset(week) }}>
                  W{week} · {weekDate(week)}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {PHASES.map((phase) => (
              <div key={phase.id} className="flex items-center gap-3">
                <span className="w-44 shrink-0 truncate text-sm">
                  <span className="font-mono text-xs text-muted-foreground">P{phase.id}</span> {phase.name}
                </span>
                <div className="relative h-8 flex-1 rounded-md bg-muted/40">
                  {QUARTER_STARTS.map((week) => (
                    <span key={week} className="absolute inset-y-0 w-px bg-border" style={{ left: weekOffset(week) }} />
                  ))}
                  <div
                    className={cn(
                      "absolute inset-y-1 flex items-center rounded-[5px] px-2 text-[11px] font-medium whitespace-nowrap",
                      PHASE_STATUS[phase.status].bar,
                      phase.status === "active" && "text-primary-foreground",
                    )}
                    style={{ left: weekOffset(phase.startWeek), width: weekOffset(phase.endWeek - phase.startWeek) }}
                  >
                    W{phase.startWeek}–{phase.endWeek}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
